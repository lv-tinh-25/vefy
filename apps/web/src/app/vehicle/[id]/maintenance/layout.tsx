import { MaintenanceShell } from "@/components/core/templates/MaintenanceShell";

export default function MaintenanceLayout({ children }: { children: React.ReactNode }) {
  return <MaintenanceShell>{children}</MaintenanceShell>;
}
