import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

interface CTACenteredProps {
  heading: string
  subheading?: string
  ctaText?: string
  ctaHref?: string
}

export function CTACentered({
  heading,
  subheading,
  ctaText = 'Get Started Free',
  ctaHref = '#',
}: CTACenteredProps) {
  return (
    <section
      style={{ background: 'var(--primary)' }}
      className="py-20 px-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto text-center space-y-8"
      >
        <h2
          className="text-3xl md:text-4xl font-bold leading-tight"
          style={{ color: 'var(--primary-foreground)' }}
        >
          {heading}
        </h2>
        {subheading && (
          <p
            className="text-lg opacity-90"
            style={{ color: 'var(--primary-foreground)' }}
          >
            {subheading}
          </p>
        )}
        <a href={ctaHref}>
          <button
            className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-semibold text-base transition-opacity hover:opacity-90 mt-2"
            style={{
              background: 'var(--primary-foreground)',
              color: 'var(--primary)',
            }}
          >
            {ctaText}
            <ArrowRight size={18} />
          </button>
        </a>
      </motion.div>
    </section>
  )
}

export default CTACentered
