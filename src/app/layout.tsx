import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clarity Room | Decision Experiments",
  description: "A private space to turn a difficult decision into one small, reversible experiment.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
