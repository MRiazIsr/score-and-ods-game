interface SectionHeadProps {
    title: string;
    chip?: string;
}

export function SectionHead({ title, chip }: SectionHeadProps) {
    return (
        <div className="flex items-baseline justify-between" style={{ marginBottom: 10 }}>
            <div
                className="font-display"
                style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.3 }}
            >
                {title}
            </div>
            {chip && <div style={{ fontSize: 11, color: "#4A5148" }}>{chip}</div>}
        </div>
    );
}
