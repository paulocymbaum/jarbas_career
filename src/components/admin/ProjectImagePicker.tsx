import { cn } from "@/lib/utils";
import type { AdminProjectImageOption } from "@/lib/admin-api";

type ProjectImagePickerProps = {
  images: AdminProjectImageOption[];
  value: string | null;
  onChange: (publicUrl: string) => void;
  className?: string;
};

export function ProjectImagePicker({ images, value, onChange, className }: ProjectImagePickerProps) {
  if (!images.length) return null;

  return (
    <div className={cn("grid grid-cols-2 gap-3 sm:grid-cols-3", className)}>
      {images.map((image) => {
        const selected = value === image.publicUrl;

        return (
          <button
            key={image.publicUrl}
            type="button"
            className={cn(
              "group relative overflow-hidden rounded-lg border bg-background text-left transition-colors",
              selected
                ? "border-primary ring-2 ring-primary/30"
                : "border-border hover:border-primary/40",
            )}
            onClick={() => onChange(image.publicUrl)}
            aria-pressed={selected}
            aria-label={`Use ${image.filename} as cover image`}
          >
            <div className="aspect-[16/10] overflow-hidden bg-muted/40">
              <img
                src={image.publicUrl}
                alt=""
                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
              />
            </div>
            <div className="space-y-0.5 border-t border-border px-2 py-1.5">
              <p className="truncate text-[11px] font-medium text-foreground">{image.filename}</p>
              {image.isCover ? (
                <p className="text-[10px] text-primary">Default cover</p>
              ) : null}
            </div>
          </button>
        );
      })}
    </div>
  );
}
