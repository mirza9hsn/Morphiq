import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

interface HeroSplitProps {
  title: string
  subtitle?: string
  ctaText?: string
  ctaHref?: string
  imageSrc?: string
}

export function HeroSplit({
  title,
  subtitle,
  ctaText = 'Get Started',
  ctaHref = '#',
  imageSrc,
}: HeroSplitProps) {
  return (
    <section
      style={{ background: 'var(--background)' }}
      className="py-20 px-6"
    >
      <div
        className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center"
      >
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <h1
            className="text-5xl font-bold leading-tight"
            style={{ color: 'var(--foreground)' }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className="text-lg leading-relaxed"
              style={{ color: 'var(--muted-foreground)' }}
            >
              {subtitle}
            </p>
          )}
          <div className="flex gap-4">
            <a href={ctaHref}>
              <button
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-opacity hover:opacity-90"
                style={{
                  background: 'var(--primary)',
                  color: 'var(--primary-foreground)',
                }}
              >
                {ctaText}
                <ArrowRight size={16} />
              </button>
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          {imageSrc ? (
            <img
              src={imageSrc}
              alt="Hero"
              className="w-full rounded-2xl object-cover"
              style={{ aspectRatio: '4/3', border: '1px solid var(--border)' }}
            />
          ) : (
            <div
              className="w-full rounded-2xl"
              style={{
                aspectRatio: '4/3',
                background: 'var(--muted)',
                border: '1px solid var(--border)',
              }}
            />
          )}
        </motion.div>
      </div>
    </section>
  )
}

export default HeroSplit
