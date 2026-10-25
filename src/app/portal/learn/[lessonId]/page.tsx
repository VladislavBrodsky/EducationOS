import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPortalLesson } from "@/lib/portal-learning";
import { LessonWorkspace } from "@/components/portal/lesson-workspace";
type Props = { params: Promise<{ lessonId: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lesson = getPortalLesson((await params).lessonId);
  return { title: lesson?.title ?? "Activity unavailable" };
}
export default async function LessonPage({ params }: Props) {
  const { lessonId } = await params;
  if (!getPortalLesson(lessonId)) notFound();
  return <LessonWorkspace key={lessonId} lessonId={lessonId} />;
}
