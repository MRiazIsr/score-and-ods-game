import type { Metadata } from "next";
import { Inter, Space_Grotesk, Architects_Daughter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800"],
});

const spaceGrotesk = Space_Grotesk({
    variable: "--font-display",
    subsets: ["latin"],
    weight: ["500", "600", "700"],
});

const architectsDaughter = Architects_Daughter({
    variable: "--font-hand",
    subsets: ["latin"],
    weight: ["400"],
});

const jetbrainsMono = JetBrains_Mono({
    variable: "--font-mono",
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
    title: "Pitchr — Score Prediction Game",
    description: "Your group. Your league. Predict every fixture before kickoff.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body
            className={`${inter.variable} ${spaceGrotesk.variable} ${architectsDaughter.variable} ${jetbrainsMono.variable} antialiased`}
        >
            <main className="min-h-screen bg-[#F4F2EC] text-[#0B0F0A]">
                {children}
            </main>
        </body>
        </html>
    );
}
