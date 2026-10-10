import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/core/molecules/Card";

type Fact = string | number | null | undefined | false;

interface RecordItemProps {
  icon: LucideIcon;
  title: ReactNode;
  badge?: ReactNode;
  /** Main facts, joined with " · " */
  meta: Fact[];
  /** Secondary facts and the note, joined with " · " */
  details?: Fact[];
  amount?: string;
  action?: ReactNode;
}

const joinParts = (parts: Fact[]) => parts.filter((p) => p !== null && p !== undefined && p !== false && p !== "").join(" · ");

/** History row shared by oil changes, parts and expenses */
export function RecordItem({ icon: Icon, title, badge, meta, details = [], amount, action }: RecordItemProps) {
  const metaText = joinParts(meta);
  const detailsText = joinParts(details);

  return (
    <Card className="flex items-start gap-3 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-muted">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h4 className="text-sm font-medium text-foreground break-words">{title}</h4>
          {badge}
        </div>
        {metaText && <p className="mt-1 text-xs text-muted-foreground">{metaText}</p>}
        {detailsText && <p className="mt-0.5 text-xs text-faint break-words">{detailsText}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-4">
        {amount && <span className="text-sm font-semibold text-foreground whitespace-nowrap">{amount}</span>}
        {action}
      </div>
    </Card>
  );
}
