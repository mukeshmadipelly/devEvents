import type { Metadata } from "next";
import { Poppins , Martian_Mono} from "next/font/google";
import "./globals.css";
import LightRays from '@/components/LightRays';
import Navbar from "@/components/navbar";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
    display: "swap",
    weight: ['400', '600']
});

const MartianMono = Martian_Mono({
  variable: "--font-martian-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DevEvents",
  description: "Events for all the developers that you mustn't miss.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${MartianMono.variable} antialiased`}
      >
      <Navbar />



      <div className='absolute inset-0 top-0 z-[-1] min-h-screen'>
      <LightRays
              raysOrigin="top-center-offset"
              raysColor="#5dfeca"
              raysSpeed={0.5}
              lightSpread={0.9}
              rayLength={1.4}
              followMouse={true}
              mouseInfluence={0.02}
              noiseAmount={0.0}
              distortion={0.01}
          />
      </div>
        <main>
            {children}
        </main>

      </body>
    </html>
  );
}
