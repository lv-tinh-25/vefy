import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const alt = "Vefy - Quản lý xe cá nhân";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const icon = await readFile(path.join(process.cwd(), "src/app/icon.svg"));
  const iconSrc = `data:image/svg+xml;base64,${icon.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 64,
          padding: "0 96px",
          background: "linear-gradient(135deg, #080b12 0%, #0f1b2a 100%)",
          color: "#e8fffa",
        }}
      >
        <img src={iconSrc} width={280} height={280} alt="" style={{ borderRadius: 64 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 112, fontWeight: 700, color: "#00d4aa", letterSpacing: -2 }}>Vefy</div>
          {/* Two fixed lines so compound words (e.g. "bảo hành") never wrap apart */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 44, lineHeight: 1.25 }}>
            <span>Quản lý ô tô & xe máy</span>
            <span style={{ color: "#9fb3c8", fontSize: 36 }}>Bảo hành · Giấy tờ · Nhớt · Chi phí</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
