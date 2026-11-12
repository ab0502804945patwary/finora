import { desc, like, or } from "drizzle-orm";
import { ChevronRight, FilePlus2, Files, Search, SearchX, X } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { db, ensureDb } from "@/lib/db";
import { fmtDate } from "@/lib/format";
import { documents } from "@/lib/schema";

export default async function AdminHome({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? "").trim().slice(0, 100);
  await ensureDb();
  const pattern = `%${q.replace(/[%_]/g, "")}%`;
  const rows = await db
    .select()
    .from(documents)
    .where(q ? or(like(documents.companyName, pattern), like(documents.registrationNo, pattern), like(documents.id, pattern)) : undefined)
    .orderBy(desc(documents.createdAt))
    .limit(200);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="t-h1">Documents</h1>
          <p className="mt-1.5 text-sm text-muted" aria-live="polite">
            {q ? (
              <>
                {rows.length} {rows.length === 1 ? "result" : "results"} for “{q}”
              </>
            ) : (
              <>
                {rows.length} {rows.length === 1 ? "document" : "documents"} issued
              </>
            )}
          </p>
        </div>
        <Link href="/admin/new" className="btn btn-brand hidden sm:inline-flex">
          <FilePlus2 /> Issue Document
        </Link>
      </div>

      <form role="search" className="relative mt-6 sm:max-w-md">
        <label htmlFor="q" className="sr-only">Search documents</label>
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Search company, registration no. or ID"
          className="input h-11 pr-20 pl-9 [&::-webkit-search-cancel-button]:hidden"
        />
        <div className="absolute top-1/2 right-1.5 flex -translate-y-1/2 items-center gap-1">
          {q && (
            <Link href="/admin" aria-label="Clear search" className="btn btn-ghost btn-icon h-8 w-8">
              <X />
            </Link>
          )}
          <button className="btn btn-primary btn-sm">Search</button>
        </div>
      </form>

      <div className="mt-5">
        {rows.length === 0 ? (
          <div className="card">
            {q ? (
              <EmptyState
                icon={SearchX}
                title="No matching documents"
                description={`Nothing matches “${q}”. Check the spelling, or search by registration number or document ID.`}
                action={<Link href="/admin" className="btn btn-secondary">Clear search</Link>}
              />
            ) : (
              <EmptyState
                icon={Files}
                title="No documents yet"
                description="Issued documents will appear here. Upload your first PDF to stamp it with a QR code and record its fingerprint."
                action={
                  <Link href="/admin/new" className="btn btn-brand">
                    <FilePlus2 /> Issue your first document
                  </Link>
                }
              />
            )}
          </div>
        ) : (
          <>
            {/* Desktop / tablet table */}
            <div className="card hidden overflow-hidden md:block">
              <table className="w-full text-left">
                <caption className="sr-only">Issued documents</caption>
                <thead>
                  <tr className="border-b border-line bg-sand/50 text-xs font-semibold tracking-wide text-muted uppercase">
                    <th scope="col" className="px-5 py-3">Company</th>
                    <th scope="col" className="px-4 py-3">Document type</th>
                    <th scope="col" className="px-4 py-3">Issued</th>
                    <th scope="col" className="px-4 py-3">Status</th>
                    <th scope="col" className="w-12 px-4 py-3"><span className="sr-only">Open</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-soft">
                  {rows.map((d) => (
                    <tr key={d.id} className="group relative transition-colors hover:bg-sand/50">
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/admin/doc/${d.id}`}
                          className="text-sm font-semibold text-ink after:absolute after:inset-0 group-hover:text-brand"
                        >
                          {d.companyName}
                        </Link>
                        <p className="mt-0.5 text-xs text-muted">{d.registrationNo ? `Reg. ${d.registrationNo}` : "No registration number"}</p>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-ink-soft">{d.docType}</td>
                      <td className="px-4 py-3.5 text-sm whitespace-nowrap text-ink-soft">{fmtDate(d.issuedOn)}</td>
                      <td className="px-4 py-3.5"><StatusBadge status={d.status} /></td>
                      <td className="px-4 py-3.5 text-right">
                        <ChevronRight className="inline size-4 text-muted transition group-hover:translate-x-0.5 group-hover:text-ink" aria-hidden="true" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <ul className="space-y-3 md:hidden">
              {rows.map((d) => (
                <li key={d.id}>
                  <Link
                    href={`/admin/doc/${d.id}`}
                    className="card block p-4 transition active:scale-[0.99] active:bg-sand/50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-[0.9375rem] font-semibold">{d.companyName}</p>
                        <p className="mt-0.5 truncate text-xs text-muted">{d.registrationNo ? `Reg. ${d.registrationNo}` : "No registration number"}</p>
                      </div>
                      <StatusBadge status={d.status} />
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3 border-t border-line-soft pt-3 text-[0.8125rem]">
                      <span className="min-w-0 truncate text-ink-soft">{d.docType}</span>
                      <span className="flex shrink-0 items-center gap-1 text-muted">
                        {fmtDate(d.issuedOn)}
                        <ChevronRight className="size-4" aria-hidden="true" />
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
