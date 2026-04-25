import type { Metadata } from "next";
import { Inter, Space_Grotesk, Architects_Daughter, JetBrains_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
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

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("meta");
    return {
        title: t("title"),
        description: t("description"),
    };
}

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const locale = await getLocale();
    const messages = await getMessages();

    return (
        <html lang={locale}>
        <body
            className={`${inter.variable} ${spaceGrotesk.variable} ${architectsDaughter.variable} ${jetbrainsMono.variable} antialiased`}
        >
            <NextIntlClientProvider locale={locale} messages={messages}>
                <main className="min-h-screen bg-[#F4F2EC] text-[#0B0F0A]">
                    {children}
                </main>
            </NextIntlClientProvider>
        </body>
        </html>
    );
}
