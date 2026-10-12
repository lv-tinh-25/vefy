import type { ReactNode } from "react";
import { Button } from "@/components/core/atoms/Button";
import { IconButton } from "@/components/core/atoms/IconButton";
import { Plus, X } from "lucide-react";

interface EntryRowProps {
  title: string;
  /** Omitted for the last remaining row, which can't be removed */
  onRemove?: () => void;
  removeLabel: string;
  children: ReactNode;
}

/** One item of a multi-row form (oil kinds, parts, other expenses) */
export function EntryRow({ title, onRemove, removeLabel, children }: EntryRowProps) {
  return (
    <div className="rounded-lg border border-border p-3 space-y-3">
      <div className="flex h-7 items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-faint">{title}</span>
        {onRemove && <IconButton icon={X} size="sm" label={removeLabel} onClick={onRemove} />}
      </div>
      {children}
    </div>
  );
}

export function AddRowButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button type="button" variant="outline" size="sm" onClick={onClick} className="w-full">
      <Plus className="h-4 w-4" />
      {label}
    </Button>
  );
}
