import { motion } from 'framer-motion'

interface Stat {
  value: string
  label: string
}

interface StatsSectionProps {
  heading?: string
  stats: Stat[]
}

export function StatsSection({ heading, stats = [] }: StatsSectionProps) {
  return (
    <section
      style={{ background: 'var(--primary)' }}
      className="py-20 px-6"
    >
      <div className="max-w-7xl mx-auto">
        {heading && (
          <h2
            className="text-3xl font-semibold text-center mb-16"
            style={{ color: 'var(--primary-foreground)' }}
          >
            {heading}
          </h2>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center space-y-2"
            >
              <p
                className="text-4xl font-bold"
                style={{ color: 'var(--primary-foreground)' }}
              >
                {stat.value}
              </p>
              <p
                className="text-sm font-medium opacity-80"
                style={{ color: 'var(--primary-foreground)' }}
              >
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default StatsSection
