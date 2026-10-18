import type { Metadata } from "next";
import { DiscoveryLabsPage } from "@/components/portal/labs/lab-cards";
export const metadata: Metadata = { title: "Discovery labs" };
export default function LabsPage() { return <DiscoveryLabsPage />; }
