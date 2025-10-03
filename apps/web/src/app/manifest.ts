import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Vefy - Quản lý xe cá nhân",
    short_name: "Vefy",
    description: "Theo dõi bảo hành, giấy tờ, nhớt và phụ tùng cho ô tô và xe máy",
    start_url: "/garage",
    display: "standalone",
    background_color: "#080b12",
    theme_color: "#00d4aa",
    lang: "vi",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
