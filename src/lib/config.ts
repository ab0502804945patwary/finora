// Edit business details here. Everything on the site reads from this file.
export const site = {
  name: "Finora",
  legalName: "Finora LLC",
  shortTagline: "Accounting · Audit · Advisory",
  tagline: "Clear numbers. Confident decisions.",
  description:
    "Finora prepares audited financial statements, accounts, tax filings and company formation support for founders and growing businesses.",
  email: "hello@finoraca.com", // TODO: confirm mailbox exists
  phone: "", // e.g. "+1 555 000 0000"
  address: "", // e.g. "City, Country"
  issuer: "Finora LLC", // shown as "Issued by" on verification pages
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
  verifyUrl: (process.env.NEXT_PUBLIC_VERIFY_URL || "http://everify.localhost:3000").replace(/\/$/, ""),
};

export const docTypes = [
  "Audited Financial Statements",
  "Financial Accounts",
  "Audit Report",
  "Tax Computation / Return",
  "Bank Reference Letter",
  "Certificate",
  "Other",
] as const;

export const verifyHost = new URL(site.verifyUrl).host;
