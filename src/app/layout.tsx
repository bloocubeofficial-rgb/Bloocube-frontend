import type { Metadata } from "next";
import "./globals.css";
import { PerformanceDebugger } from "@/Components/PerformanceDebugger";
import RouteProgress from "@/Components/ui/RouteProgress";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Bloocube",
  description: "A social media workspace powered by AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body suppressHydrationWarning={true}>
        <RouteProgress />
        <div className="hidden">
          <Link href="/login" prefetch />
          <Link href="/signup" prefetch />
          <Link href="/creator" prefetch />
          <Link href="/brand" prefetch />
        </div>
        {children}
        {process.env.NODE_ENV === "development" && <PerformanceDebugger />}
      </body>
    </html>
  );
}
