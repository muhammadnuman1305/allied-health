"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Check, Activity, BarChart, Droplet, Heart, Leaf, ShoppingCart, Clock, Shield, MessageSquare, Users, Smartphone, Share2 } from "lucide-react";
import Link from "next/link";

export default function FeaturesPage() {
  // For animations based on visibility
  const [animatedSections, setAnimatedSections] = useState<{[key: string]: boolean}>({});
  
  useEffect(() => {
    // Simple function to sequentially reveal sections with a slight delay
    const timer = setTimeout(() => {
      setAnimatedSections({
        hero: true,
        features: true,
        glucose: true,
        nutrition: true,
        additional: true,
        comparison: true,
        cta: true
      });
    }, 100); // Small initial delay for better user experience
    
    return () => clearTimeout(timer);
  }, []);

  // Define major features
  const mainFeatures = [
    {
      icon: <Droplet className="h-12 w-12 text-primary" />,
      title: "Glucose Tracking",
      description: "Easily log and monitor your blood glucose levels with our intuitive tracking tools.",
      highlights: ["Customizable target ranges", "Data visualization", "Trend analysis"],
      cta: { text: "Try Glucose Tracking", href: "#glucose-tracking" }
    },
    {
      icon: <Leaf className="h-12 w-12 text-primary" />,
      title: "Nutrition Management",
      description: "Access our extensive food database with glycemic index ratings to make informed dietary choices.",
      highlights: ["150,000+ food database", "Glycemic index ratings", "Carb counting tools"],
      cta: { text: "Explore Nutrition Tools", href: "#nutrition" }
    },
    {
      icon: <BarChart className="h-12 w-12 text-primary" />,
      title: "Health Analytics",
      description: "Visualize your health data with comprehensive charts and insights to identify patterns.",
      highlights: ["Pattern recognition", "Detailed reports", "Exportable data"],
      cta: { text: "See Analytics Demo", href: "#analytics" }
    },
    {
      icon: <Activity className="h-12 w-12 text-primary" />,
      title: "Activity Monitoring",
      description: "Track your exercise and see how different activities affect your glucose levels.",
      highlights: ["Exercise impact analysis", "Activity recommendations", "Integration with fitness apps"],
      cta: { text: "Learn About Activity Tracking", href: "#activity" }
    },
    {
      icon: <ShoppingCart className="h-12 w-12 text-primary" />,
      title: "Meal Planning",
      description: "Create personalized meal plans optimized for your health goals and dietary preferences.",
      highlights: ["Personalized recommendations", "Grocery lists", "Recipe suggestions"],
      cta: { text: "Discover Meal Planning", href: "#meal-planning" }
    },
    {
      icon: <Heart className="h-12 w-12 text-primary" />,
      title: "Health Reminders",
      description: "Never miss a medication or check-up with our customizable reminder system.",
      highlights: ["Medication reminders", "Check-up schedules", "Customizable alerts"],
      cta: { text: "Set Up Reminders", href: "#reminders" }
    }
  ];

  // Additional features with less highlight
  const additionalFeatures = [
    {
      icon: <MessageSquare className="h-6 w-6 text-primary" />,
      title: "Community Support",
      description: "Connect with others on similar health journeys to share experiences and advice."
    },
    {
      icon: <Users className="h-6 w-6 text-primary" />,
      title: "Healthcare Team Access",
      description: "Share your health data with your doctors and caregivers for better coordinated care."
    },
    {
      icon: <Smartphone className="h-6 w-6 text-primary" />,
      title: "Mobile App",
      description: "Access your health data and tools on the go with our user-friendly mobile application."
    },
    {
      icon: <Share2 className="h-6 w-6 text-primary" />,
      title: "Data Export",
      description: "Export your health data in various formats for personal records or healthcare providers."
    }
  ];

  // Feature comparison for different plans
  const comparisonFeatures = [
    { name: "Glucose logging", basic: true, premium: true, family: true },
    { name: "Basic analytics", basic: true, premium: true, family: true },
    { name: "Food database", basic: "Limited", premium: "Full", family: "Full" },
    { name: "Meal planning", basic: false, premium: true, family: true },
    { name: "Activity impact analysis", basic: false, premium: true, family: true },
    { name: "Medication reminders", basic: false, premium: true, family: true },
    { name: "Pattern recognition", basic: false, premium: true, family: true },
    { name: "Healthcare sharing", basic: false, premium: true, family: true },
    { name: "Family accounts", basic: false, premium: false, family: "Up to 5" },
    { name: "Support level", basic: "Email", premium: "Priority", family: "24/7" }
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden bg-gradient-to-b from-primary/10 to-background dark:from-primary/5 dark:to-background">
        <div 
          className={`container mx-auto px-4 flex flex-col items-center text-center space-y-10 transition-all duration-700 ${
            animatedSections.hero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-3xl">
            Features That <span className="text-primary">Empower</span> Your Health Journey
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Allied Health provides comprehensive tools to help you manage diabetes and maintain optimal health.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button size="lg" className="relative overflow-hidden group" asChild>
              <Link href="/login">
                <span className="relative z-10">Start Free Trial</span>
                <span className="absolute inset-0 bg-white/10 translate-y-[102%] group-hover:translate-y-0 transition-transform duration-300 rounded-md" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="group" asChild>
              <Link href="/pricing">
                View Pricing
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Main Features Grid */}
      <section className="py-20 bg-muted/30 dark:bg-muted/10 relative" id="main-features">
        <div className="container mx-auto px-4">
          <div 
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-all duration-700 ${
              animatedSections.features ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {mainFeatures.map((feature, index) => (
              <Card 
                key={index} 
                className="flex flex-col h-full hover:shadow-md transition-all duration-300 border-border hover:border-primary/20"
                style={{ 
                  transitionDelay: `${index * 100}ms`,
                  transition: "all 0.3s ease",
                  transform: animatedSections.features ? "translateY(0)" : "translateY(20px)",
                  opacity: animatedSections.features ? 1 : 0
                }}
              >
                <CardHeader>
                  <div className="mb-4 transition-all duration-300 group-hover:text-primary">
                    {feature.icon}
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-2 mt-2">
                    {feature.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-muted-foreground">
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full group hover:bg-primary/5" 
                    asChild
                  >
                    <Link href={feature.cta.href}>
                      {feature.cta.text}
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Glucose Tracking Feature Section */}
      <section className="py-20 relative" id="glucose-tracking">
        <div className="absolute left-0 top-0 h-64 w-64 bg-primary/5 rounded-full blur-3xl -z-10"></div>
        <div className="absolute right-0 bottom-0 h-64 w-64 bg-primary/5 rounded-full blur-3xl -z-10"></div>
        
        <div className="container mx-auto px-4">
          <div 
            className={`grid grid-cols-1 md:grid-cols-2 gap-12 items-center transition-all duration-700 ${
              animatedSections.glucose ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary mb-4">
                <Droplet className="mr-2 h-4 w-4" />
                Glucose Tracking
              </div>
              <h2 className="text-3xl font-bold mb-4">Monitor Your Blood Sugar with Ease</h2>
              <p className="text-muted-foreground mb-6">
                Our advanced glucose tracking system helps you record, analyze, and understand your blood sugar patterns. 
                Identify trends and receive actionable insights to maintain optimal glucose levels.
              </p>
              
              <ul className="space-y-4">
                {[
                  "Log glucose readings manually or sync with compatible CGMs",
                  "Set personalized target ranges and receive alerts",
                  "View detailed graphs and statistics of your glucose trends",
                  "Identify patterns in how food, activity, and medication affect your readings",
                  "Export reports to share with your healthcare provider"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              
              <Button className="group mt-4" asChild>
                <Link href="/auth/signup">
                  Try Glucose Tracking
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
            
            <div 
              className="relative aspect-square max-w-md mx-auto"
              style={{ 
                transitionDelay: "200ms",
                transition: "all 0.5s ease",
                transform: animatedSections.glucose ? "translateY(0)" : "translateY(20px)",
                opacity: animatedSections.glucose ? 1 : 0
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-primary/5 rounded-2xl" />
              
              <div className="absolute inset-0 rounded-2xl border bg-card/80 backdrop-blur-sm shadow-xl overflow-hidden">
                {/* Mockup of glucose tracking UI */}
                <div className="absolute top-0 left-0 right-0 h-12 bg-card border-b flex items-center px-4">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <Droplet className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium">Glucose Tracker</span>
                </div>
                
                <div className="absolute top-16 inset-x-4 bottom-4">
                  {/* Graph area */}
                  <div className="h-1/2 bg-card/60 rounded-xl border mb-4 p-4 relative">
                    <div className="absolute inset-4">
                      {/* Chart lines */}
                      <div className="absolute left-0 right-0 h-[1px] bg-border top-1/4"></div>
                      <div className="absolute left-0 right-0 h-[1px] bg-border top-2/4"></div>
                      <div className="absolute left-0 right-0 h-[1px] bg-border top-3/4"></div>
                      
                      {/* Target range */}
                      <div className="absolute left-0 right-0 h-1/3 top-1/3 bg-primary/5 border-y border-primary/20"></div>
                      
                      {/* Graph line */}
                      <svg className="absolute inset-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path 
                          d="M0,50 C10,40 20,70 30,60 C40,50 50,30 60,45 C70,60 80,55 90,40 L90,100 L0,100 Z" 
                          fill="rgba(34, 197, 94, 0.1)" 
                        />
                        <path 
                          d="M0,50 C10,40 20,70 30,60 C40,50 50,30 60,45 C70,60 80,55 90,40" 
                          fill="none" 
                          stroke="rgba(34, 197, 94, 0.8)" 
                          strokeWidth="1.5" 
                        />
                        {/* Data points */}
                        <circle cx="0" cy="50" r="2" fill="#22c55e" />
                        <circle cx="10" cy="40" r="2" fill="#22c55e" />
                        <circle cx="20" cy="70" r="2" fill="#22c55e" />
                        <circle cx="30" cy="60" r="2" fill="#22c55e" />
                        <circle cx="40" cy="50" r="2" fill="#22c55e" />
                        <circle cx="50" cy="30" r="2" fill="#22c55e" />
                        <circle cx="60" cy="45" r="2" fill="#22c55e" />
                        <circle cx="70" cy="60" r="2" fill="#22c55e" />
                        <circle cx="80" cy="55" r="2" fill="#22c55e" />
                        <circle cx="90" cy="40" r="2" fill="#22c55e" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-card/60 rounded-lg border p-4">
                      <div className="text-sm text-muted-foreground mb-1">Average</div>
                      <div className="text-xl font-bold">118 mg/dL</div>
                    </div>
                    <div className="bg-card/60 rounded-lg border p-4">
                      <div className="text-sm text-muted-foreground mb-1">In Range</div>
                      <div className="text-xl font-bold">85%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nutrition Management Feature Section */}
      <section className="py-20 bg-muted/30 dark:bg-muted/10 relative" id="nutrition">
        <div className="container mx-auto px-4">
          <div 
            className={`grid grid-cols-1 md:grid-cols-2 gap-12 items-center transition-all duration-700 ${
              animatedSections.nutrition ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div 
              className="relative aspect-square max-w-md mx-auto order-2 md:order-1"
              style={{ 
                transitionDelay: "200ms",
                transition: "all 0.5s ease",
                transform: animatedSections.nutrition ? "translateY(0)" : "translateY(20px)",
                opacity: animatedSections.nutrition ? 1 : 0
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-primary/5 rounded-2xl" />
              
              <div className="absolute inset-0 rounded-2xl border bg-card/80 backdrop-blur-sm shadow-xl overflow-hidden">
                {/* Mockup of nutrition UI */}
                <div className="absolute top-0 left-0 right-0 h-12 bg-card border-b flex items-center px-4">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <Leaf className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium">Nutrition Manager</span>
                </div>
                
                <div className="absolute top-16 inset-x-4 bottom-4">
                  {/* Food database */}
                  <div className="space-y-3">
                    {[
                      { name: "Brown Rice", gi: "Low", carbs: "45g" },
                      { name: "Grilled Chicken", gi: "None", carbs: "0g" },
                      { name: "Broccoli", gi: "Very Low", carbs: "6g" },
                      { name: "Whole Wheat Bread", gi: "Medium", carbs: "12g" },
                      { name: "Apple", gi: "Low", carbs: "15g" },
                    ].map((food, idx) => (
                      <div key={idx} className="bg-card/60 rounded-lg border p-3 flex justify-between items-center">
                        <div>
                          <div className="font-medium">{food.name}</div>
                          <div className="text-sm text-muted-foreground">GI: {food.gi}</div>
                        </div>
                        <div className="bg-primary/10 rounded-full px-2 py-1 text-xs font-medium text-primary">
                          {food.carbs}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="order-1 md:order-2">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary mb-4">
                <Leaf className="mr-2 h-4 w-4" />
                Nutrition Management
              </div>
              <h2 className="text-3xl font-bold mb-4">Make Informed Food Choices</h2>
              <p className="text-muted-foreground mb-6">
                Our comprehensive nutrition database helps you understand how different foods affect your 
                blood sugar levels. Make smarter choices and build meal plans that support stable glucose.
              </p>
              
              <ul className="space-y-4">
                {[
                  "Access a database of over 150,000 foods with glycemic index ratings",
                  "Track carbohydrates, protein, fat, and calories for better meal planning",
                  "Receive personalized food recommendations based on your glucose trends",
                  "Create and save meal plans that support your health goals",
                  "Scan barcodes for quick and accurate food logging"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              
              <Button className="group mt-4" asChild>
                <Link href="/auth/signup">
                  Explore Nutrition Tools
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Features Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div 
            className={`text-center mb-16 transition-all duration-700 ${
              animatedSections.additional ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Additional Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore more ways Allied Health can support your health journey
            </p>
          </div>
          
          <div 
            className={`grid grid-cols-1 sm:grid-cols-2 gap-6 transition-all duration-700 ${
              animatedSections.additional ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {additionalFeatures.map((feature, index) => (
              <div 
                key={index} 
                className="flex gap-4 p-6 bg-card border rounded-xl hover:shadow-md transition-all duration-300 h-full hover:border-primary/20"
                style={{ 
                  transitionDelay: `${index * 100}ms`,
                  transition: "all 0.3s ease",
                  transform: animatedSections.additional ? "translateY(0)" : "translateY(20px)",
                  opacity: animatedSections.additional ? 1 : 0
                }}
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Section */}
      <section className="py-20 bg-muted/30 dark:bg-muted/10 relative">
        <div className="container mx-auto px-4">
          <div 
            className={`text-center mb-16 transition-all duration-700 ${
              animatedSections.comparison ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Feature Comparison</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that best fits your needs
            </p>
          </div>
          
          <div 
            className={`transition-all duration-700 ${
              animatedSections.comparison ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="relative overflow-x-auto rounded-xl border bg-card shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-6 py-4 text-left font-medium">Feature</th>
                    <th className="px-6 py-4 text-center font-medium">
                      <div className="mb-1">Basic</div>
                      <div className="text-sm font-normal text-muted-foreground">Free</div>
                    </th>
                    <th className="px-6 py-4 text-center font-medium bg-primary/5 border-x border-primary/10">
                      <div className="mb-1">Premium</div>
                      <div className="text-sm font-normal text-muted-foreground">$9.99/month</div>
                    </th>
                    <th className="px-6 py-4 text-center font-medium">
                      <div className="mb-1">Family</div>
                      <div className="text-sm font-normal text-muted-foreground">$19.99/month</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((feature, index) => (
                    <tr key={index} className={index % 2 === 0 ? "bg-muted/30" : ""}>
                      <td className="px-6 py-4">{feature.name}</td>
                      <td className="px-6 py-4 text-center">
                        {typeof feature.basic === "boolean" ? (
                          feature.basic ? <Check className="h-5 w-5 text-primary mx-auto" /> : <span className="text-muted-foreground">—</span>
                        ) : (
                          <span>{feature.basic}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center bg-primary/5 border-x border-primary/10">
                        {typeof feature.premium === "boolean" ? (
                          feature.premium ? <Check className="h-5 w-5 text-primary mx-auto" /> : <span className="text-muted-foreground">—</span>
                        ) : (
                          <span>{feature.premium}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {typeof feature.family === "boolean" ? (
                          feature.family ? <Check className="h-5 w-5 text-primary mx-auto" /> : <span className="text-muted-foreground">—</span>
                        ) : (
                          <span>{feature.family}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-b from-primary/10 to-primary/5 dark:from-primary/5 dark:to-background/80">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-3xl opacity-20" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/20 rounded-full blur-3xl opacity-20" />
        
        <div className="container mx-auto px-4 relative">
          <div 
            className={`max-w-3xl mx-auto text-center space-y-8 transition-all duration-700 ${
              animatedSections.cta ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to take control of your health?
            </h2>
            <p className="text-xl text-muted-foreground">
              Start your free trial today and experience the full power of Allied Health
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <Button size="lg" className="group shadow-md hover:shadow-lg" asChild>
                <Link href="/login">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              
              <Button size="lg" variant="outline" className="group" asChild>
                <Link href="/pricing">
                  View Pricing
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}