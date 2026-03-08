import { motion } from 'framer-motion'

interface HeroMinimalProps {
  title: string
  subtitle?: string
}

export function HeroMinimal({ title, subtitle }: HeroMinimalProps) {
  return (
    <section
      style={{ background: 'var(--background)' }}
      className="py-24 px-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        <h1
          className="text-5xl font-bold leading-tight mb-4"
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
      </motion.div>
    </section>
  )
}

export default HeroMinimal
