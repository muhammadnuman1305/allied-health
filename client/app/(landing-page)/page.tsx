"use client";

import { useEffect, useState, useRef, useCallback, memo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Leaf,
  BarChart,
  Heart,
  MessageSquare,
  Activity,
  Users,
  CheckCircle2,
  ArrowRight,
  Apple,
  Droplet,
  Clock,
  Shield,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface VisibleSections {
  features?: boolean;
  howItWorks?: boolean;
  testimonials?: boolean;
  pricing?: boolean;
  cta?: boolean;
}

// Consolidated intersection observer - much more efficient
function useSectionObserver() {
  const [visibleSections, setVisibleSections] = useState<VisibleSections>({});
  const observerRef = useRef<IntersectionObserver>();
  const sectionsRef = useRef(new Map());

  useEffect(() => {
    const options = { threshold: 0.1, rootMargin: "0px 0px -10% 0px" };
    observerRef.current = new IntersectionObserver((entries) => {
      const updates: Record<string, boolean> = {};
      entries.forEach((entry) => {
        const target = entry.target as HTMLElement; // Type assertion to HTMLElement
        const id = target.dataset.section;
        if (id) {
          updates[id] = entry.isIntersecting;
        }
      });

      // Batch state updates for better performance
      if (Object.keys(updates).length > 0) {
        setVisibleSections((prev) => ({ ...prev, ...updates }));
      }
    }, options);

    // Observe all sections
    sectionsRef.current.forEach((section) => {
      if (section && observerRef.current) observerRef.current.observe(section);
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Create a callback ref that adds elements to our Map
  const registerSection = useCallback(
    (id: string) => (element: HTMLElement | null) => {
      if (!element) {
        return;
      }

      element.dataset.section = id;
      sectionsRef.current.set(id, element);

      // If observer already exists, observe this element
      if (observerRef.current) {
        observerRef.current.observe(element);
      }
    },
    []
  );

  return { registerSection, visibleSections };
}

// Pre-defined data arrays to avoid recreating them on each render
const FEATURES_DATA = [
  {
    icon: Droplet,
    title: "Glucose Monitoring",
    description:
      "Track blood sugar levels with easy logging, pattern recognition, and customizable target ranges.",
  },
  {
    icon: Apple,
    title: "Carb-Conscious Meal Planning",
    description:
      "Get personalized meal recommendations based on your glucose readings, carb preferences, and glycemic impact.",
  },
  {
    icon: BarChart,
    title: "Glucose Insights & Trends",
    description:
      "Visualize the relationship between your diet, activity, and glucose levels with AI-powered analytics.",
  },
  {
    icon: Activity,
    title: "Activity Impact Tracking",
    description:
      "See how different types of exercise affect your glucose levels and get activity recommendations.",
  },
  {
    icon: Clock,
    title: "Medication & Testing Reminders",
    description:
      "Never miss a medication dose or glucose check with customizable reminders and notifications.",
  },
  {
    icon: Shield,
    title: "Healthcare Provider Sharing",
    description:
      "Easily share your glucose data, meal plans, and activity with your healthcare team.",
  },
];

const STEPS_DATA = [
  {
    number: "01",
    title: "Track Your Glucose",
    description:
      "Log your readings manually or sync with compatible glucose monitors to establish your baseline patterns.",
  },
  {
    number: "02",
    title: "Get Personalized Plans",
    description:
      "Receive customized meal and activity recommendations based on your glucose patterns and preferences.",
  },
  {
    number: "03",
    title: "See Real Results",
    description:
      "Watch your glucose stability improve as you follow your personalized recommendations.",
  },
];

const TESTIMONIALS_DATA = [
  {
    quote:
      "Allied Health helped me lower my A1C from 8.2% to 6.5% in just 3 months. The meal recommendations are delicious and actually work for my blood sugar.",
    name: "Sarah Johnson",
    title: "Type 2 Diabetes, User for 6 months",
  },
  {
    quote:
      "As an endocrinologist, I recommend Allied Health to my patients. The glucose pattern insights help me provide more personalized care between visits.",
    name: "Dr. Michael Chen",
    title: "Endocrinologist",
  },
  {
    quote:
      "Living with Type 1 for 15 years, this is the first app that actually shows me how different foods affect my glucose. Game-changer for dose calculations.",
    name: "David Rodriguez",
    title: "Type 1 Diabetes, User for 1 year",
  },
];

const PRICING_DATA = [
  {
    title: "Basic",
    price: "Free",
    description: "Essential tools to start managing your diabetes",
    features: [
      "Basic glucose tracking",
      "Standard meal suggestions",
      "Limited activity tracking",
      "Community access",
      "Email support",
    ],
    buttonText: "Get Started",
    buttonVariant: "outline",
    href: "/login",
    highlighted: false,
  },
  {
    title: "Premium",
    price: "$9.99",
    period: "per month",
    description: "Advanced features for comprehensive diabetes management",
    features: [
      "Advanced glucose pattern detection",
      "Personalized meal plans with GI ratings",
      "Detailed nutrition analysis",
      "Medication reminders",
      "Healthcare provider sharing",
      "Priority support",
    ],
    buttonText: "Subscribe Now",
    buttonVariant: "default",
    href: "/login",
    highlighted: true,
  },
  {
    title: "Family",
    price: "$19.99",
    period: "per month",
    description: "Support multiple family members with diabetes",
    features: [
      "Up to 5 family members",
      "All Premium features",
      "Family meal planning",
      "Caregiver notifications",
      "Comparative analytics",
      "24/7 support",
    ],
    buttonText: "Choose Family",
    buttonVariant: "outline",
    href: "/login",
    highlighted: false,
  },
];

// Optimized animated section that only rerenders when visibility changes
const AnimatedSection = memo(function AnimatedSection({
  children,
  delay = 0,
  visible,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  visible: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "transform transition-all duration-700",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        className
      )}
      style={{
        transitionDelay: `${delay}ms`,
        willChange: visible ? "opacity, transform" : "auto",
      }}
    >
      {children}
    </div>
  );
});

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

const FeatureCard = memo(function FeatureCard({
  icon: Icon,
  title,
  description,
}: FeatureCardProps) {
  return (
    <div className="bg-card dark:bg-card/50 border border-border/60 rounded-xl p-6 space-y-4 hover:shadow-md transition-all duration-300 hover:-translate-y-1 h-full group">
      <div className="h-12 w-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center relative overflow-hidden">
        <Icon className="h-6 w-6 text-primary relative z-10" />
      </div>
      <h3 className="text-xl font-medium">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
});

const StepCard = memo(function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-card dark:bg-card/50 border border-border/60 rounded-xl p-6 space-y-4 hover:shadow-md transition-all duration-300 hover:-translate-y-1 h-full relative z-10">
      <div className="h-16 w-16 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
        {number}
      </div>
      <h3 className="text-xl font-medium">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
});

const TestimonialCard = memo(function TestimonialCard({
  quote,
  name,
  title,
}: {
  quote: string;
  name: string;
  title: string;
}) {
  return (
    <div className="bg-card dark:bg-card/50 border border-border/60 rounded-xl p-6 space-y-4 hover:shadow-md transition-all duration-300 hover:-translate-y-1 h-full">
      <div className="text-primary">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-8 w-8 opacity-50"
          aria-hidden="true"
        >
          <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
          <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
        </svg>
      </div>
      <p className="text-muted-foreground italic">"{quote}"</p>
      <div className="pt-4 border-t flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          {name.charAt(0)}
        </div>
        <div>
          <p className="font-medium">{name}</p>
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
      </div>
    </div>
  );
});

const PricingCard = memo(function PricingCard({
  title,
  price,
  period,
  description,
  features,
  buttonText,
  buttonVariant = "default",
  href,
  highlighted = false,
}: {
  title: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonVariant?: "default" | "outline";
  href: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={cn(
        "bg-card dark:bg-card/50 border border-border/60 rounded-xl p-6 space-y-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-lg relative",
        highlighted
          ? "ring-2 ring-primary shadow-lg md:scale-105 z-10"
          : "hover:border-primary/50"
      )}
    >
      {highlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
          Most Popular
        </div>
      )}
      <div>
        <h3 className="text-xl font-medium">{title}</h3>
        <div className="mt-4 flex items-baseline">
          <span className="text-3xl font-bold">{price}</span>
          {period && (
            <span className="ml-1 text-sm text-muted-foreground">{period}</span>
          )}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>
      <ul className="space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <CheckCircle2 className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>
      <Button
        variant={buttonVariant}
        className={cn(
          "w-full group",
          highlighted
            ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
            : ""
        )}
        asChild
      >
        <Link href={href}>
          {buttonText}
          <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </Button>
    </div>
  );
});

// Main exported component
export default function LandingPage() {
  // Use the optimized section observer
  const { registerSection, visibleSections } = useSectionObserver();

  return (
    <div className="flex flex-col">
      {/* Modern Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Modern gradient background without the problematic SVG pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-background -z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(#38a16922_1px,transparent_1px)] [background-size:20px_20px] opacity-10 -z-10" />

        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left content side */}
            <div className="space-y-8 max-w-xl">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                <Leaf className="h-4 w-4 mr-2" aria-hidden="true" />
                <span className="text-sm font-medium">
                  Diabetes Management Simplified
                </span>
              </div>

              <div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                  Your{" "}
                  <span className="text-primary relative">
                    Intelligent
                    <span className="absolute bottom-1 left-0 w-full h-2 bg-primary/10 -z-10 rounded"></span>
                  </span>{" "}
                  Health Companion
                </h1>

                <p className="text-xl text-muted-foreground max-w-lg">
                  Smart meal plans, glucose insights, and AI-powered
                  recommendations designed for your unique diabetic profile.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all px-6 h-14 text-base rounded-xl"
                  asChild
                >
                  <Link href="/login">Start Your Journey</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="group border-primary/20 h-14 text-base rounded-xl"
                  asChild
                >
                  <Link href="/features">
                    See How It Works
                    <ArrowRight
                      className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </Link>
                </Button>
              </div>

              {/* Stats/Trusted By section */}
              <div className="border-t pt-6 mt-8 grid grid-cols-3 gap-4">
                <div>
                  <div className="text-2xl font-bold text-primary">10k+</div>
                  <div className="text-sm text-muted-foreground">
                    Active Users
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">92%</div>
                  <div className="text-sm text-muted-foreground">
                    Improved A1C
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">150+</div>
                  <div className="text-sm text-muted-foreground">
                    Expert Recipes
                  </div>
                </div>
              </div>
            </div>

            {/* Right image/feature side */}
            <div className="lg:ml-auto relative">
              <div className="relative bg-gradient-to-tr from-background to-primary/5 rounded-2xl p-1 shadow-xl">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-primary/5 to-primary/20 opacity-20 blur-xl"></div>

                <div className="relative bg-card rounded-xl overflow-hidden shadow-md p-6 lg:p-8 border border-border/80">
                  {/* App feature showcase */}
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Leaf
                            className="h-5 w-5 text-primary"
                            aria-hidden="true"
                          />
                        </div>
                        <span className="font-semibold text-lg">Allied Health</span>
                      </div>
                      <div className="h-8 w-8 rounded-full bg-card border flex items-center justify-center">
                        <div className="h-4 w-4 rounded-full bg-primary/80"></div>
                      </div>
                    </div>

                    <div className="bg-background/50 rounded-lg p-4 shadow-sm border border-border/60">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium">Today's Overview</h3>
                        <Clock
                          className="h-4 w-4 text-muted-foreground"
                          aria-hidden="true"
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                          <Droplet
                            className="h-10 w-10 text-primary p-2 bg-primary/10 rounded-lg"
                            aria-hidden="true"
                          />
                          <div>
                            <div className="text-sm text-muted-foreground">
                              Glucose Level
                            </div>
                            <div className="font-semibold text-foreground text-xl">
                              121 mg/dL
                            </div>
                          </div>
                          <div className="ml-auto px-2 py-1 bg-green-500/10 text-green-500 text-xs rounded-full">
                            Normal
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-background/80 rounded-lg border border-border/40">
                          <Apple
                            className="h-10 w-10 text-primary p-2 bg-primary/10 rounded-lg"
                            aria-hidden="true"
                          />
                          <div>
                            <div className="text-sm text-muted-foreground">
                              Carbs Today
                            </div>
                            <div className="font-semibold text-foreground text-xl">
                              68g
                            </div>
                          </div>
                          <div className="ml-auto">
                            <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
                              <div className="h-full w-1/2 bg-primary rounded-full"></div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-background/80 rounded-lg border border-border/40">
                          <Activity
                            className="h-10 w-10 text-primary p-2 bg-primary/10 rounded-lg"
                            aria-hidden="true"
                          />
                          <div>
                            <div className="text-sm text-muted-foreground">
                              Next Meal
                            </div>
                            <div className="font-semibold text-foreground">
                              Mediterranean Bowl
                            </div>
                          </div>
                          <ArrowRight
                            className="h-4 w-4 ml-auto text-muted-foreground"
                            aria-hidden="true"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-medium">Weekly Glucose Trend</h3>
                      </div>

                      <div className="h-28 relative">
                        <div className="absolute inset-x-0 bottom-0 h-px bg-border"></div>
                        <div className="absolute inset-x-0 bottom-1/3 h-px bg-border opacity-50"></div>
                        <div className="absolute inset-x-0 bottom-2/3 h-px bg-border opacity-50"></div>

                        {/* Simplified chart */}
                        <div className="absolute bottom-0 inset-x-0 h-full flex items-end">
                          {[
                            { height: "40%", value: "124 mg/dL" },
                            { height: "60%", value: "145 mg/dL" },
                            { height: "45%", value: "130 mg/dL" },
                            { height: "35%", value: "110 mg/dL" },
                            { height: "50%", value: "135 mg/dL" },
                            { height: "75%", value: "156 mg/dL" },
                            { height: "55%", value: "140 mg/dL" },
                          ].map((bar, index) => (
                            <div key={index} className="flex-1 mx-1 group">
                              <div
                                style={{ height: bar.height }}
                                className={`${
                                  index === 5 ? "bg-primary" : "bg-primary/20"
                                } rounded-t-sm relative group`}
                              >
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-primary/90 text-white text-xs px-2 py-1 rounded pointer-events-none whitespace-nowrap">
                                  {bar.value}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between text-xs text-muted-foreground pt-1">
                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                          (day, i) => (
                            <div key={i}>{day}</div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 h-12 w-12 bg-primary/10 rounded-full blur-xl"></div>
              <div className="absolute -bottom-8 -left-8 h-16 w-16 bg-primary/10 rounded-full blur-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        ref={registerSection("features")}
        className="py-24 bg-muted/30 dark:bg-muted/10 relative overflow-hidden"
      >
        <div className="container mx-auto px-4">
          <AnimatedSection
            visible={!!visibleSections.features}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Diabetes Management Tools
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to maintain healthy glucose levels and improve
              your quality of life
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {FEATURES_DATA.map((feature, index) => (
              <AnimatedSection
                key={index}
                visible={!!visibleSections.features}
                delay={Math.min(index * 100, 500)}
              >
                <FeatureCard
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section ref={registerSection("howItWorks")} className="py-24 relative">
        <div className="container mx-auto px-4">
          <AnimatedSection
            visible={!!visibleSections.howItWorks}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How Allied Health Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our science-backed approach helps you maintain optimal glucose
              levels
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
            {/* Connecting line between steps */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-primary/20 dark:bg-primary/10 -translate-y-1/2 hidden md:block" />

            {STEPS_DATA.map((step, index) => (
              <AnimatedSection
                key={index}
                visible={!!visibleSections.howItWorks}
                delay={Math.min(index * 200, 500)}
              >
                <StepCard
                  number={step.number}
                  title={step.title}
                  description={step.description}
                />
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        ref={registerSection("testimonials")}
        className="py-24 bg-muted/30 dark:bg-muted/10 relative"
      >
        <div className="container mx-auto px-4">
          <AnimatedSection
            visible={!!visibleSections.testimonials}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Success Stories
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Real results from people who've improved their diabetes management
              with Allied Health
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {TESTIMONIALS_DATA.map((testimonial, index) => (
              <AnimatedSection
                key={index}
                visible={!!visibleSections.testimonials}
                delay={Math.min(index * 100, 300)}
              >
                <TestimonialCard
                  quote={testimonial.quote}
                  name={testimonial.name}
                  title={testimonial.title}
                />
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section ref={registerSection("pricing")} className="py-24 relative">
        <div className="container mx-auto px-4">
          <AnimatedSection
            visible={!!visibleSections.pricing}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pricing Plans for Every Need
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Affordable options to support your diabetes management journey
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {PRICING_DATA.map((plan, index) => (
              <AnimatedSection
                key={index}
                visible={!!visibleSections.pricing}
                delay={Math.min(index * 100, 300)}
              >
                <PricingCard
                  title={plan.title}
                  price={plan.price}
                  period={plan.period || ""}
                  description={plan.description}
                  features={plan.features}
                  buttonText={plan.buttonText}
                  buttonVariant={plan.buttonVariant as "default" | "outline"}
                  href={plan.href}
                  highlighted={plan.highlighted}
                />
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        ref={registerSection("cta")}
        className="py-24 relative overflow-hidden"
      >
        {/* Simpler gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-primary/5 dark:from-primary/5 dark:to-background/80" />

        <div className="container mx-auto px-4 relative">
          <AnimatedSection
            visible={!!visibleSections.cta}
            className="max-w-3xl mx-auto text-center space-y-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold">
              Take Control of Your Diabetes Today
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of users who have improved their glucose control
              and quality of life with Allied Health
            </p>
            <Button
              size="lg"
              className="mt-4 group shadow-md hover:shadow-lg"
              asChild
            >
              <Link href="/login">
                Start Your Journey
                <ArrowRight
                  className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            </Button>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
