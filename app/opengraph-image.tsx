import { ImageResponse } from "next/og";
import { OgCard, ogSize } from "@/lib/og-card";

export const alt = "Buzzly — Building brands through content";
export const size = ogSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <OgCard eyebrow="Buzzly / Company builder" title="We build brands through content." subtitle="Ours and everyone else’s." />,
    size,
  );
}
