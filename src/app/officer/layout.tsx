import { RouteGuard } from "@/lib/auth/route-guard";
import { OfficerQueueProvider } from "@/lib/officer/queue-context";

export default function OfficerLayout({ children }: LayoutProps<"/officer">) {
  return (
    <RouteGuard role="officer">
      <OfficerQueueProvider>{children}</OfficerQueueProvider>
    </RouteGuard>
  );
}
