import type { ComponentType } from 'react'
import { motion } from 'framer-motion'
import { Zap, Shield, BarChart2, Star, Globe, Layers } from 'lucide-react'

const ICON_MAP: Record<string, ComponentType<{ size?: number }>> = {
  Zap,
  Shield,
  BarChart: BarChart2,
  BarChart2,
  Star,
  Globe,
  Layers,
}

interface Feature {
  icon: string
  title: string
  description: string
}

interface Features3ColProps {
  heading?: string
  features: Feature[]
}

export function Features3Col({
  heading = 'Everything you need',
  features = [],
}: Features3ColProps) {
  return (
    <section
      style={{ background: 'var(--background)' }}
      className="py-20 px-6"
    >
      <div className="max-w-7xl mx-auto">
        {heading && (
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-semibold text-center mb-16"
            style={{ color: 'var(--foreground)' }}
          >
            {heading}
          </motion.h2>
        )}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, i) => {
            const IconComponent = ICON_MAP[feature.icon] || Zap
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-6 rounded-xl space-y-4"
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
                >
                  <IconComponent size={18} />
                </div>
                <h3
                  className="text-lg font-semibold"
                  style={{ color: 'var(--card-foreground)' }}
                >
                  {feature.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  {feature.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default Features3Col
