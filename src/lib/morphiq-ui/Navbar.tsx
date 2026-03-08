import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'

interface NavbarProps {
  logo?: string
  links: { label: string; href: string }[]
  ctaText?: string
  ctaHref?: string
}

export function Navbar({
  logo = 'Brand',
  links = [],
  ctaText = 'Get Started',
  ctaHref = '#',
}: NavbarProps) {
  const [open, setOpen] = useState(false)

  return (
    <nav
      style={{
        background: 'var(--background)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        width: '100%',
      }}
    >
      <div
        style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem' }}
        className="flex items-center justify-between h-16"
      >
        <span
          className="text-xl font-bold tracking-tight"
          style={{ color: 'var(--foreground)' }}
        >
          {logo}
        </span>

        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium transition-opacity hover:opacity-70"
              style={{ color: 'var(--muted-foreground)' }}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:block">
          <a href={ctaHref}>
            <button
              className="px-5 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
              style={{
                background: 'var(--primary)',
                color: 'var(--primary-foreground)',
              }}
            >
              {ctaText}
            </button>
          </a>
        </div>

        <button
          className="md:hidden p-1"
          onClick={() => setOpen(!open)}
          style={{ color: 'var(--foreground)' }}
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden"
            style={{
              borderTop: '1px solid var(--border)',
              background: 'var(--background)',
            }}
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  {link.label}
                </a>
              ))}
              <a href={ctaHref}>
                <button
                  className="w-full px-5 py-2 rounded-lg text-sm font-semibold"
                  style={{
                    background: 'var(--primary)',
                    color: 'var(--primary-foreground)',
                  }}
                >
                  {ctaText}
                </button>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navbar
