import type { Metadata } from "next";
import { LabProvider } from "@/components/lab-provider";
import { AppShell } from "@/components/app-shell";
import "./globals.css";
import "./workbench.css";
import "./audit.css";
export const metadata: Metadata = {
  title: {
    default: "DrVelu · AI Engineering Lab",
    template: "%s · DrVelu Lab",
  },
  description:
    "One mission at a time. Learn, build, and prove your AI engineering skills with your personal learning lab.",
  robots: { index: false, follow: false },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <LabProvider>
          <AppShell>{children}</AppShell>
        </LabProvider>
      </body>
    </html>
  );
}
