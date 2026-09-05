import { RouteGuard } from "@/lib/auth/route-guard";

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return <RouteGuard role="admin">{children}</RouteGuard>;
}
