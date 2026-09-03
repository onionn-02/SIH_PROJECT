import { OfficerQueueProvider } from "@/lib/officer/queue-context";

export default function OfficerLayout({ children }: LayoutProps<"/officer">) {
  return <OfficerQueueProvider>{children}</OfficerQueueProvider>;
}
