import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPortalLab } from "@/lib/labs/catalog";
import { LabWorkspace } from "@/components/portal/labs/lab-workspace";

type Props = { params: Promise<{ labId: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> { return { title: getPortalLab((await params).labId)?.title ?? "Lab unavailable" }; }
export default async function LabPage({ params }: Props) {
  const lab = getPortalLab((await params).labId);
  if (!lab) notFound();
  return <LabWorkspace key={lab.id} labId={lab.id} />;
}
