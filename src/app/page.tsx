import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BookOpenCheck,
  Building2,
  ClipboardCheck,
  Database,
  FileSpreadsheet,
  Fingerprint,
  FolderLock,
  Landmark,
  Mail,
  MapPin,
  MessagesSquare,
  Phone,
  QrCode,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { HeroVisual } from "@/components/site/HeroVisual";
import { siteNav } from "@/components/site/nav";
import { SiteHeader } from "@/components/site/SiteHeader";
import { site, verifyHost } from "@/lib/config";

const services = [
  { icon: ShieldCheck, t: "Audit & Assurance", d: "Statutory and voluntary audits with reports that banks, regulators and partners accept." },
  { icon: FileSpreadsheet, t: "Financial Statements", d: "Year-end accounts and management reporting prepared to the applicable standards." },
  { icon: BookOpenCheck, t: "Bookkeeping", d: "Monthly reconciliations and clean ledgers, so year-end is a formality." },
  { icon: Landmark, t: "Tax & Compliance", d: "Corporate tax computations, filings and deadlines handled before they become problems." },
  { icon: Building2, t: "Company Formation", d: "Incorporation, registered details and the paperwork to open accounts and start trading." },
  { icon: TrendingUp, t: "Advisory", d: "Cash-flow planning, cost reviews and decision support from people who know your numbers." },
];

const steps = [
  { icon: MessagesSquare, t: "Talk to us", d: "A short call to understand your business, deadlines and what the document is for." },
  { icon: FolderLock, t: "Share your records", d: "Send statements and ledgers through a secure channel. We tell you exactly what is missing." },
  { icon: ClipboardCheck, t: "We prepare & review", d: "Your file is prepared, then reviewed by a second accountant before sign-off." },
  { icon: BadgeCheck, t: "Issued & verifiable", d: "You receive the final PDF with a QR code anyone can scan to confirm it is genuine." },
];

const verifyFeatures = [
  { icon: QrCode, t: "QR-based verification", d: "Every page carries a QR code that opens the document's official record." },
  { icon: Database, t: "Document registry", d: "Company, dates and document type are recorded when the document is issued." },
  { icon: Fingerprint, t: "SHA-256 fingerprint", d: "A cryptographic checksum identifies the exact file that was issued." },
  { icon: ShieldCheck, t: "Authenticity checking", d: "Drop the PDF to confirm it has not been edited. It never leaves the device." },
];

const consultHref = `mailto:${site.email}?subject=${encodeURIComponent("Free consultation request")}`;

export default function Home() {
  return (
    <div id="top" className="bg-white">
      <SiteHeader tagline={site.shortTagline} />

      <main id="main">
        {/* Hero */}
        <section className="relative -mt-16 overflow-hidden pt-16 lg:-mt-[4.5rem] lg:pt-[4.5rem]">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,#f6f4ef,#ffffff_85%)]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 opacity-[0.5] [background-image:linear-gradient(#e3e1da_1px,transparent_1px),linear-gradient(90deg,#e3e1da_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_70%_60%_at_70%_30%,black,transparent)]"
          />
          <div className="container-site grid items-center gap-14 py-14 sm:py-20 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:py-28">
            <div className="animate-slide-up">
              <p className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1 text-xs font-medium text-ink-soft shadow-card">
                <span className="size-1.5 rounded-full bg-brand" aria-hidden="true" />
                Accounting · Audit · Tax · Advisory
              </p>
              <h1 className="t-display mt-6 text-ink">
                Clear Numbers.
                <br />
                <span className="text-brand">Confident</span> Decisions.
              </h1>
              <p className="mt-6 max-w-xl text-[1.0625rem] leading-relaxed text-ink-soft sm:text-lg">
                {site.description} Every report we issue can be independently verified online.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href={consultHref} className="btn btn-brand btn-lg">
                  Start with a Free Consultation <ArrowRight />
                </a>
                <a href={site.verifyUrl} className="btn btn-secondary btn-lg">
                  <ShieldCheck className="text-brand" /> Verify a Document
                </a>
              </div>
              <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-line pt-6">
                {[
                  ["6", "Core services"],
                  ["4-step", "Clear process"],
                  ["QR + SHA-256", "Verifiable reports"],
                ].map(([v, k]) => (
                  <div key={k}>
                    <dt className="sr-only">{k}</dt>
                    <dd className="text-sm font-semibold text-ink sm:text-base">{v}</dd>
                    <dd className="mt-0.5 text-xs text-muted">{k}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <HeroVisual issuer={site.issuer} verifyHost={verifyHost} />
          </div>
        </section>

        {/* Services */}
        <section id="services" className="border-t border-line-soft py-20 sm:py-28">
          <div className="container-site">
            <SectionHeading eyebrow="Services" title="Everything your accounts need, from the first ledger to the signed audit." />
            <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
              {services.map(({ icon: Icon, t, d }) => (
                <li key={t} className="group card card-pad transition duration-200 hover:-translate-y-0.5 hover:border-[#d3d0c6] hover:shadow-raised">
                  <span className="flex size-11 items-center justify-center rounded-lg bg-brand-tint text-brand transition group-hover:bg-brand group-hover:text-white">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-base font-semibold">{t}</h3>
                  <p className="mt-2 t-body text-sm">{d}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Process */}
        <section id="process" className="bg-sand py-20 sm:py-28">
          <div className="container-site">
            <SectionHeading eyebrow="How it works" title="Four steps. No surprises." />
            <ol className="relative mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4 lg:gap-0">
              <span aria-hidden="true" className="absolute top-[1.375rem] right-[12.5%] left-[12.5%] hidden h-px bg-line lg:block" />
              {steps.map(({ icon: Icon, t, d }, i) => (
                <li key={t} className="relative rounded-xl border border-line bg-white p-6 lg:border-0 lg:bg-transparent lg:px-6 lg:py-0 lg:text-center">
                  <span className="relative z-10 flex size-11 items-center justify-center rounded-full border border-line bg-white text-ink shadow-card lg:mx-auto">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <p className="mt-5 t-eyebrow text-brand">Step {i + 1}</p>
                  <h3 className="mt-1.5 text-base font-semibold">{t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* eVerify */}
        <section id="verify" className="relative overflow-hidden bg-ink py-20 text-white sm:py-28">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:44px_44px]"
          />
          <div className="container-site relative grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="t-eyebrow text-teal-300">{site.name} eVerify</p>
              <h2 className="mt-3 font-display text-3xl leading-tight font-medium tracking-[-0.015em] sm:text-[2.6rem]">
                Received a document from us? Check it in seconds.
              </h2>
              <p className="mt-5 max-w-md leading-relaxed text-white/70">
                Banks, embassies and partners can confirm that a report was issued by {site.name} and that the PDF has
                not been altered. Free, instant, no account needed.
              </p>
              <a href={site.verifyUrl} className="btn btn-lg mt-8 bg-white text-ink hover:bg-white/90">
                Verify a Document <ArrowUpRight />
              </a>
              <p className="mt-3 font-mono text-xs text-white/50">{verifyHost}</p>
            </div>
            <ul className="grid gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:grid-cols-2">
              {verifyFeatures.map(({ icon: Icon, t, d }) => (
                <li key={t} className="bg-ink p-6">
                  <Icon className="size-5 text-teal-300" aria-hidden="true" />
                  <h3 className="mt-4 font-semibold">{t}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/60">{d}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="py-20 sm:py-28">
          <div className="container-site">
            <div className="card grid gap-10 overflow-hidden p-6 sm:p-10 lg:grid-cols-[1.1fr_1fr] lg:p-14">
              <div>
                <p className="t-eyebrow text-brand">Contact</p>
                <h2 className="t-h1 mt-3">Tell us what you need.</h2>
                <p className="mt-4 max-w-md t-body">
                  Share your deadline and what the documents are for. We reply within one business day with a clear
                  quote.
                </p>
                <a href={consultHref} className="btn btn-brand btn-lg mt-8">
                  Book a Free Consultation <ArrowRight />
                </a>
              </div>
              <ul className="space-y-3 self-center">
                <ContactRow icon={Mail} label="Email" value={site.email} href={`mailto:${site.email}`} />
                {site.phone && <ContactRow icon={Phone} label="Phone" value={site.phone} href={`tel:${site.phone.replace(/\s/g, "")}`} />}
                {site.address && <ContactRow icon={MapPin} label="Office" value={site.address} />}
              </ul>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-sand">
        <div className="container-site grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo sub={site.shortTagline} fit />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">{site.description}</p>
          </div>
          <FooterCol title="Navigation" links={siteNav.map((l) => ({ href: l.href, label: l.label }))} />
          <FooterCol title="Services" links={services.map((s) => ({ href: "#services", label: s.t }))} />
          <div>
            <FooterCol
              title="Verification"
              links={[
                { href: site.verifyUrl, label: "Verify a document" },
                { href: "#verify", label: "How verification works" },
              ]}
            />
            <h3 className="mt-8 text-xs font-semibold tracking-[0.12em] text-ink uppercase">Contact</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-muted">
              <li><a href={`mailto:${site.email}`} className="transition hover:text-ink">{site.email}</a></li>
              {site.phone && <li><a href={`tel:${site.phone.replace(/\s/g, "")}`} className="transition hover:text-ink">{site.phone}</a></li>}
              {site.address && <li>{site.address}</li>}
            </ul>
          </div>
        </div>
        <div className="border-t border-line">
          <div className="container-site flex flex-col gap-2 py-6 text-xs text-muted sm:flex-row sm:justify-between">
            <span>© {new Date().getFullYear()} {site.legalName}. All rights reserved.</span>
            <a href={site.verifyUrl} className="transition hover:text-ink">{verifyHost}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="max-w-2xl">
      <p className="t-eyebrow text-brand">{eyebrow}</p>
      <h2 className="t-h1 mt-3">{title}</h2>
    </div>
  );
}

function ContactRow({ icon: Icon, label, value, href }: { icon: typeof Mail; label: string; value: string; href?: string }) {
  const inner = (
    <>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-tint text-brand">
        <Icon className="size-[1.125rem]" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-xs text-muted">{label}</span>
        <span className="block truncate text-[0.9375rem] font-semibold text-ink">{value}</span>
      </span>
    </>
  );
  return (
    <li>
      {href ? (
        <a href={href} className="flex items-center gap-4 rounded-xl border border-line p-4 transition hover:border-brand/40 hover:bg-brand-tint/40">
          {inner}
        </a>
      ) : (
        <div className="flex items-center gap-4 rounded-xl border border-line p-4">{inner}</div>
      )}
    </li>
  );
}

function FooterCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h3 className="text-xs font-semibold tracking-[0.12em] text-ink uppercase">{title}</h3>
      <ul className="mt-4 space-y-2.5 text-sm text-muted">
        {links.map((l) => (
          <li key={l.label}>
            <a href={l.href} className="transition hover:text-ink">{l.label}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
