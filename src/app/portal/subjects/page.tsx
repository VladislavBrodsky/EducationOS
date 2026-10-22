import type { Metadata } from "next";
import { SubjectCatalog } from "@/components/portal/portal-pages";
export const metadata: Metadata = { title: "Subjects" };
export default function SubjectsPage() { return <SubjectCatalog />; }
