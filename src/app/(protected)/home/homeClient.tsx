"use client";

import type { Competition } from "@/app/server/modules/competitions/types";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Chip } from "@/app/client/components/stadium/Chip";

interface Props {
    competitions: Competition[];
}

export default function HomeClient({ competitions }: Props) {
    const router = useRouter();
    const t = useTranslations();

    return (
        <div className="w-full" style={{ maxWidth: 1080, margin: "0 auto", padding: "32px 24px 48px" }}>
            {/* heading */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4" style={{ marginBottom: 32 }}>
                <div>
                    <div
                        className="uppercase"
                        style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, color: "#4A5148" }}
                    >
                        {t("dashboard.matchdayLabel")}
                    </div>
                    <h1
                        className="font-display"
                        style={{ fontSize: 36, fontWeight: 700, letterSpacing: -0.8, marginTop: 6 }}
                    >
                        {t("dashboard.heading")}
                    </h1>
                    <div className="text-ink2" style={{ fontSize: 13, marginTop: 4 }}>
                        {t("dashboard.subheading")}
                    </div>
                </div>
                <Chip tone="brand">{t("dashboard.active", { count: competitions.length })}</Chip>
            </div>

            {/* grid */}
            <div
                className="grid"
                style={{
                    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                    gap: 16,
                }}
            >
                {competitions.map((c) => (
                    <button
                        key={c.id}
                        type="button"
                        onClick={() => router.push(`/competition/${c.id}`)}
                        className="group text-left"
                        style={{
                            background: "#fff",
                            border: "1px solid #E4E1D6",
                            borderRadius: 10,
                            padding: 0,
                            overflow: "hidden",
                            cursor: "pointer",
                            transition: "transform 0.15s, box-shadow 0.15s, border-color 0.15s",
                            fontFamily: "inherit",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-2px)";
                            e.currentTarget.style.boxShadow = "0 12px 32px rgba(15,25,15,0.08)";
                            e.currentTarget.style.borderColor = "#1E3A8A";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "none";
                            e.currentTarget.style.borderColor = "#E4E1D6";
                        }}
                    >
                        <div
                            className="flex items-center justify-center"
                            style={{
                                height: 132,
                                background: "#F4F2EC",
                                borderBottom: "1px solid #E4E1D6",
                                position: "relative",
                            }}
                        >
                            <Image
                                src={c.emblem}
                                alt={c.name}
                                width={88}
                                height={88}
                                className="object-contain"
                                style={{ maxHeight: 88, width: "auto" }}
                            />
                            <span
                                className="absolute uppercase"
                                style={{
                                    top: 12,
                                    left: 12,
                                    fontSize: 9,
                                    fontWeight: 700,
                                    letterSpacing: 0.5,
                                    color: "#4A5148",
                                    background: "#fff",
                                    padding: "3px 6px",
                                    borderRadius: 3,
                                    border: "1px solid #E4E1D6",
                                }}
                            >
                                {c.code || c.type}
                            </span>
                        </div>
                        <div style={{ padding: "14px 16px 16px" }}>
                            <div
                                className="font-display"
                                style={{
                                    fontSize: 15,
                                    fontWeight: 700,
                                    letterSpacing: -0.2,
                                    color: "#0B0F0A",
                                }}
                            >
                                {c.name}
                            </div>
                            <div className="flex items-center justify-between" style={{ marginTop: 6 }}>
                                <span className="text-ink2" style={{ fontSize: 11 }}>
                                    {t("dashboard.competitionStats", {
                                        matchday: c.activeMatchDay ?? "—",
                                        rounds: c.matchDays?.length ?? 0,
                                    })}
                                </span>
                                <span style={{ fontSize: 11, fontWeight: 700, color: "#9D0010" }}>
                                    {t("action.predict")}
                                </span>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
