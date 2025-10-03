import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng ký",
  description: "Tạo tài khoản Vefy miễn phí để theo dõi bảo hành, giấy tờ, nhớt và phụ tùng cho xe của bạn.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
