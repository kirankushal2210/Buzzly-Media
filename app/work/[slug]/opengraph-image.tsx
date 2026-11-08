import { ImageResponse } from "next/og";
import { OgCard, ogSize } from "@/lib/og-card";
import { caseStudies, getCaseStudy } from "@/lib/work";

export const alt = "Buzzly case study";
export const size = ogSize;
export const contentType = "image/png";

export function generateStaticParams() {
  return caseStudies.map(({ slug }) => ({ slug }));
}

export default async function CaseStudyImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  return new ImageResponse(
    <OgCard
      eyebrow={study ? `Case study / ${study.categoryLabel}` : "Case study"}
      title={study?.title ?? "Buzzly work"}
      subtitle={study?.client}
      accent={study?.accent}
    />,
    size,
  );
}
