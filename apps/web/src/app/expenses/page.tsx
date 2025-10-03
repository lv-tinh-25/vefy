import type { Metadata } from "next";
import { ExpensesContent } from "@/components/core/templates/Expenses";

export const metadata: Metadata = {
  title: "Chi phí",
  robots: { index: false, follow: false },
};

export default function ExpensesPage() {
  return <ExpensesContent />;
}
