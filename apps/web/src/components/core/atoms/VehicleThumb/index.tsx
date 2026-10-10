import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface VehicleThumbProps {
  imageUrl: string | null;
  alt: string;
  /** Rendered instead of the photo when the vehicle has none */
  fallback: ReactNode;
  className?: string;
}

export function VehicleThumb({ imageUrl, alt, fallback, className }: VehicleThumbProps) {
  if (!imageUrl) return <>{fallback}</>;
  return <img src={imageUrl} alt={alt} className={cn("h-12 w-12 shrink-0 rounded-xl object-cover", className)} />;
}
