import { VehicleShell } from "@/components/core/templates/VehicleShell";

// Tab pages only render client components that fetch through SWR, so each vehicle's shell
// can be rendered once and served statically. <Link> can then prefetch whole tabs, making
// tab switches instant instead of a server round trip per click.
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <VehicleShell>{children}</VehicleShell>;
}
