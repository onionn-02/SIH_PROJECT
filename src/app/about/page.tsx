import { PageHeader } from "@/components/shared/page-header";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <PageHeader
        title="About"
        description="A mobile-first procurement tracking system that gives farmers clear schedule, token and queue status information, and gives procurement officers a simple daily queue workflow."
      />
    </div>
  );
}
