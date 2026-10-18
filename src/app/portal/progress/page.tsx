import type { Metadata } from "next";
import { ProgressPage } from "@/components/portal/portal-pages";
export const metadata: Metadata = { title: "My progress" };
export default function Page() { return <ProgressPage />; }
