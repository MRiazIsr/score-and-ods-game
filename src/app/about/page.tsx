import Link from "next/link";
import {
    Trophy,
    Target,
    TrendingUp,
    Smartphone,
    BarChart3,
    Users,
    ArrowRight,
    CheckCircle,
    Crosshair,
    X as XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LanguageSwitcher } from "@/components/language-switcher";
import { montserrat } from "@/app/client/fonts/fonts";
import { getLocale } from "@/i18n/getLocale";
import { getDictionary } from "@/i18n/getDictionary";
import type { LucideIcon } from "lucide-react";

type ScoringRule = {
    key: 'exactScore' | 'goalDifference' | 'correctOutcome' | 'wrong';
    descKey: 'exactScoreDesc' | 'goalDifferenceDesc' | 'correctOutcomeDesc' | 'wrongDesc';
    points: number;
    icon: LucideIcon;
    color: string;
    bg: string;
    border: string;
};

const scoringRules: ScoringRule[] = [
    {
        key: 'exactScore', descKey: 'exactScoreDesc', points: 3,
        icon: Crosshair, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20",
    },
    {
        key: 'goalDifference', descKey: 'goalDifferenceDesc', points: 2,
        icon: Target, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20",
    },
    {
        key: 'correctOutcome', descKey: 'correctOutcomeDesc', points: 1,
        icon: CheckCircle, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20",
    },
    {
        key: 'wrong', descKey: 'wrongDesc', points: 0,
        icon: XIcon, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20",
    },
];

type Feature = {
    icon: LucideIcon;
    titleKey: 'realCompetitions' | 'scorePredictions' | 'liveTracking' | 'scoreboard' | 'formGuide' | 'mobileReady';
    descKey: 'realCompetitionsDesc' | 'scorePredictionsDesc' | 'liveTrackingDesc' | 'scoreboardDesc' | 'formGuideDesc' | 'mobileReadyDesc';
};

const features: Feature[] = [
    { icon: Trophy, titleKey: 'realCompetitions', descKey: 'realCompetitionsDesc' },
    { icon: Target, titleKey: 'scorePredictions', descKey: 'scorePredictionsDesc' },
    { icon: TrendingUp, titleKey: 'liveTracking', descKey: 'liveTrackingDesc' },
    { icon: Users, titleKey: 'scoreboard', descKey: 'scoreboardDesc' },
    { icon: BarChart3, titleKey: 'formGuide', descKey: 'formGuideDesc' },
    { icon: Smartphone, titleKey: 'mobileReady', descKey: 'mobileReadyDesc' },
];

type Step = {
    number: number;
    titleKey: 'step1Title' | 'step2Title' | 'step3Title';
    descKey: 'step1Desc' | 'step2Desc' | 'step3Desc';
};

const steps: Step[] = [
    { number: 1, titleKey: 'step1Title', descKey: 'step1Desc' },
    { number: 2, titleKey: 'step2Title', descKey: 'step2Desc' },
    { number: 3, titleKey: 'step3Title', descKey: 'step3Desc' },
];

export default async function AboutPage() {
    const locale = await getLocale();
    const dict = await getDictionary(locale);
    const t = dict.about;
    const isRtl = locale === 'ar';

    return (
        <div className="min-h-screen bg-background" dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Language Switcher */}
            <div className="flex justify-end p-4">
                <LanguageSwitcher currentLocale={locale} />
            </div>

            {/* Hero */}
            <section className="flex flex-col items-center justify-center px-4 pb-20 pt-8 text-center md:pb-32 md:pt-16">
                <p className="mb-6 text-6xl">&#9917;</p>
                <h1
                    className={`${montserrat.className} text-4xl font-bold tracking-tight md:text-6xl`}
                >
                    {t.heroTitle}
                </h1>
                <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
                    {t.heroTagline}
                </p>
                <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                    <Button asChild size="lg">
                        <Link href="/signup">
                            {t.getStarted} <ArrowRight className={`h-4 w-4 ${isRtl ? 'mr-2 rotate-180' : 'ml-2'}`} />
                        </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline">
                        <Link href="/login">{t.signIn}</Link>
                    </Button>
                </div>
            </section>

            {/* How It Works */}
            <section className="bg-muted/50 px-4 py-16 md:py-24">
                <div className="mx-auto max-w-5xl">
                    <h2
                        className={`${montserrat.className} mb-12 text-center text-3xl font-bold md:text-4xl`}
                    >
                        {t.howItWorksTitle}
                    </h2>
                    <div className="grid gap-8 md:grid-cols-3">
                        {steps.map((step) => (
                            <div
                                key={step.number}
                                className="flex flex-col items-center text-center"
                            >
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                                    {step.number}
                                </div>
                                <h3 className="mb-2 text-xl font-semibold">
                                    {t[step.titleKey]}
                                </h3>
                                <p className="text-muted-foreground">
                                    {t[step.descKey]}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Scoring System */}
            <section className="px-4 py-16 md:py-24">
                <div className="mx-auto max-w-5xl">
                    <h2
                        className={`${montserrat.className} mb-4 text-center text-3xl font-bold md:text-4xl`}
                    >
                        {t.scoringTitle}
                    </h2>
                    <p className="mx-auto mb-12 max-w-2xl text-center text-muted-foreground">
                        {t.scoringSubtitle}
                    </p>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        {scoringRules.map((rule) => (
                            <Card
                                key={rule.key}
                                className={`${rule.bg} border ${rule.border}`}
                            >
                                <CardHeader className="items-center pb-2">
                                    <rule.icon
                                        className={`h-8 w-8 ${rule.color}`}
                                    />
                                    <span
                                        className={`font-mono text-4xl font-bold ${rule.color}`}
                                    >
                                        {rule.points}
                                    </span>
                                </CardHeader>
                                <CardContent className="text-center">
                                    <CardTitle className="mb-1 text-base">
                                        {t[rule.key]}
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        {t[rule.descKey]}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="bg-muted/50 px-4 py-16 md:py-24">
                <div className="mx-auto max-w-5xl">
                    <h2
                        className={`${montserrat.className} mb-12 text-center text-3xl font-bold md:text-4xl`}
                    >
                        {t.featuresTitle}
                    </h2>
                    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                        {features.map((feature) => (
                            <Card
                                key={feature.titleKey}
                                className="transition-shadow hover:shadow-lg"
                            >
                                <CardHeader>
                                    <feature.icon className="mb-2 h-8 w-8 text-primary" />
                                    <CardTitle className="text-lg">
                                        {t[feature.titleKey]}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        {t[feature.descKey]}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="flex flex-col items-center px-4 py-16 text-center md:py-24">
                <h2
                    className={`${montserrat.className} mb-4 text-3xl font-bold md:text-4xl`}
                >
                    {t.ctaTitle}
                </h2>
                <p className="mb-8 text-muted-foreground">
                    {t.ctaSubtitle}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                    <Button asChild size="lg">
                        <Link href="/signup">
                            {t.getStarted} <ArrowRight className={`h-4 w-4 ${isRtl ? 'mr-2 rotate-180' : 'ml-2'}`} />
                        </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline">
                        <Link href="/login">{t.signIn}</Link>
                    </Button>
                </div>
            </section>

            {/* Footer */}
            <Separator />
            <footer className="flex flex-col items-center gap-3 px-4 py-8 text-sm text-muted-foreground">
                <p>&copy; {new Date().getFullYear()} {t.footerCopyright}</p>
                <div className="flex gap-4">
                    <Link
                        href="/login"
                        className="transition-colors hover:text-primary"
                    >
                        {t.footerSignIn}
                    </Link>
                    <Link
                        href="/signup"
                        className="transition-colors hover:text-primary"
                    >
                        {t.footerSignUp}
                    </Link>
                </div>
            </footer>
        </div>
    );
}
