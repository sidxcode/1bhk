import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const clashDisplay = localFont({
  src: "./fonts/ClashDisplay-Variable.woff2",
  display: "swap",
  style: "normal",
  weight: "200 700",
});

export const metadata: Metadata = {
  title: "Siddharth Borman — Product & Web Designer",
  description: "Portfolio of Siddharth Borman, product and web designer.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="en" className={clashDisplay.className}><body>{children}</body></html>;
}
