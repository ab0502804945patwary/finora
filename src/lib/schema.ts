import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const documents = sqliteTable("documents", {
  id: text("id").primaryKey(), // UUID v4, used in QR / verification link
  companyName: text("company_name").notNull(),
  registrationNo: text("registration_no"),
  docType: text("doc_type").notNull(),
  auditDate: text("audit_date"), // YYYY-MM-DD
  fyEnd: text("fy_end"), // YYYY-MM-DD
  issuedOn: text("issued_on").notNull(), // YYYY-MM-DD
  sha256: text("sha256").notNull().unique(), // hash of the stamped (issued) PDF
  originalSha256: text("original_sha256"), // hash of the uploaded PDF before stamping
  status: text("status", { enum: ["valid", "revoked"] }).notNull().default("valid"),
  revokedReason: text("revoked_reason"),
  fileRef: text("file_ref").notNull(),
  fileName: text("file_name"),
  createdAt: integer("created_at").notNull(),
});

export type Doc = typeof documents.$inferSelect;
