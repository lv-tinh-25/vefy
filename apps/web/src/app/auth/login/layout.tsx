import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng nhập",
  description: "Đăng nhập Vefy để quản lý xe ô tô, xe máy: bảo hành, giấy tờ, lịch thay nhớt và chi phí.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
