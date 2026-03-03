"use client";

import * as React from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatePresence, motion, useSpring, useTransform, MotionValue } from "framer-motion";
import { Check, X, Compass, Sparkles, Building, Loader2 } from 'lucide-react';
import { useSubscriptionPlan } from "@/hooks/use-billings";

// --- 1. Typescript Interfaces ---

type BillingCycle = 'monthly' | 'annually';

interface Feature {
  name: string;
  isIncluded: boolean;
  tooltip?: string;
}

interface PriceTier {
  id: string;
  name: string;
  description: string;
  priceMonthly?: number;
  priceAnnually?: number;
  isPopular: boolean;
  features: Feature[];
  isTrialEligible?: boolean;
  icon?: React.ReactNode;
}

interface PricingComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  plans: PriceTier[];
  billingCycle: BillingCycle;
  onCycleChange: (cycle: BillingCycle) => void;
  onPlanSelect: (planId: string, cycle: BillingCycle) => void;
  /** The current active plan code from the user's subscription */
  activePlanCode?: string | null;
}

// Plan hierarchy for Upgrade/Downgrade logic (higher index = higher tier)
const PLAN_RANK: Record<string, number> = {
  free: 0,
  starter: 1,
  pro: 2,
  enterprise: 3,
};

// --- 2. Plan Data ---

export const individualPlans: PriceTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for first-time builders',
    priceMonthly: 19,
    priceAnnually: 168,
    isPopular: false,
    isTrialEligible: true,
    icon: <Compass className="w-5 h-5 text-blue-500" />,
    features: [
      { name: 'Build web & mobile apps', isIncluded: true },
      { name: 'Private project hosting', isIncluded: true },
      { name: '100 credits per month', isIncluded: true },
      { name: 'Purchase extra credits as needed', isIncluded: true },
      { name: 'GitHub integration', isIncluded: true },
      { name: 'Fork tasks', isIncluded: true },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Built for serious creators and brands',
    priceMonthly: 29,
    priceAnnually: 252,
    isPopular: true,
    icon: <Sparkles className="w-5 h-5 text-yellow-500" />,
    features: [
      { name: '1M context window', isIncluded: true },
      { name: 'Ultra thinking', isIncluded: true },
      { name: 'System Prompt Edit', isIncluded: true },
      { name: 'Create custom AI agents', isIncluded: true },
      { name: 'High-performance computing', isIncluded: true },
      { name: '750 Monthly Credits', isIncluded: true },
      { name: 'Priority customer support', isIncluded: true },
    ],
  },
];

const enterprisePlans: PriceTier[] = [
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations with custom needs',
    priceMonthly: undefined,
    priceAnnually: undefined,
    isPopular: false,
    icon: <Building className="w-5 h-5 text-green-500" />,
    features: [
      { name: 'More usage', isIncluded: true },
      { name: 'Single sign-on (SSO) and domain capture', isIncluded: true },
      { name: 'Build elegant Web and Mobile experiences', isIncluded: true },
    ],
  },
];

export const allPlans: PriceTier[] = [...individualPlans, ...enterprisePlans];

// --- 3. Animation Components ---

const TICKER_HEIGHT = 40;

function TicketNumber({ mv, number }: { mv: MotionValue<number>; number: number }) {
  const y = useTransform(mv, (latest) => {
    const placeValue = latest % 10;
    let offset = (10 + number - placeValue) % 10;
    let memo = offset * TICKER_HEIGHT;
    if (offset > 5) memo -= 10 * TICKER_HEIGHT;
    return memo;
  });
  return (
    <motion.span style={{ y }} className="absolute inset-0 flex items-center justify-center font-bold">
      {number}
    </motion.span>
  );
}

function Digit({ place, value }: { place: number; value: number }) {
  const valueRoundedToPlace = Math.floor(value / place);
  const animatedValue = useSpring(valueRoundedToPlace, { stiffness: 70, damping: 15, restDelta: 0.001 });

  React.useEffect(() => {
    animatedValue.set(valueRoundedToPlace);
  }, [valueRoundedToPlace, animatedValue]);

  if (value < place && place > 1) return null;

  return (
    <div style={{ height: TICKER_HEIGHT }} className="relative w-[1ch] tabular-nums overflow-hidden">
      {[...Array(10).keys()].map((i) => (
        <TicketNumber key={i} mv={animatedValue} number={i} />
      ))}
    </div>
  );
}

function RollingNumber({ value }: { value: number }) {
  return (
    <div className="flex items-center justify-start overflow-hidden leading-none">
      <Digit place={100} value={value} />
      <Digit place={10} value={value} />
      <Digit place={1} value={value} />
    </div>
  );
}

// --- 4. Utility Components ---

const FeatureItem: React.FC<{ feature: Feature }> = ({ feature }) => {
  const Icon = feature.isIncluded ? Check : X;
  const iconColor = feature.isIncluded ? "text-primary" : "text-muted-foreground";
  return (
    <li className="flex items-start space-x-3 py-2">
      <Icon className={cn("h-4 w-4 flex-shrink-0 mt-0.5", iconColor)} aria-hidden="true" />
      <span className={cn("text-sm", feature.isIncluded ? "text-foreground" : "text-muted-foreground")}>
        {feature.name}
      </span>
    </li>
  );
};

// --- 5. Main Component ---

export const PricingComponent: React.FC<PricingComponentProps> = ({
  billingCycle,
  onCycleChange,
  onPlanSelect,
  activePlanCode,
  className,
  ...props
}) => {
  const { onSubscribe, activePlanId } = useSubscriptionPlan();

  const currentRank = PLAN_RANK[activePlanCode ?? 'free'] ?? 0;

  const getButtonLabel = (plan: PriceTier, isCurrentPlan: boolean): string => {
    if (isCurrentPlan) return 'Current Plan';
    if (plan.id === 'enterprise') return 'Book Demo';
    const planRank = PLAN_RANK[plan.id] ?? 0;
    if (activePlanCode && activePlanCode !== 'free') {
      return planRank > currentRank ? 'Upgrade' : 'Downgrade';
    }
    return 'Get Started';
  };

  const CardCycleToggle = (
    <div className="flex items-center gap-2.5">
      <div className="flex flex-col items-end leading-none">
        <span className="text-lg text-foreground font-bold italic line-clamp-1">Annual</span>
        <span className="text-[12px] text-green-500 font-bold whitespace-nowrap">-25% OFF</span>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onCycleChange(billingCycle === 'monthly' ? 'annually' : 'monthly');
        }}
        className={cn(
          "relative w-11 h-6 rounded-full transition-all duration-300 focus:outline-none cursor-pointer",
          billingCycle === 'annually' ? "bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.4)]" : "bg-zinc-300 dark:bg-zinc-700"
        )}
      >
        <motion.div
          animate={{ x: billingCycle === 'annually' ? 24 : 4 }}
          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );

  return (
    <section className={cn("w-full py-4 px-4 bg-background", className)} {...props}>
      <div className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid gap-8 w-full grid-cols-1 md:grid-cols-3">
              {allPlans.map((plan) => {
                const isEnterprise = plan.id === 'enterprise';
                const isAnnually = billingCycle === 'annually';
                // Only highlight if user is on a real paid plan
                const isCurrentPlan = !!activePlanCode && activePlanCode !== 'free' && activePlanCode === plan.id;
                const isRedirecting = activePlanId === plan.id;

                const displayPrice = isAnnually
                  ? (plan.priceAnnually && plan.priceAnnually > 0 ? plan.priceAnnually / 12 : plan.priceAnnually)
                  : plan.priceMonthly;

                const buttonLabel = getButtonLabel(plan, isCurrentPlan);

                return (
                  <Card
                    key={plan.id}
                    className={cn(
                      "flex flex-col transition-all duration-300 shadow-md hover:shadow-lg dark:hover:shadow-white/10 relative overflow-hidden border border-input",
                      isCurrentPlan && "ring-2 ring-primary"
                    )}
                  >
                    {isCurrentPlan && (
                      <div className="absolute top-3 right-3 px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full uppercase tracking-wider z-10">
                        Current Plan
                      </div>
                    )}
                    <CardHeader className="p-6 pb-4">
                      <div className="flex justify-between items-center mb-1">
                        <CardTitle className="text-2xl font-bold flex items-center gap-2">
                          {plan.name}
                        </CardTitle>
                        {!isEnterprise && CardCycleToggle}
                      </div>
                      <CardDescription className="text-sm mt-1">{plan.description}</CardDescription>
                      <div className="mt-4">
                        {displayPrice !== undefined ? (
                          <div className="flex items-center justify-between w-full gap-3">
                            <div className="flex items-center text-4xl font-extrabold text-foreground">
                              <span>$</span>
                              <RollingNumber value={Math.round(displayPrice)} />
                              <span className="text-base font-normal text-muted-foreground ml-1">/mo</span>
                            </div>
                            {isAnnually && plan.priceMonthly !== undefined && plan.priceMonthly > 0 && plan.priceAnnually !== undefined && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="px-2 py-1 bg-green-500/20 text-green-500 dark:text-green-400 text-[10px] font-bold rounded uppercase tracking-wider shadow-sm"
                              >
                                Save ${(plan.priceMonthly * 12) - plan.priceAnnually}
                              </motion.div>
                            )}
                          </div>
                        ) : (
                          <div className="text-3xl font-extrabold text-foreground py-1">Custom</div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow p-6 pt-0">
                      <h4 className="text-sm font-semibold mb-2 mt-4 text-foreground/80">Key Features:</h4>
                      <ul className="list-none space-y-0">
                        {plan.features.slice(0, 5).map((feature) => (
                          <FeatureItem key={feature.name} feature={feature} />
                        ))}
                        {plan.features.length > 5 && (
                          <li className="text-sm text-muted-foreground mt-2">
                            + {plan.features.length - 5} more features
                          </li>
                        )}
                      </ul>
                    </CardContent>
                    <CardFooter className="p-6 pt-0">
                      <Button
                        onClick={() => {
                          if (isEnterprise) {
                            console.log("Enterprise demo requested");
                          } else {
                            onSubscribe(plan.id);
                          }
                        }}
                        disabled={isCurrentPlan || (activePlanId !== null && !isEnterprise)}
                        className={cn(
                          "w-full transition-all duration-300 cursor-pointer hover:-translate-y-0.5 hover:shadow-lg active:scale-95",
                          isCurrentPlan
                            ? "opacity-60 cursor-not-allowed"
                            : "bg-primary text-primary-foreground hover:opacity-90"
                        )}
                        size="lg"
                      >
                        {isRedirecting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Redirecting...
                          </>
                        ) : buttonLabel}
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default function PricingSection() {
  const [billingCycle, setBillingCycle] = React.useState<BillingCycle>('annually');
  return (
    <div className="w-full bg-background text-foreground py-6">
      <PricingComponent
        plans={allPlans}
        billingCycle={billingCycle}
        onCycleChange={setBillingCycle}
        onPlanSelect={() => { }}
      />
    </div>
  );
}
