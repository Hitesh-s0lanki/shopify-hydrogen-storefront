import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";
import { TRPCReactProvider } from "@/trpc/client";
import { NuqsAdapter } from "nuqs/adapters/next";
import { Toaster } from "sonner";

const font = Archivo({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Shopify Storefront App",
  description: "Shopify Storefront App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <NuqsAdapter>
      <TRPCReactProvider>
        <html lang="en">
          <body className={font.className}>
            <div className="bg-muted border-b text-center py-1.5 px-4">
              <p className="text-xs text-muted-foreground">
                This is a Next.js app. Unable to deploy Hydrogen app on Vercel. You can check out the code for Hydrogen on{" "}
                <a
                  href="https://github.com/your-username/your-repo/tree/main"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-foreground"
                >
                  main branch
                </a>
                .
              </p>
            </div>
            <Toaster />
            {children}
          </body>
        </html>
      </TRPCReactProvider>
    </NuqsAdapter>
  );
}
