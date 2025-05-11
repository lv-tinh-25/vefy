"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { resizeImageToDataUrl } from "@/lib/image-utils";
import { Camera, X, Loader2, User } from "lucide-react";

interface AvatarUploadProps {
  /** Current image (URL from DB or base64 preview) */
  value: string;
  /** Called with base64 data URL for preview, or "" to clear */
  onChange: (value: string) => void;
  name?: string;
  size?: "md" | "lg";
  /** Always show camera overlay (no hover needed) — use in edit forms */
  alwaysShowOverlay?: boolean;
}

const sizeMap = { md: "h-20 w-20", lg: "h-24 w-24" };
const iconSizeMap = { md: "h-5 w-5", lg: "h-6 w-6" };
const initialSizeMap = { md: "text-xl", lg: "text-2xl" };

export function AvatarUpload({
  value,
  onChange,
  name,
  size = "md",
  alwaysShowOverlay = false,
}: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const initial = name?.charAt(0)?.toUpperCase();
  const hasImage = !!value;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      // Resize locally — NO upload yet, just preview
      const dataUrl = await resizeImageToDataUrl(file, 200);
      onChange(dataUrl);
    } catch {
      // Silently fail
    } finally {
      setIsProcessing(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="relative group inline-block">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative rounded-full overflow-hidden border-2 transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          sizeMap[size],
          hasImage
            ? "border-border"
            : "border-dashed border-border hover:border-primary/50",
        )}
      >
        {hasImage ? (
          <img src={value} alt="Avatar" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-primary/10 flex items-center justify-center">
            {initial ? (
              <span className={cn("font-semibold text-primary", initialSizeMap[size])}>
                {initial}
              </span>
            ) : (
              <User className={cn("text-faint", iconSizeMap[size])} />
            )}
          </div>
        )}

        {!isProcessing && (
          <div className={cn(
            "absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200",
            alwaysShowOverlay ? "opacity-100" : "opacity-0 group-hover:opacity-100",
          )}>
            <Camera className={cn("text-white", iconSizeMap[size])} />
          </div>
        )}

        {isProcessing && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <Loader2 className={cn("text-white animate-spin", iconSizeMap[size])} />
          </div>
        )}
      </button>

      {hasImage && !isProcessing && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onChange("");
          }}
          className={cn(
            "absolute -top-1 -right-1 h-6 w-6 rounded-full bg-elevated border border-border flex items-center justify-center text-muted-foreground hover:text-danger hover:border-danger/50 transition-colors cursor-pointer",
            alwaysShowOverlay ? "opacity-100" : "opacity-0 group-hover:opacity-100",
          )}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
