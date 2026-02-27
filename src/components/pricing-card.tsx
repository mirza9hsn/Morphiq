"use client";

import * as React from 'react';
import { cn } from "@/lib/utils"; // Assuming a utility function for class merging
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatePresence, motion, useSpring, useTransform, MotionValue } from "framer-motion";
import { Check, X, Gift, Compass, Sparkles, Building, ArrowRight, Loader2 } from 'lucide-react';
import { useSubscriptionPlan } from "@/hooks/use-billings";

// --- 1. Typescript Interfaces (API) ---

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
  buttonLabel: string;
  features: Feature[];
  isTrialEligible?: boolean;
  icon?: React.ReactNode;
}

type PricingView = 'individual' | 'enterprise';

interface PricingComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The list of pricing tiers to display. */
  plans: PriceTier[];
  /** The currently selected billing cycle. */
  billingCycle: BillingCycle;
  /** Callback function when the user changes the billing cycle. */
  onCycleChange: (cycle: BillingCycle) => void;
  /** Callback function when a user selects a plan. */
  onPlanSelect: (planId: string, cycle: BillingCycle) => void;
}

// --- 2. Plan Data (Previously at bottom) ---

const individualPlans: PriceTier[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Get started with essential features at no cost',
    priceMonthly: 0,
    priceAnnually: 0,
    isPopular: false,
    buttonLabel: 'Get Started',
    icon: <Gift className="w-5 h-5" />,
    features: [
      { name: '10 free monthly credits', isIncluded: true },
      { name: 'Unlock all core platform features', isIncluded: true },
      { name: 'Build elegant Web and Mobile experiences', isIncluded: true },
      { name: 'Instant access to the most advanced models', isIncluded: true },
    ],
  },
  {
    id: 'starter',
    name: 'Standard',
    description: 'Perfect for first-time builders',
    priceMonthly: 19,
    priceAnnually: 168, // $14/mo (25% off = $168/yr)
    isPopular: false,
    isTrialEligible: true,
    buttonLabel: 'Get Started',
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
    priceAnnually: 252, // $21/mo (25% off = $252/yr)
    isPopular: true,
    buttonLabel: 'Get Started',
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
    buttonLabel: 'Book a demo',
    icon: <Building className="w-5 h-5 text-green-500" />,
    features: [
      { name: 'More usage', isIncluded: true },
      { name: 'Single sign-on (SSO) and domain capture', isIncluded: true },
      { name: 'Build elegant Web and Mobile experiences', isIncluded: true },
    ],
  },
];

// --- 3. Animation Components ---

const TICKER_HEIGHT = 40;

function TicketNumber({ mv, number }: { mv: MotionValue<number>; number: number }) {
  const y = useTransform(mv, (latest) => {
    const placeValue = latest % 10;
    let offset = (10 + number - placeValue) % 10;
    let memo = offset * TICKER_HEIGHT;
    if (offset > 5) {
      memo -= 10 * TICKER_HEIGHT;
    }
    return memo;
  });

  return (
    <motion.span
      style={{ y }}
      className="absolute inset-0 flex items-center justify-center font-bold"
    >
      {number}
    </motion.span>
  );
}

function Digit({ place, value }: { place: number; value: number }) {
  const valueRoundedToPlace = Math.floor(value / place);
  const animatedValue = useSpring(valueRoundedToPlace, {
    stiffness: 70,
    damping: 15,
    restDelta: 0.001
  });

  React.useEffect(() => {
    animatedValue.set(valueRoundedToPlace);
  }, [valueRoundedToPlace, animatedValue]);

  // Hide 0s for values smaller than the place (except units)
  const isHidden = value < place && place > 1;

  if (isHidden) return null;

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

// --- 4. Custom Toggle Component ---

const PricingToggle: React.FC<{
  cycle: BillingCycle;
  onChange: (cycle: BillingCycle) => void;
  discount: number;
}> = ({ cycle, onChange, discount }) => {
  return (
    <div className="flex items-center justify-center gap-6 mb-12 mt-4">
      <button
        onClick={() => onChange('monthly')}
        className={cn(
          "text-base font-semibold transition-colors cursor-pointer",
          cycle === 'monthly' ? "text-foreground" : "text-muted-foreground hover:text-foreground/80"
        )}
      >
        Monthly
      </button>
      <button
        onClick={() => onChange(cycle === 'monthly' ? 'annually' : 'monthly')}
        className="relative w-14 h-7 rounded-full bg-zinc-800 dark:bg-zinc-800 p-1 transition-colors duration-200 hover:bg-zinc-700 cursor-pointer"
        aria-label="Toggle billing cycle"
      >
        <motion.div
          animate={{ x: cycle === 'monthly' ? 0 : 28 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="w-5 h-5 bg-zinc-400 rounded-full shadow-lg"
        />
      </button>
      <button
        onClick={() => onChange('annually')}
        className={cn(
          "flex items-center gap-2 text-base font-semibold transition-colors cursor-pointer",
          cycle === 'annually' ? "text-foreground" : "text-muted-foreground hover:text-foreground/80"
        )}
      >
        <div className="flex flex-col items-end">
          <span>Annually</span>
          <span className="text-[10px] font-bold text-blue-400 dark:text-blue-400/90 leading-none">
            (Save {discount}%)
          </span>
        </div>
      </button>
    </div>
  );
};

// --- 5. Utility Components ---

/** Renders a single feature row with an icon. */
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

// --- 6. Main Component: PricingComponent ---

const PricingComponent: React.FC<PricingComponentProps> = ({
  plans: propsPlans, // Not currently used, as we use individualPlans/enterprisePlans internally
  billingCycle,
  onCycleChange,
  onPlanSelect,
  className,
  ...props
}) => {
  const [view, setView] = React.useState<PricingView>('individual');
  const { onSubscribe, activePlanId } = useSubscriptionPlan();

  const plans = view === 'individual' ? individualPlans : enterprisePlans;

  // No longer strictly requiring 3 plans
  if (plans.length === 0) {
    return null;
  }



  // --- 6.1. Tab Switcher ---
  const ViewSwitcher = (
    <div className="flex justify-center mb-12">
      <div className="flex p-1 bg-muted rounded-full border border-input shadow-sm theme-tab-switcher">
        <button
          onClick={() => setView('individual')}
          className={cn(
            "px-6 py-1.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer",
            view === 'individual'
              ? "bg-zinc-800 text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Individual
        </button>
        <button
          onClick={() => setView('enterprise')}
          className={cn(
            "px-6 py-1.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer",
            view === 'enterprise'
              ? "bg-zinc-100 text-zinc-900 shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Enterprise
        </button>
      </div>
    </div>
  );

  // Tiny toggle for the card
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
          "relative w-11 h-6 rounded-full transition-all duration-300 focus:outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer",
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

  // --- 6.2. Pricing Cards & Comparison Table Data ---

  // Extract all unique feature names across all plans for the comparison table header
  const allFeatures = Array.from(new Set(plans.flatMap(p => p.features.map(f => f.name))));

  // Render the list of pricing cards
  const PricingCards = (
    <div className={cn(
      "grid gap-8 w-full transition-all duration-500",
      view === 'enterprise' ? "max-w-md mx-auto grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
    )}>
      {plans.map((plan) => {
        const isFeatured = plan.id === 'pro'; // Hero package
        const isEnterprise = plan.id === 'enterprise';
        const isAnnually = billingCycle === 'annually';

        // Main price to display: either monthly price or discounted annual monthly rate
        const displayPrice = isAnnually
          ? (plan.priceAnnually && plan.priceAnnually > 0 ? plan.priceAnnually / 12 : plan.priceAnnually)
          : plan.priceMonthly;

        const priceSuffix = "/mo"; // Keep /mo consistent as requested for "discounted monthly rate" effect

        return (
          <Card
            key={plan.id}
            className={cn(
              "flex flex-col transition-all duration-300 shadow-md hover:shadow-lg dark:hover:shadow-white/10 relative overflow-hidden",
              isFeatured ? "shadow-2xl z-10 border-0" : "border border-input",
              isEnterprise && "bg-gradient-to-br from-white via-white to-green-50 dark:from-zinc-900 dark:via-zinc-900 dark:to-green-900/10 border-0 shadow-xl"
            )}
          >
            <CardHeader className="p-6 pb-4">
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                  <CardTitle className={cn("text-2xl font-bold flex items-center gap-2", isFeatured && "text-blue-600 dark:text-blue-400")}>
                    {plan.name}
                    {plan.icon}
                  </CardTitle>
                </div>
                {(!isEnterprise && plan.id !== 'free') && CardCycleToggle}
              </div>
              <CardDescription className="text-sm mt-1">{plan.description}</CardDescription>
              <div className="mt-4">
                {displayPrice !== undefined ? (
                  <div className="flex items-center justify-between w-full gap-3">
                    <div className="flex items-center text-4xl font-extrabold text-foreground">
                      <span>$</span>
                      <RollingNumber value={Math.round(displayPrice)} />
                      <span className="text-base font-normal text-muted-foreground ml-1">{priceSuffix}</span>
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
                  <div className="text-3xl font-extrabold text-foreground py-1">
                    Custom
                  </div>
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
                  if (plan.id === 'free') {
                    onPlanSelect(plan.id, billingCycle);
                  } else if (plan.id === 'enterprise') {
                    // Placeholder for enterprise contact
                    console.log("Enterprise demo requested");
                  } else {
                    onSubscribe(plan.id);
                  }
                }}
                disabled={activePlanId !== null && (plan.id === 'starter' || plan.id === 'pro')}
                className={cn(
                  "w-full transition-all duration-300 cursor-pointer hover:-translate-y-0.5 hover:shadow-lg active:scale-95",
                  isFeatured
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 dark:shadow-primary/40"
                    : "bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 hover:opacity-90",
                  isEnterprise && "bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/20"
                )}
                size="lg"
                aria-label={`Select ${plan.name} plan for ${displayPrice} ${priceSuffix}`}
              >
                {activePlanId === plan.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Redirecting...
                  </>
                ) : plan.buttonLabel}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );

  // --- 6.3. Comparison Table (Mobile hidden, Tablet/Desktop visible) ---
  const ComparisonTable = (
    <div className="mt-16 hidden md:block border rounded-lg overflow-x-auto shadow-sm dark:border-border/50">
      <table className="min-w-full divide-y divide-border/80 dark:divide-border/50">
        <thead>
          <tr className="bg-muted/30 dark:bg-muted/20">
            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 w-[200px] whitespace-nowrap">
              Feature
            </th>
            {plans.map((plan) => (
              <th
                key={`th-${plan.id}`}
                scope="col"
                className={cn(
                  "px-6 py-4 text-center text-sm font-semibold text-foreground/80 whitespace-nowrap",
                  plan.isPopular && "bg-primary/10 dark:bg-primary/20"
                )}
              >
                {plan.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/80 dark:divide-border/50 bg-background/90">
          {allFeatures.map((featureName, index) => (
            <tr key={featureName} className={cn("transition-colors hover:bg-accent/20 dark:hover:bg-accent/10", index % 2 === 0 ? "bg-background" : "bg-muted/10 dark:bg-muted/5")}>
              <td className="px-6 py-3 text-left text-sm font-medium text-foreground/90 whitespace-nowrap">
                {featureName}
              </td>
              {plans.map((plan) => {
                const feature = plan.features.find(f => f.name === featureName);
                const isIncluded = feature?.isIncluded ?? false;
                const Icon = isIncluded ? Check : X;
                const iconColor = isIncluded ? "text-primary" : "text-muted-foreground/70";

                return (
                  <td
                    key={`${plan.id}-${featureName}`}
                    className={cn(
                      "px-6 py-3 text-center transition-all duration-150",
                      plan.isPopular && "bg-primary/5 dark:bg-primary/10"
                    )}
                  >
                    <Icon className={cn("h-5 w-5 mx-auto", iconColor)} aria-hidden="true" />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // --- 6.4. Final Render ---
  return (
    <section className={cn("w-full py-12 px-4 bg-background", className)} {...props}>
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Choose the right plan for your business.
          </h2>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
            Transform your Design Workflow with AI-powered tools and unlimited creativity
          </p>
        </header>

        {/* Tab Switcher */}
        {ViewSwitcher}

        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {PricingCards}
          </motion.div>
        </AnimatePresence>

        {/* 6.3. (Optional) Comparison Table below the cards */}
        {ComparisonTable}
      </div>
    </section>
  );
};


/** 
 * Default Export with example data 
 */
export default function PricingSection() {
  const [billingCycle, setBillingCycle] = React.useState<BillingCycle>('annually');

  const handleCycleChange = (newCycle: BillingCycle) => {
    setBillingCycle(newCycle);
  };

  const handlePlanSelect = (planId: string, currentCycle: BillingCycle) => {
    console.log(`User selected plan: ${planId} with cycle: ${currentCycle}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center py-20">
      <PricingComponent
        plans={individualPlans}
        billingCycle={billingCycle}
        onCycleChange={handleCycleChange}
        onPlanSelect={handlePlanSelect}
      />
    </div>
  );
}