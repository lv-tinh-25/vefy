import type { DueReminder, OilKind } from "@vefy/shared";

// Server-side copy of the Vietnamese labels: reminders go out from a cron job with no browser locale
const OIL_KINDS: Record<OilKind, string> = {
  engine: "Nhớt động cơ",
  transmission: "Dầu hộp số",
  brake: "Dầu phanh",
  power_steering: "Dầu trợ lực lái",
  differential: "Dầu cầu",
  gear: "Nhớt láp",
};

function subject({ alert }: DueReminder): string {
  switch (alert.type) {
    case "warranty":
      return "Bảo hành xe";
    case "registration":
      return "Đăng kiểm";
    case "insurance":
      return "Bảo hiểm";
    case "part_warranty":
      return `Bảo hành ${alert.subject ?? "phụ tùng"}`;
    case "oil_change":
      return OIL_KINDS[alert.oilKind ?? "engine"];
  }
}

function status({ alert, stage }: DueReminder): string {
  const days = alert.daysRemaining ?? 0;
  if (alert.type === "oil_change") {
    if (stage === "overdue") return "đã đến hạn thay";
    if (days === 0) return "cần thay hôm nay";
    if (days === 1) return "cần thay vào ngày mai";
    return `còn khoảng ${days} ngày đến hạn thay`;
  }
  if (stage === "overdue") return `đã hết hạn ${Math.abs(days)} ngày`;
  if (days === 0) return "hết hạn hôm nay";
  if (days === 1) return "hết hạn vào ngày mai";
  return `còn ${days} ngày là hết hạn`;
}

/** Short, generic push line, e.g. "Bảo hiểm sắp hết hạn"; the app and the email carry the details */
export function reminderPushLine({ alert, stage }: DueReminder): string {
  if (alert.type === "oil_change") {
    const kind = OIL_KINDS[alert.oilKind ?? "engine"].toLowerCase();
    return stage === "overdue" ? `Đã đến hạn thay ${kind}` : `Sắp đến hạn thay ${kind}`;
  }
  return `${subject({ alert, stage })} ${stage === "overdue" ? "đã hết hạn" : "sắp hết hạn"}`;
}

/** e.g. "Bảo hiểm còn 7 ngày là hết hạn" */
export function reminderLine(reminder: DueReminder): string {
  return `${subject(reminder)} ${status(reminder)}`;
}

export interface VehicleReminders {
  vehicleId: string;
  vehicleName: string;
  reminders: DueReminder[];
}

// The OS already shows the app name, so the title is the vehicle and the body stays short
export function reminderPushPayload(groups: VehicleReminders[], origin: string) {
  const tag = "vefy-reminders";
  if (groups.length > 1) {
    return {
      title: "Xe của bạn cần chú ý",
      body: `${groups.length} xe có giấy tờ hoặc bảo dưỡng sắp đến hạn`,
      // Opens the notifications list, grouped by vehicle
      url: `${origin}/garage?notifications=1`,
      tag,
    };
  }
  const [group] = groups;
  return {
    title: group.vehicleName,
    body:
      group.reminders.length === 1
        ? reminderPushLine(group.reminders[0])
        : `Có ${group.reminders.length} mục sắp đến hạn, xem chi tiết trong app`,
    url: `${origin}/vehicle/${group.vehicleId}/overview`,
    tag,
  };
}
