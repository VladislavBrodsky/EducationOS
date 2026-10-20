import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DemoShell } from "@/components/demo/demo-shell";
import "@/components/demo/demo.css";

export const metadata: Metadata = { title: { default: "Learning demo | EducationOS", template: "%s | EducationOS Demo" }, description: "Explore a local, synthetic EducationOS learning demo. No learner account or profile is created", robots: { index: false, follow: false } };
export default function DemoLayout({ children }: { children: ReactNode }) { return <DemoShell>{children}</DemoShell>; }
