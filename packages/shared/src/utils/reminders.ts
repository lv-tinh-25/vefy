import type { Alert } from "./alerts";

/** Ordered from earliest to most urgent; each alert is reminded at most once per stage */
export const REMINDER_STAGES = ["start", "week", "day", "overdue"] as const;
export type ReminderStage = (typeof REMINDER_STAGES)[number];

export function reminderStage(alert: Alert): ReminderStage | null {
  if (alert.daysRemaining === null) return null;
  // Oil predictions bottom out at 0 days, so "overdue" comes from the status, not a negative count
  if (alert.status === "danger") return "overdue";
  if (alert.status !== "warning") return null;
  if (alert.daysRemaining <= 1) return "day";
  if (alert.daysRemaining <= 7) return "week";
  return "start";
}

export interface DueReminder {
  alert: Alert;
  stage: ReminderStage;
}

/**
 * Alerts whose current stage hasn't been sent yet. Only the current stage counts, so a missed
 * day never triggers a burst of stages that have already passed.
 */
export function selectDueReminders(
  alerts: Alert[],
  dismissedKeys: ReadonlySet<string>,
  sentStages: ReadonlySet<string>,
): DueReminder[] {
  return alerts.flatMap((alert) => {
    if (dismissedKeys.has(alert.key)) return [];
    const stage = reminderStage(alert);
    if (!stage || sentStages.has(reminderLogKey(alert.key, stage))) return [];
    return [{ alert, stage }];
  });
}

export function reminderLogKey(alertKey: string, stage: ReminderStage): string {
  return `${alertKey}|${stage}`;
}
