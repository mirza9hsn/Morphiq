import { motion } from 'framer-motion'

interface AlternatingItem {
  title: string
  description: string
  imageSrc?: string
}

interface FeaturesAlternatingProps {
  heading?: string
  items: AlternatingItem[]
}

export function FeaturesAlternating({
  heading,
  items = [],
}: FeaturesAlternatingProps) {
  return (
    <section
      style={{ background: 'var(--background)' }}
      className="py-20 px-6"
    >
      <div className="max-w-7xl mx-auto space-y-20">
        {heading && (
          <h2
            className="text-3xl md:text-4xl font-semibold text-center"
            style={{ color: 'var(--foreground)' }}
          >
            {heading}
          </h2>
        )}
        {items.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            className={`grid md:grid-cols-2 gap-12 items-center ${
              i % 2 === 1 ? 'md:[&>*:first-child]:order-2' : ''
            }`}
          >
            <div className="space-y-4">
              <h3
                className="text-2xl font-semibold"
                style={{ color: 'var(--foreground)' }}
              >
                {item.title}
              </h3>
              <p
                className="text-lg leading-relaxed"
                style={{ color: 'var(--muted-foreground)' }}
              >
                {item.description}
              </p>
            </div>
            <div>
              {item.imageSrc ? (
                <img
                  src={item.imageSrc}
                  alt={item.title}
                  className="w-full rounded-xl object-cover"
                  style={{
                    aspectRatio: '16/9',
                    border: '1px solid var(--border)',
                  }}
                />
              ) : (
                <div
                  className="w-full rounded-xl"
                  style={{
                    aspectRatio: '16/9',
                    background: 'var(--muted)',
                    border: '1px solid var(--border)',
                  }}
                />
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

export default FeaturesAlternating
