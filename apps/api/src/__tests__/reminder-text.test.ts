import { describe, expect, it } from "vitest";
import type { Alert, ReminderStage } from "@vefy/shared";
import { reminderLine, reminderPushPayload } from "../lib/reminder-text";

function line(stage: ReminderStage, overrides: Partial<Alert>) {
  const alert: Alert = {
    type: "insurance",
    status: "warning",
    daysRemaining: 7,
    expiryDate: "2026-10-19",
    vehicleId: "v1",
    key: "k",
    ...overrides,
  };
  return reminderLine({ alert, stage });
}

describe("reminderLine", () => {
  it("describes document deadlines", () => {
    expect(line("week", {})).toBe("Bảo hiểm còn 7 ngày là hết hạn");
    expect(line("day", { type: "registration", daysRemaining: 1 })).toBe("Đăng kiểm hết hạn vào ngày mai");
    expect(line("day", { type: "warranty", daysRemaining: 0 })).toBe("Bảo hành xe hết hạn hôm nay");
    expect(line("overdue", { daysRemaining: -3, status: "danger" })).toBe("Bảo hiểm đã hết hạn 3 ngày");
  });

  it("names the part for part warranties", () => {
    expect(line("start", { type: "part_warranty", subject: "Lốp trước", daysRemaining: 30 })).toBe(
      "Bảo hành Lốp trước còn 30 ngày là hết hạn",
    );
  });

  it("describes oil changes by kind", () => {
    expect(line("start", { type: "oil_change", oilKind: "gear", daysRemaining: 14 })).toBe(
      "Nhớt láp còn khoảng 14 ngày đến hạn thay",
    );
    expect(line("overdue", { type: "oil_change", oilKind: "engine", daysRemaining: 0, status: "danger" })).toBe(
      "Nhớt động cơ đã đến hạn thay",
    );
  });
});

describe("reminderPushPayload", () => {
  const origin = "https://vefy.vercel.app";
  const reminder = (overrides: Partial<Alert>, stage: ReminderStage = "week") => ({
    alert: { type: "insurance", status: "warning", daysRemaining: 5, expiryDate: null, vehicleId: "v1", key: "k", ...overrides } as Alert,
    stage,
  });

  it("names the vehicle and keeps a single item generic", () => {
    expect(reminderPushPayload([{ vehicleId: "v1", vehicleName: "Car days", reminders: [reminder({})] }], origin)).toEqual({
      title: "Car days",
      body: "Bảo hiểm sắp hết hạn",
      url: "https://vefy.vercel.app/vehicle/v1/overview",
      tag: "vefy-reminders",
    });
  });

  it("counts several items of one vehicle", () => {
    const payload = reminderPushPayload(
      [{ vehicleId: "v1", vehicleName: "Car days", reminders: [reminder({}), reminder({ type: "warranty" }, "overdue")] }],
      origin,
    );
    expect(payload.body).toBe("Có 2 mục sắp đến hạn, xem chi tiết trong app");
    expect(payload.url).toBe("https://vefy.vercel.app/vehicle/v1/overview");
  });

  it("opens the grouped notifications list when several vehicles are due", () => {
    const payload = reminderPushPayload(
      [
        { vehicleId: "v1", vehicleName: "Car days", reminders: [reminder({})] },
        { vehicleId: "v2", vehicleName: "Vision", reminders: [reminder({ type: "oil_change", oilKind: "engine" })] },
      ],
      origin,
    );
    expect(payload).toMatchObject({ title: "Xe của bạn cần chú ý", body: "2 xe có giấy tờ hoặc bảo dưỡng sắp đến hạn" });
    expect(payload.url).toBe("https://vefy.vercel.app/garage?notifications=1");
  });

  it("phrases oil changes and overdue items", () => {
    const line = (r: ReturnType<typeof reminder>) =>
      reminderPushPayload([{ vehicleId: "v1", vehicleName: "X", reminders: [r] }], origin).body;
    expect(line(reminder({ type: "oil_change", oilKind: "gear" }))).toBe("Sắp đến hạn thay nhớt láp");
    expect(line(reminder({ type: "oil_change", oilKind: "engine", status: "danger" }, "overdue"))).toBe("Đã đến hạn thay nhớt động cơ");
    expect(line(reminder({ type: "warranty", status: "danger" }, "overdue"))).toBe("Bảo hành xe đã hết hạn");
  });
});
