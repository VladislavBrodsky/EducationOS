"use client";
import Link from "next/link";
import { usePortalNavigation } from "@/components/portal/portal-shell";
export default function NotFound() {
  const { href } = usePortalNavigation();
  return <div className="p-empty"><p className="p-eyebrow">ACTIVITY UNAVAILABLE</p><h1>Let’s find another starting point.</h1><p>This activity could not be found. Your saved work is still available in My progress.</p><Link className="p-primary" href={href("/subjects")}>Explore subjects</Link></div>;
}
