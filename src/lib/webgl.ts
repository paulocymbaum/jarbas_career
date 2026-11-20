import * as THREE from "three";

type WebGLOptions = {
  alpha?: boolean;
  antialias?: boolean;
  powerPreference?: WebGLPowerPreference;
};

export function isWebGLAvailable(): boolean {
  if (typeof document === "undefined") return false;

  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: false })
        ?? canvas.getContext("webgl", { failIfMajorPerformanceCaveat: false })
        ?? canvas.getContext("experimental-webgl", { failIfMajorPerformanceCaveat: false }),
    );
  } catch {
    return false;
  }
}

export function createWebGLRenderer(options: WebGLOptions = {}): THREE.WebGLRenderer | null {
  const attempts: WebGLOptions[] = [
    {
      alpha: options.alpha,
      antialias: options.antialias ?? true,
      powerPreference: options.powerPreference ?? "high-performance",
    },
    {
      alpha: options.alpha,
      antialias: false,
      powerPreference: options.powerPreference ?? "high-performance",
    },
    {
      alpha: options.alpha ?? true,
      antialias: false,
      powerPreference: "default",
    },
  ];

  for (const attempt of attempts) {
    try {
      const renderer = new THREE.WebGLRenderer({
        antialias: attempt.antialias,
        alpha: attempt.alpha,
        powerPreference: attempt.powerPreference,
        failIfMajorPerformanceCaveat: false,
        preserveDrawingBuffer: false,
      });

      const context = renderer.getContext();
      if (!context) {
        renderer.dispose();
        continue;
      }

      return renderer;
    } catch {
      // Try the next, more compatible configuration.
    }
  }

  return null;
}

export function releaseWebGLRenderer(renderer: THREE.WebGLRenderer) {
  const context = renderer.getContext();
  const canvas = renderer.domElement;

  renderer.dispose();

  if (canvas.parentElement) {
    canvas.parentElement.removeChild(canvas);
  }

  const loseContext = context.getExtension("WEBGL_lose_context");
  loseContext?.loseContext();
}
