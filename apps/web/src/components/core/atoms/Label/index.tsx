import { cn } from "@/lib/utils";
import { forwardRef, type LabelHTMLAttributes } from "react";

export const Label = forwardRef<HTMLLabelElement, LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn("text-sm font-medium text-muted-foreground", className)}
        {...props}
      />
    );
  },
);

Label.displayName = "Label";
