import { PageHeader } from "@/components/shared/page-header";

export default async function ProcurementDetailsPage({
  params,
}: PageProps<"/farmer/procurement/[id]">) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <PageHeader
        title={`Procurement Details — ${id}`}
        description="Full status timeline, token and center details will be implemented on Day 2."
      />
    </div>
  );
}
