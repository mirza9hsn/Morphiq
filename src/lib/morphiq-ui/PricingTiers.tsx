import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

interface PricingTier {
  name: string
  price: string
  description?: string
  features: string[]
  ctaText?: string
  featured?: boolean
}

interface PricingTiersProps {
  tiers: PricingTier[]
}

export function PricingTiers({ tiers = [] }: PricingTiersProps) {
  return (
    <section
      style={{ background: 'var(--background)' }}
      className="py-20 px-6"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2
            className="text-3xl md:text-4xl font-semibold"
            style={{ color: 'var(--foreground)' }}
          >
            Simple, transparent pricing
          </h2>
          <p
            className="text-lg"
            style={{ color: 'var(--muted-foreground)' }}
          >
            No hidden fees. Cancel anytime.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 items-start">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-2xl p-8 space-y-6"
              style={{
                background: tier.featured ? 'var(--primary)' : 'var(--card)',
                border: `1px solid ${tier.featured ? 'transparent' : 'var(--border)'}`,
                boxShadow: tier.featured ? '0 20px 40px rgba(0,0,0,0.15)' : 'none',
              }}
            >
              {tier.featured && (
                <span
                  className="inline-block text-xs font-semibold px-3 py-1 rounded-full"
                  style={{
                    background: 'var(--primary-foreground)',
                    color: 'var(--primary)',
                  }}
                >
                  Most Popular
                </span>
              )}
              <div>
                <h3
                  className="text-lg font-semibold"
                  style={{
                    color: tier.featured
                      ? 'var(--primary-foreground)'
                      : 'var(--card-foreground)',
                  }}
                >
                  {tier.name}
                </h3>
                {tier.description && (
                  <p
                    className="text-sm mt-1 opacity-80"
                    style={{
                      color: tier.featured
                        ? 'var(--primary-foreground)'
                        : 'var(--muted-foreground)',
                    }}
                  >
                    {tier.description}
                  </p>
                )}
              </div>
              <p
                className="text-4xl font-bold"
                style={{
                  color: tier.featured
                    ? 'var(--primary-foreground)'
                    : 'var(--card-foreground)',
                }}
              >
                {tier.price}
              </p>
              <ul className="space-y-3">
                {tier.features.map((feat) => (
                  <li key={feat} className="flex items-center gap-3 text-sm">
                    <Check
                      size={16}
                      style={{
                        color: tier.featured
                          ? 'var(--primary-foreground)'
                          : 'var(--primary)',
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        color: tier.featured
                          ? 'var(--primary-foreground)'
                          : 'var(--card-foreground)',
                      }}
                    >
                      {feat}
                    </span>
                  </li>
                ))}
              </ul>
              <button
                className="w-full py-3 rounded-lg font-semibold text-sm transition-opacity hover:opacity-90"
                style={
                  tier.featured
                    ? {
                        background: 'var(--primary-foreground)',
                        color: 'var(--primary)',
                      }
                    : {
                        background: 'var(--primary)',
                        color: 'var(--primary-foreground)',
                      }
                }
              >
                {tier.ctaText || 'Get started'}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default PricingTiers
