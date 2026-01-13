import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/app/components/header";
import http from "@/server/methods/http"
import { sendRegisterEmail } from "@/server/controller/sendMail"
import Sidebar from "@/app/components/sidebar"
import TopProgressBar from "@/app/components/progress";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StarTail",
  description: "StarTail",
};

//Get menu
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const menu = await http.get<any>('menu');
  return (
    <html lang="en">
      <body className="select-none">
        <TopProgressBar/>
        <Header menu={menu.data} />
        <div className="flex min-h-[calc(100vh-65px)] bg-zinc-50 font-sans dark:bg-black pt-[10px] justify-center">
          <div>
            {children}
          </div>
          <div>
            <Sidebar menu={menu.data}/>
          </div>
        </div>
      </body>
    </html>
  );
}
