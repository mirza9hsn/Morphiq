import { motion } from 'framer-motion'
import { Quote } from 'lucide-react'

interface Testimonial {
  quote: string
  author: string
  role?: string
}

interface TestimonialCardsProps {
  testimonials: Testimonial[]
}

export function TestimonialCards({ testimonials = [] }: TestimonialCardsProps) {
  return (
    <section
      style={{ background: 'var(--muted)' }}
      className="py-20 px-6"
    >
      <div className="max-w-7xl mx-auto">
        <h2
          className="text-3xl md:text-4xl font-semibold text-center mb-16"
          style={{ color: 'var(--foreground)' }}
        >
          What our customers say
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.author}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="p-6 rounded-xl space-y-4"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
              }}
            >
              <Quote size={20} style={{ color: 'var(--primary)' }} />
              <p
                className="text-base leading-relaxed"
                style={{ color: 'var(--card-foreground)' }}
              >
                "{t.quote}"
              </p>
              <div>
                <p
                  className="font-semibold text-sm"
                  style={{ color: 'var(--card-foreground)' }}
                >
                  {t.author}
                </p>
                {t.role && (
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    {t.role}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TestimonialCards
