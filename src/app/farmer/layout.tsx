import { RouteGuard } from "@/lib/auth/route-guard";

export default function FarmerLayout({ children }: LayoutProps<"/farmer">) {
  return <RouteGuard role="farmer">{children}</RouteGuard>;
}
