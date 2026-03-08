interface FooterSimpleProps {
  logo?: string
  links: { label: string; href: string }[]
  copyright?: string
}

export function FooterSimple({
  logo = 'Brand',
  links = [],
  copyright,
}: FooterSimpleProps) {
  const year = new Date().getFullYear()

  return (
    <footer
      style={{
        background: 'var(--background)',
        borderTop: '1px solid var(--border)',
      }}
      className="py-12 px-6"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <span
          className="text-lg font-bold"
          style={{ color: 'var(--foreground)' }}
        >
          {logo}
        </span>
        <div className="flex flex-wrap gap-6 justify-center">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm transition-opacity hover:opacity-70"
              style={{ color: 'var(--muted-foreground)' }}
            >
              {link.label}
            </a>
          ))}
        </div>
        <p
          className="text-sm"
          style={{ color: 'var(--muted-foreground)' }}
        >
          {copyright || `© ${year} ${logo}. All rights reserved.`}
        </p>
      </div>
    </footer>
  )
}

export default FooterSimple
