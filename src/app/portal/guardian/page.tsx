import type { Metadata } from "next";
import { GuardianPage } from "@/components/portal/portal-pages";
export const metadata: Metadata = { title: "For a grown-up" };
export default function Page() { return <GuardianPage />; }
