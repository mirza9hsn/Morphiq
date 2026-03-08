import { motion } from 'framer-motion'

interface HeroCenteredProps {
  title: string
  subtitle?: string
  ctaPrimary?: string
  ctaSecondary?: string
}

export function HeroCentered({
  title,
  subtitle,
  ctaPrimary = 'Get Started',
  ctaSecondary = 'Learn More',
}: HeroCenteredProps) {
  return (
    <section
      style={{ background: 'var(--background)' }}
      className="py-24 px-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto text-center space-y-8"
      >
        <h1
          className="text-5xl md:text-6xl font-bold leading-tight"
          style={{ color: 'var(--foreground)' }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className="text-xl leading-relaxed"
            style={{ color: 'var(--muted-foreground)' }}
          >
            {subtitle}
          </p>
        )}
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            className="px-8 py-4 rounded-lg font-semibold text-base transition-opacity hover:opacity-90"
            style={{
              background: 'var(--primary)',
              color: 'var(--primary-foreground)',
            }}
          >
            {ctaPrimary}
          </button>
          <button
            className="px-8 py-4 rounded-lg font-semibold text-base transition-opacity hover:opacity-80"
            style={{
              background: 'transparent',
              color: 'var(--foreground)',
              border: '1px solid var(--border)',
            }}
          >
            {ctaSecondary}
          </button>
        </div>
      </motion.div>
    </section>
  )
}

export default HeroCentered
