import Link from 'next/link'

type InfoPageShellProps = {
  eyebrow: string
  title: string
  description: string
  points: string[]
  primaryHref?: string
  primaryLabel?: string
  secondaryHref?: string
  secondaryLabel?: string
}

export default function InfoPageShell({
  eyebrow,
  title,
  description,
  points,
  primaryHref = '/search',
  primaryLabel = 'Browse listings',
  secondaryHref = '/',
  secondaryLabel = 'Back home',
}: InfoPageShellProps) {
  return (
    <section className="section-wrap py-10">
      <div className="surface-card p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-electric-blue">{eyebrow}</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-foreground md:text-4xl">{title}</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">{description}</p>

        <ul className="mt-6 grid gap-3 md:grid-cols-2">
          {points.map((point) => (
            <li key={point} className="rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground">
              {point}
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={primaryHref} className="cta-electric">
            {primaryLabel}
          </Link>
          <Link href={secondaryHref} className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground">
            {secondaryLabel}
          </Link>
        </div>
      </div>
    </section>
  )
}