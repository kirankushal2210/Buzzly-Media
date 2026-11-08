/**
 * Details used by /privacy and /terms. Fill these in before launch and have the
 * final text reviewed by a lawyer for the countries Buzzly operates in.
 */
export const legal = {
  /** Registered legal name, e.g. "Buzzly Media Pvt. Ltd." */
  entityName: "Buzzly",
  /** Public privacy contact. Leave null to point people to the contact form. */
  privacyEmail: null as string | null,
  /** e.g. "India" — used in the governing-law clause. Null keeps the clause generic. */
  jurisdiction: null as string | null,
  /** How long inquiries are kept before deletion. */
  inquiryRetention: "24 months",
  lastUpdated: "8 November 2026",
};
