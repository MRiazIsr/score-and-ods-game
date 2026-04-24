interface CrestProps {
    color: string;
    label: string;
    size?: number;
}

export function Crest({ color, label, size = 34 }: CrestProps) {
    return (
        <span
            className="inline-flex items-center justify-center font-display"
            style={{
                width: size,
                height: size,
                borderRadius: size / 2,
                background: color,
                color: "#fff",
                fontSize: size * 0.32,
                fontWeight: 800,
                letterSpacing: 0.5,
                boxShadow: "inset 0 -2px 0 rgba(0,0,0,0.15)",
                flexShrink: 0,
            }}
        >
            {label}
        </span>
    );
}
