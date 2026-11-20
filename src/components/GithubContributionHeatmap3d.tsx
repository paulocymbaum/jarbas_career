import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Body, Box, ContactMaterial, Material, NaiveBroadphase, Vec3, World } from "cannon-es";
import type { GithubActivitySnapshot } from "@/content/types";
import {
  barLevelColor,
  contributionHeight,
  contributionLevel,
  flattenWeeks,
  levelColor,
  monthLabelsForWeeks,
  recentWeeks,
  yearLabelsForWeeks,
  type HeatmapCell,
} from "@/lib/github-heatmap";
import { trackGithubNavigation } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { createWebGLRenderer, isWebGLAvailable, releaseWebGLRenderer } from "@/lib/webgl";
import { useTheme } from "@/hooks/use-theme";

const WEEKS_IN_SECTION = 26;
const WEEKS_IN_HERO = 20;
const HERO_RENDER_SCALE = 1;
const HERO_MAX_DPR = 1;
const HERO_SCENE_SCALE = 1.45;
const HERO_CAMERA_DISTANCE = 10.5;
const CELL_GAP = 0.34;
const DROP_HEIGHT = 5;
const BASE_TILE_HEIGHT = 0.04;
const BAR_LIFT = 0.02;
const HERO_BAR_HEIGHT_SCALE = 1.55;
const SETTLE_SPEED = 0.12;
const SETTLE_Y_EPS = 0.2;

type BlockTarget = {
  x: number;
  y: number;
  z: number;
};

type GithubContributionHeatmap3dProps = {
  activity: GithubActivitySnapshot;
  className?: string;
  variant?: "section" | "hero";
  onUnavailable?: () => void;
};

function hexColor(hex: string) {
  return new THREE.Color().setStyle(hex);
}

function heroBarMaterial(color: string) {
  return new THREE.MeshBasicMaterial({
    color: hexColor(color),
    toneMapped: false,
  });
}

function createTextSprite(
  text: string,
  dark: boolean,
  options: { scale?: number; emphasis?: boolean; compact?: boolean } = {},
) {
  const scale = options.scale ?? 1;
  const emphasis = options.emphasis ?? false;
  const compact = options.compact ?? false;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const fontSize = emphasis ? (compact ? 26 : 36) : compact ? 22 : 32;
  const fontWeight = emphasis ? "700" : "600";
  ctx.font = `${fontWeight} ${fontSize}px system-ui, sans-serif`;
  const width = Math.ceil(ctx.measureText(text).width) + 24;
  canvas.width = width;
  canvas.height = 48;

  ctx.font = `${fontWeight} ${fontSize}px system-ui, sans-serif`;
  ctx.fillStyle = dark ? "rgba(2, 6, 23, 0.78)" : "rgba(255, 255, 255, 0.92)";
  ctx.fillRect(0, 0, width, canvas.height);

  ctx.fillStyle = emphasis
    ? dark
      ? "#f8fafc"
      : "#020617"
    : dark
      ? "#e2e8f0"
      : "#1e293b";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, width / 2, 26);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
    fog: false,
  });
  const sprite = new THREE.Sprite(material);
  const heightScale = emphasis ? 0.26 : 0.22;
  sprite.scale.set((width / 48) * heightScale * scale, heightScale * scale, 1);
  sprite.renderOrder = emphasis ? 11 : 10;
  return { sprite, texture, material };
}

export function GithubContributionHeatmap3d({
  activity,
  className,
  variant = "section",
  onUnavailable,
}: GithubContributionHeatmap3dProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<HeatmapCell | null>(null);
  const { theme } = useTheme();
  const isHero = variant === "hero";
  const dark = theme === "dark";

  const displayWeeks = useMemo(() => {
    if (!activity.weeks.length) return [];
    const weekCount = isHero ? WEEKS_IN_HERO : WEEKS_IN_SECTION;
    return recentWeeks(activity.weeks, weekCount);
  }, [activity.weeks, isHero]);

  const cells = useMemo(() => flattenWeeks(displayWeeks), [displayWeeks]);
  const activeCells = useMemo(() => cells.filter((cell) => cell.count > 0), [cells]);
  const monthLabels = useMemo(() => monthLabelsForWeeks(displayWeeks), [displayWeeks]);
  const yearLabels = useMemo(() => yearLabelsForWeeks(displayWeeks), [displayWeeks]);

  const isEmpty = activity.weeks.length === 0;

  useEffect(() => {
    const container = containerRef.current;
    if (!container || isEmpty || !cells.length) return;

    if (!isWebGLAvailable()) {
      onUnavailable?.();
      return;
    }

    let cancelled = false;
    let sceneCleanup: (() => void) | undefined;
    let started = false;

    const start = () => {
      if (cancelled || started) return;

      const { clientWidth, clientHeight } = container;
      if (clientWidth < 1 || clientHeight < 1) return;

      let renderer: THREE.WebGLRenderer;
      try {
        const created = createWebGLRenderer({
          alpha: isHero,
          antialias: !isHero,
          powerPreference: isHero ? "high-performance" : "default",
        });
        if (!created) {
          onUnavailable?.();
          return;
        }
        renderer = created;
      } catch (error) {
        console.error("GitHub 3D heatmap unavailable:", error);
        onUnavailable?.();
        return;
      }

      started = true;

    const weekCount = Math.max(...cells.map((cell) => cell.weekIndex)) + 1;
    const gridWidth = weekCount * CELL_GAP;
    const gridDepth = 7 * CELL_GAP;
    const offsetX = -gridWidth / 2;
    const offsetZ = -gridDepth / 2;
    const tileSize = CELL_GAP * 0.88;

    const cellPosition = (cell: HeatmapCell) => ({
      x: offsetX + cell.weekIndex * CELL_GAP + CELL_GAP / 2,
      z: offsetZ + cell.weekday * CELL_GAP + CELL_GAP / 2,
    });

    const scene = new THREE.Scene();
    if (!isHero) {
      scene.background = new THREE.Color(dark ? 0x0f172a : 0xf8fafc);
      scene.fog = new THREE.Fog(scene.background.getHex(), 12, 28);
    }

    const camera = new THREE.PerspectiveCamera(isHero ? 46 : 42, 1, 0.1, 100);
    camera.position.set(
      gridWidth * (isHero ? 0.62 : 0.55),
      isHero ? 16 : 9,
      gridDepth * (isHero ? 2.1 : 1.35),
    );

      renderer.setPixelRatio(isHero ? HERO_MAX_DPR : Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = !isHero;
      if (isHero) {
        renderer.setClearColor(0x000000, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.NoToneMapping;
      }

      Object.assign(renderer.domElement.style, {
        display: "block",
        position: "absolute",
        inset: "0",
        width: "100%",
        height: "100%",
      });
      container.appendChild(renderer.domElement);

      const onContextLost = (event: Event) => {
        event.preventDefault();
        sceneCleanup?.();
        sceneCleanup = undefined;
        started = false;
        onUnavailable?.();
      };
      renderer.domElement.addEventListener("webglcontextlost", onContextLost, false);

      const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2.15;
    controls.minDistance = isHero ? 6 : 4;
    controls.maxDistance = isHero ? 18 : 22;
    controls.target.set(0, isHero ? -0.6 : 1.2, 0);
    controls.autoRotate = !isHero;
    controls.autoRotateSpeed = isHero ? 0.3 : 0.35;
    controls.enablePan = true;
    controls.enableZoom = !isHero;
    controls.enableRotate = !isHero;

    if (isHero) {
      controls.mouseButtons = {
        LEFT: THREE.MOUSE.PAN,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.ROTATE,
      };
      controls.touches = {
        ONE: THREE.TOUCH.PAN,
        TWO: THREE.TOUCH.DOLLY_ROTATE,
      };
    }

    const contentGroup = new THREE.Group();
    if (isHero) {
      contentGroup.scale.setScalar(HERO_SCENE_SCALE);
    }
    scene.add(contentGroup);

    if (isHero) {
      const heroTarget = new THREE.Vector3(0, -0.6, 0);
      controls.target.copy(heroTarget);
      camera.position.setFromSphericalCoords(HERO_CAMERA_DISTANCE, 1.14, -0.7).add(heroTarget);
      controls.update();
    }

    if (isHero) {
      const heroAmbient = new THREE.AmbientLight(0xffffff, dark ? 0.9 : 1);
      scene.add(heroAmbient);
    } else {
      const ambient = new THREE.AmbientLight(dark ? 0x64748b : 0xffffff, dark ? 0.55 : 0.75);
      scene.add(ambient);

      const keyLight = new THREE.DirectionalLight(0xffffff, dark ? 0.85 : 1);
      keyLight.position.set(6, 12, 8);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      scene.add(keyLight);

      const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.35);
      fillLight.position.set(-8, 4, -6);
      scene.add(fillLight);
    }

    let floorGeo: THREE.PlaneGeometry | null = null;
    let floorMat: THREE.MeshStandardMaterial | null = null;

    if (!isHero) {
      floorGeo = new THREE.PlaneGeometry(gridWidth + 4, gridDepth + 4);
      floorMat = new THREE.MeshStandardMaterial({
        color: dark ? 0x1e293b : 0xe2e8f0,
        metalness: 0.05,
        roughness: 0.9,
      });
      const floorMesh = new THREE.Mesh(floorGeo, floorMat);
      floorMesh.rotation.x = -Math.PI / 2;
      floorMesh.position.y = -0.02;
      floorMesh.receiveShadow = true;
      scene.add(floorMesh);
    }

    const usePhysics = !isHero;
    let world: World | null = null;

    if (usePhysics) {
      world = new World({ gravity: new Vec3(0, -22, 0) });
      world.broadphase = new NaiveBroadphase();
      world.allowSleep = true;
    }

    const staticMaterial = usePhysics ? new Material({ friction: 0.8, restitution: 0 }) : null;
    const dynamicMaterial = usePhysics ? new Material({ friction: 0.85, restitution: 0.02 }) : null;

    if (usePhysics && world && staticMaterial) {
      const floorBody = new Body({
        mass: 0,
        material: staticMaterial,
        shape: new Box(new Vec3((gridWidth + 2) / 2, 0.08, (gridDepth + 2) / 2)),
      });
      floorBody.position.set(0, -0.04, 0);
      world.addBody(floorBody);
    }

    const baseGeometry = new THREE.BoxGeometry(tileSize, BASE_TILE_HEIGHT, tileSize);
    const baseMaterial = isHero
      ? new THREE.MeshBasicMaterial({
          color: hexColor(levelColor(0, dark)),
          toneMapped: false,
        })
      : new THREE.MeshStandardMaterial({
          color: hexColor(levelColor(0, dark)),
          metalness: 0.05,
          roughness: 0.92,
        });
    const baseMesh = new THREE.InstancedMesh(baseGeometry, baseMaterial, cells.length);
    baseMesh.receiveShadow = true;
    const baseMatrix = new THREE.Matrix4();
    const edgeGeometries: THREE.BufferGeometry[] = [];
    const edgeMaterials: THREE.Material[] = [];

    cells.forEach((cell, index) => {
      const { x, z } = cellPosition(cell);
      baseMatrix.makeTranslation(x, BASE_TILE_HEIGHT / 2, z);
      baseMesh.setMatrixAt(index, baseMatrix);
    });
    baseMesh.instanceMatrix.needsUpdate = true;
    contentGroup.add(baseMesh);

    const labelAssets: { texture: THREE.CanvasTexture; material: THREE.SpriteMaterial }[] = [];
    const labelScale = isHero ? 1.15 : 1;

    for (const year of yearLabels) {
      const label = createTextSprite(year.label, dark, {
        scale: labelScale,
        emphasis: true,
        compact: isHero,
      });
      if (!label) continue;
      const x = offsetX + year.weekIndex * CELL_GAP + CELL_GAP * 1.6;
      const z = offsetZ - CELL_GAP * 2.35;
      label.sprite.position.set(x, isHero ? 0.55 : 0.2, z);
      contentGroup.add(label.sprite);
      labelAssets.push({ texture: label.texture, material: label.material });
    }

    for (const month of monthLabels) {
      const label = createTextSprite(month.label, dark, { scale: labelScale, compact: isHero });
      if (!label) continue;
      const x = offsetX + month.weekIndex * CELL_GAP + CELL_GAP * 1.6;
      const z = offsetZ - CELL_GAP * 1.1;
      label.sprite.position.set(x, isHero ? 0.42 : 0.14, z);
      contentGroup.add(label.sprite);
      labelAssets.push({ texture: label.texture, material: label.material });
    }

    const meshes: THREE.Mesh[] = [];
    const bodies: Body[] = [];
    const targets: BlockTarget[] = [];
    const settled: boolean[] = [];
    const cellByMesh = new Map<THREE.Mesh, HeatmapCell>();
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    if (isHero && activeCells.length > 0) {
      for (const cell of activeCells) {
        const level = contributionLevel(cell.count);
        const height = contributionHeight(cell.count) * HERO_BAR_HEIGHT_SCALE;
        const size = CELL_GAP * 0.64;
        const { x, z } = cellPosition(cell);
        const targetY = BASE_TILE_HEIGHT + BAR_LIFT + height / 2;

        const geometry = new THREE.BoxGeometry(size, height, size);
        const mesh = new THREE.Mesh(geometry, heroBarMaterial(barLevelColor(level, dark)));
        mesh.position.set(x, targetY, z);
        mesh.renderOrder = 2;
        contentGroup.add(mesh);
        meshes.push(mesh);
      }
    } else if (!isHero) {
      for (const cell of activeCells) {
        const level = contributionLevel(cell.count);
        const height = contributionHeight(cell.count);
        const size = CELL_GAP * 0.64;
        const { x, z } = cellPosition(cell);
        const targetY = BASE_TILE_HEIGHT + BAR_LIFT + height / 2;

        const geometry = new THREE.BoxGeometry(size, height, size);
        const material = new THREE.MeshStandardMaterial({
          color: hexColor(barLevelColor(level, dark)),
          metalness: 0.15,
          roughness: 0.45,
          emissive: hexColor(barLevelColor(level, dark)),
          emissiveIntensity: dark ? 0.12 : 0.06,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        if (usePhysics && world && dynamicMaterial) {
          mesh.position.set(x, DROP_HEIGHT + level * 0.35, z);

          const body = new Body({
            mass: 0.5 + level * 0.1,
            material: dynamicMaterial,
            shape: new Box(new Vec3(size / 2, height / 2, size / 2)),
            linearDamping: 0.25,
            angularDamping: 0.9,
            fixedRotation: true,
          });
          body.position.set(x, DROP_HEIGHT + level * 0.35, z);

          world.addBody(body);
          bodies.push(body);
          targets.push({ x, y: targetY, z });
          settled.push(false);
        } else {
          mesh.position.set(x, targetY, z);
        }

        contentGroup.add(mesh);
        meshes.push(mesh);
        cellByMesh.set(mesh, cell);
      }
    }

    if (usePhysics && world && staticMaterial && dynamicMaterial) {
      world.addContactMaterial(
        new ContactMaterial(staticMaterial, dynamicMaterial, {
          friction: 0.9,
          restitution: 0,
        }),
      );
    }

    let hoveredMesh: THREE.Mesh | null = null;
    let animationId = 0;
    let allSettled = false;

    function snapBody(index: number) {
      const body = bodies[index];
      const target = targets[index];
      body.velocity.set(0, 0, 0);
      body.angularVelocity.set(0, 0, 0);
      body.position.set(target.x, target.y, target.z);
      body.quaternion.set(0, 0, 0, 1);
      body.type = Body.STATIC;
      settled[index] = true;
    }

    function trySettle(index: number) {
      if (settled[index]) return;
      const body = bodies[index];
      const target = targets[index];
      const speed = Math.hypot(body.velocity.x, body.velocity.y, body.velocity.z);
      const yClose = Math.abs(body.position.y - target.y) < SETTLE_Y_EPS;
      const xzClose =
        Math.abs(body.position.x - target.x) < 0.08 && Math.abs(body.position.z - target.z) < 0.08;

      if ((speed < SETTLE_SPEED && yClose && xzClose) || body.position.y <= target.y + SETTLE_Y_EPS) {
        snapBody(index);
      }
    }

    function resize() {
      if (!container) return;
      const { clientWidth, clientHeight } = container;
      if (!clientWidth || !clientHeight) return;
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();

      const renderScale = isHero ? HERO_RENDER_SCALE : 1;
      const renderWidth = Math.max(1, Math.floor(clientWidth * renderScale));
      const renderHeight = Math.max(1, Math.floor(clientHeight * renderScale));
      renderer.setSize(renderWidth, renderHeight, false);
      renderer.domElement.style.width = `${clientWidth}px`;
      renderer.domElement.style.height = `${clientHeight}px`;
    }

    function onPointerMove(event: PointerEvent) {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(meshes, false);
      const next = hits[0]?.object instanceof THREE.Mesh ? hits[0].object : null;

      if (hoveredMesh !== next) {
        if (hoveredMesh) hoveredMesh.scale.set(1, 1, 1);
        hoveredMesh = next;
        if (hoveredMesh) hoveredMesh.scale.set(1.08, 1.08, 1.08);
        setHovered(next ? (cellByMesh.get(next) ?? null) : null);
      }
    }

    function onPointerLeave() {
      if (hoveredMesh) hoveredMesh.scale.set(1, 1, 1);
      hoveredMesh = null;
      setHovered(null);
    }

    function animate() {
      if (usePhysics && world && !allSettled) {
        world.step(1 / 60);
        for (let i = 0; i < bodies.length; i += 1) {
          trySettle(i);
        }
        allSettled = settled.every(Boolean);
      }

      if (usePhysics) {
        for (let i = 0; i < meshes.length; i += 1) {
          const body = bodies[i];
          meshes[i].position.set(body.position.x, body.position.y, body.position.z);
          meshes[i].quaternion.set(
            body.quaternion.x,
            body.quaternion.y,
            body.quaternion.z,
            body.quaternion.w,
          );
        }
      }

      controls.update();
      renderer.render(scene, camera);
      animationId = window.requestAnimationFrame(animate);
    }

    resize();
    animate();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    if (!isHero) {
      renderer.domElement.addEventListener("pointermove", onPointerMove);
      renderer.domElement.addEventListener("pointerleave", onPointerLeave);
    }

      sceneCleanup = () => {
        window.cancelAnimationFrame(animationId);
        resizeObserver.disconnect();
        renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
        if (!isHero) {
          renderer.domElement.removeEventListener("pointermove", onPointerMove);
          renderer.domElement.removeEventListener("pointerleave", onPointerLeave);
        }
        controls.dispose();
        releaseWebGLRenderer(renderer);
        floorGeo?.dispose();
        floorMat?.dispose();
        baseGeometry.dispose();
        baseMaterial.dispose();
        baseMesh.geometry.dispose();
        (baseMesh.material as THREE.Material).dispose();
        for (const asset of labelAssets) {
          asset.texture.dispose();
          asset.material.dispose();
        }
        for (const geometry of edgeGeometries) {
          geometry.dispose();
        }
        for (const material of edgeMaterials) {
          material.dispose();
        }
        for (const mesh of meshes) {
          mesh.geometry.dispose();
          (mesh.material as THREE.Material).dispose();
        }
      };
    };

    const layoutObserver = new ResizeObserver(() => start());
    layoutObserver.observe(container);
    requestAnimationFrame(() => start());

    return () => {
      cancelled = true;
      layoutObserver.disconnect();
      sceneCleanup?.();
    };
  }, [activeCells, cells, dark, isEmpty, isHero, monthLabels, onUnavailable, yearLabels]);

  if (isEmpty) {
    if (isHero) return null;
    return (
      <p className="text-sm text-muted-foreground">
        GitHub activity will appear here after the next sync.
      </p>
    );
  }

  if (isHero) {
    return (
      <div
        ref={containerRef}
        className={cn("relative isolate h-full w-full touch-none", className)}
        role="img"
        aria-label={`3D GitHub contribution heatmap for ${activity.username}`}
      />
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">
            {activity.totalContributions.toLocaleString()} contributions
            {activity.from && activity.to ? ` · ${activity.from} → ${activity.to}` : null}
            {activity.includesPrivateContributions ? " · includes private repos" : null}
            {" · "}
            <span className="text-foreground/80">
              3D experiment (last {isHero ? WEEKS_IN_HERO : WEEKS_IN_SECTION} weeks)
            </span>
          </p>
          {hovered ? (
            <p className="mt-1 text-xs text-foreground">
              <span className="font-medium">{hovered.count}</span> contribution
              {hovered.count === 1 ? "" : "s"} on{" "}
              <span className="font-medium">
                {new Date(`${hovered.date}T12:00:00Z`).toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </p>
          ) : (
            <p className="mt-1 text-xs text-muted-foreground">
              Drag to orbit · scroll to zoom · hover an active block for details
            </p>
          )}
        </div>
        <a
          href={`https://github.com/${activity.username}`}
          className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
          rel="noopener noreferrer"
          target="_blank"
          data-analytics-id="activity-heatmap-3d-github-profile"
          onClick={(event) =>
            trackGithubNavigation(
              `https://github.com/${activity.username}`,
              "activity_heatmap_3d",
              event,
            )
          }
        >
          @{activity.username}
        </a>
      </div>

      <div
        ref={containerRef}
        className="h-[min(28rem,70vh)] w-full overflow-hidden rounded-xl border border-border bg-muted/20"
        role="img"
        aria-label={`3D GitHub contribution heatmap for ${activity.username}`}
      />
    </div>
  );
}
