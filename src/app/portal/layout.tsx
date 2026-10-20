import type { Metadata } from "next";
import { headers } from "next/headers";
import type { ReactNode } from "react";
import { PortalProvider } from "@/components/portal/portal-provider";
import { PortalShell } from "@/components/portal/portal-shell";

export const metadata: Metadata = {
  metadataBase: new URL("https://app.educationos.space"),
  title: { default: "Your learning space", template: "%s | EducationOS Learning" },
  description: "Learn, practise and create across programming, science, mathematics, language and arts",
  alternates: { canonical: null },
  openGraph: { title: "EducationOS learning space", url: "https://app.educationos.space", description: "A space to learn, practise and create" },
  robots: { index: false, follow: false },
};

export default async function PortalLayout({ children }: { children: ReactNode }) {
  const appHost = (await headers()).get("x-educationos-portal-host") === "true";
  return <PortalProvider><PortalShell appHost={appHost}>{children}</PortalShell></PortalProvider>;
}
