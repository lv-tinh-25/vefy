import type { Metadata } from "next";
import { AccountContent } from "@/components/core/templates/Account";

export const metadata: Metadata = {
  title: "Tài khoản",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return <AccountContent />;
}
