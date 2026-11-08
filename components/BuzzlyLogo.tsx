import React from "react";

interface BuzzlyLogoProps {
  variant?: "horizontal" | "vertical" | "mark";
  theme?: "dark" | "light";
  size?: "sm" | "md" | "lg" | "xl" | number;
  className?: string;
  showMedia?: boolean;
}

export function BuzzlyMark({
  size = 36,
  className = "",
}: {
  size?: number | string;
  className?: string;
}) {
  const dim = typeof size === "number" ? `${size}px` : size;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="none"
      style={{ width: dim, height: dim, flexShrink: 0 }}
      className={`buzzly-mark ${className}`}
      aria-label="Buzzly Media Emblem"
      role="img"
    >
      <defs>
        <radialGradient id="hexGlowGradient" cx="70%" cy="25%" r="65%">
          <stop offset="0%" stopColor="#FFF7D1" />
          <stop offset="35%" stopColor="#FFC01E" />
          <stop offset="75%" stopColor="#F59300" />
          <stop offset="100%" stopColor="#C96E00" />
        </radialGradient>
        <filter id="markSoftGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Ambient warm glow */}
      <polygon
        points="50,7 86,28 86,72 50,93 14,72 14,28"
        fill="#FFB703"
        opacity="0.45"
        filter="url(#markSoftGlow)"
      />

      {/* Rounded Honeycomb Hexagon */}
      <path
        d="M 50,8
           C 53,8 83,25.5 84.5,28
           C 86,30.5 86,69.5 84.5,72
           C 83,74.5 53,92 50,92
           C 47,92 17,74.5 15.5,72
           C 14,69.5 14,30.5 15.5,28
           C 17,25.5 47,8 50,8 Z"
        fill="url(#hexGlowGradient)"
        stroke="#FFEAA0"
        strokeWidth="1.2"
      />

      {/* Stylized 'b' */}
      <path
        d="M 38,24
           L 44.5,24
           L 44.5,44.5
           C 47,42 51,40.5 56.5,40.5
           C 66.5,40.5 73,48 73,58
           C 73,68 65.5,75.5 55.5,75.5
           C 50.5,75.5 46.5,73 44.5,70
           L 44.5,75.5
           L 38,75.5
           Z"
        fill="#1A0926"
      />

      {/* Play button triangle inside 'b' bowl */}
      <polygon points="51.5,50 51.5,66 64.5,58" fill="url(#hexGlowGradient)" />
    </svg>
  );
}

export function BuzzlyLogo({
  variant = "horizontal",
  theme = "dark",
  size = "md",
  className = "",
  showMedia = true,
}: BuzzlyLogoProps) {
  const textColor = theme === "dark" ? "#F5EFDF" : "#1A0926";
  const goldColor = "#E5A93B";

  const sizeMap = {
    sm: { mark: 26, text: "1.15rem", subText: "0.45rem", gap: "0.5rem" },
    md: { mark: 36, text: "1.55rem", subText: "0.55rem", gap: "0.65rem" },
    lg: { mark: 52, text: "2.1rem", subText: "0.72rem", gap: "0.85rem" },
    xl: { mark: 80, text: "3.2rem", subText: "1.05rem", gap: "1.2rem" },
  };

  const currentSize = typeof size === "string" ? sizeMap[size] : sizeMap.md;

  if (variant === "mark") {
    return <BuzzlyMark size={currentSize.mark} className={className} />;
  }

  if (variant === "vertical") {
    return (
      <div
        className={`buzzly-logo-vertical inline-flex flex-col items-center text-center ${className}`}
        style={{ gap: currentSize.gap }}
      >
        <BuzzlyMark size={currentSize.mark * 1.3} />
        <div className="flex flex-col items-center">
          <span
            style={{
              color: textColor,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: currentSize.text,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 1,
            }}
          >
            buzzly
          </span>
          {showMedia && (
            <div
              className="flex items-center justify-center w-full"
              style={{
                gap: "0.5rem",
                marginTop: "0.3rem",
              }}
            >
              <span
                style={{
                  height: "1px",
                  flex: 1,
                  background: goldColor,
                  opacity: 0.8,
                }}
              />
              <span
                style={{
                  color: goldColor,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: currentSize.subText,
                  fontWeight: 700,
                  letterSpacing: "0.32em",
                  paddingLeft: "0.32em",
                  lineHeight: 1,
                }}
              >
                MEDIA
              </span>
              <span
                style={{
                  height: "1px",
                  flex: 1,
                  background: goldColor,
                  opacity: 0.8,
                }}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Horizontal variant (default)
  return (
    <div
      className={`buzzly-logo-horizontal inline-flex items-center ${className}`}
      style={{ gap: currentSize.gap }}
    >
      <BuzzlyMark size={currentSize.mark} />
      <div className="flex flex-col justify-center leading-none">
        <span
          style={{
            color: textColor,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: currentSize.text,
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 0.95,
          }}
        >
          buzzly
        </span>
        {showMedia && (
          <div
            className="flex items-center"
            style={{
              gap: "0.35rem",
              marginTop: "0.22rem",
            }}
          >
            <span
              style={{
                height: "1px",
                width: "12px",
                background: goldColor,
                opacity: 0.85,
              }}
            />
            <span
              style={{
                color: goldColor,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: currentSize.subText,
                fontWeight: 700,
                letterSpacing: "0.28em",
                paddingLeft: "0.28em",
                lineHeight: 1,
              }}
            >
              MEDIA
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default BuzzlyLogo;
