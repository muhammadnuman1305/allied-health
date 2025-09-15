"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Button,
} from "@/components/ui/button";
import {
  Leaf,
  Heart,
  BookOpen,
  Microscope,
  Users,
  Trophy,
  Activity,
  ArrowRight,
  GraduationCap,
  CheckCircle2,
  CircleUser,
  Globe,
  BarChart,
  Building,
  Medal
} from "lucide-react";

export default function AboutPage() {
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoaded(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const transitionClasses = "transition-all duration-500 ease-out";

  return (
    <>
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 bg-gradient-to-b from-primary/10 to-background dark:from-primary/5 dark:to-background">
        <div className={`container mx-auto px-4 flex flex-col items-center text-center ${transitionClasses} ${isPageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="flex items-center gap-2 text-primary mb-6">
            <Leaf className="h-8 w-8" />
            <span className="text-2xl md:text-3xl font-bold">Allied Health</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 max-w-3xl">
            Transforming Diabetes Management Through Technology
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            We're a team of healthcare professionals, engineers, and individuals with diabetes who believe in the power of personalized care.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Button asChild variant="outline" className="group">
              <a href="#mission">
                Our Mission
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </Button>
            
            <Button asChild variant="outline" className="group">
              <a href="#story">
                Our Story
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </Button>
            
            <Button asChild variant="outline" className="group">
              <a href="#team">
                Our Team
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-4xl mx-auto">
            {[
              { icon: Users, value: "50,000+", label: "Active Users" },
              { icon: Trophy, value: "93%", label: "User Satisfaction" },
              { icon: Activity, value: "1.2%", label: "Average A1C Reduction" },
              { icon: Heart, value: "24/7", label: "Support" }
            ].map((stat, index) => (
              <div 
                key={index} 
                className={`${transitionClasses} ${isPageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${200 + index * 100}ms` }}
              >
                <StatCard 
                  icon={stat.icon} 
                  value={stat.value} 
                  label={stat.label} 
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section id="mission" className="py-20 bg-muted/30 dark:bg-muted/10 relative">
        <div className="container mx-auto px-4">
          <div className={`grid md:grid-cols-2 gap-12 items-center ${transitionClasses} ${isPageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '300ms' }}>
            <div>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary mb-4">
                <Leaf className="mr-2 h-4 w-4" />
                Our Mission
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Making Diabetes Management Intuitive, Personalized, and Effective
              </h2>
              <p className="text-muted-foreground mb-6">
                Allied Health exists to transform the daily experience of living with diabetes. We believe that with the right tools, insights, and support, people with diabetes can lead fuller, healthier lives without the burden of constant worry about blood glucose levels.
              </p>
              <div className="space-y-4">
                {[
                  {
                    icon: CheckCircle2,
                    title: "Personalization",
                    description: "We believe that everyone's body responds differently, which is why our recommendations are uniquely tailored to each individual."
                  },
                  {
                    icon: CheckCircle2,
                    title: "Empowerment",
                    description: "We provide users with knowledge and tools to make confident decisions about their health every day."
                  },
                  {
                    icon: CheckCircle2,
                    title: "Accessibility",
                    description: "We're committed to making advanced diabetes management accessible to everyone, regardless of their technical knowledge."
                  }
                ].map((point, index) => (
                  <div key={index} className={`${transitionClasses} ${isPageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: `${400 + index * 100}ms` }}>
                    <MissionPoint
                      icon={point.icon}
                      title={point.title}
                      description={point.description}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="relative mx-auto max-w-sm md:max-w-none">
              <div className="aspect-square rounded-2xl border bg-card overflow-hidden relative shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-muted/20 flex items-center justify-center">
                  <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center">
                    <Heart className="h-12 w-12 text-primary/80" />
                  </div>
                </div>
                <div className="absolute top-12 left-12 w-16 h-16 bg-primary/10 rounded-full blur-lg"></div>
                <div className="absolute bottom-12 right-12 w-20 h-20 bg-primary/10 rounded-full blur-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section id="story" className="py-20 relative">
        <div className="absolute left-0 top-0 h-64 w-64 bg-primary/5 rounded-full blur-3xl -z-10"></div>
        <div className="absolute right-0 bottom-0 h-64 w-64 bg-primary/5 rounded-full blur-3xl -z-10"></div>
        
        <div className="container mx-auto px-4">
          <div className={`text-center max-w-3xl mx-auto mb-16 ${transitionClasses} ${isPageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '600ms' }}>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary mb-4">
              <BookOpen className="mr-2 h-4 w-4" />
              Our Story
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              From Personal Challenge to Global Solution
            </h2>
            <p className="text-muted-foreground">
              Our journey began when our founder, Dr. Sarah Johnson, was diagnosed with Type 1 diabetes at the age of 25. As both a patient and a physician, she experienced firsthand the gaps in diabetes management technology.
            </p>
          </div>
          
          <div className="relative">
            {/* Timeline */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border dark:bg-border/60 hidden md:block"></div>
            
            <div className="space-y-12 md:space-y-24 relative">
              {[
                {
                  year: "2018",
                  title: "The Beginning",
                  side: "left" as const,
                  description: "Dr. Johnson partnered with software engineer Michael Chen to create a prototype app for tracking glucose patterns in relation to meals and activities."
                },
                {
                  year: "2019",
                  title: "First Clinical Trial",
                  side: "right" as const,
                  description: "Our initial small-scale study with 50 participants showed an average A1C reduction of 0.8% after just three months of using our prototype."
                },
                {
                  year: "2020",
                  title: "Allied Health Is Born",
                  side: "left" as const,
                  description: "With seed funding secured, we officially launched Allied Health with our core team of doctors, engineers, dietitians, and patient advocates."
                },
                {
                  year: "2021",
                  title: "AI Integration",
                  side: "right" as const,
                  description: "We introduced our AI-powered meal analyzer and glucose prediction system, dramatically improving the accuracy of our recommendations."
                },
                {
                  year: "2022",
                  title: "Global Expansion",
                  side: "left" as const,
                  description: "Allied Health became available in 15 countries, with support for multiple languages and regional dietary preferences."
                },
                {
                  year: "2023",
                  title: "Research Partnerships",
                  side: "right" as const,
                  description: "We established partnerships with major research institutions to further advance diabetes management technology."
                },
                {
                  year: "Today",
                  title: "The Journey Continues",
                  side: "left" as const,
                  description: "With over 50,000 active users, we're continuously evolving our platform based on research, user feedback, and technological advances."
                }
              ].map((item, index) => (
                <div 
                  key={index} 
                  className={`${transitionClasses} ${isPageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                  style={{ transitionDelay: `${700 + index * 100}ms` }}
                >
                  <TimelineItem 
                    year={item.year}
                    title={item.title}
                    side={item.side}
                    description={item.description}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Our Approach */}
      <section id="approach" className="py-20 bg-muted/30 dark:bg-muted/10 relative">
        <div className="container mx-auto px-4">
          <div className={`text-center max-w-3xl mx-auto mb-16 ${transitionClasses} ${isPageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '1400ms' }}>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary mb-4">
              <Microscope className="mr-2 h-4 w-4" />
              Our Approach
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Science-Backed, User-Centered Design
            </h2>
            <p className="text-muted-foreground">
              Every feature in Allied Health is developed with a deep understanding of both the scientific principles of diabetes management and the real-life experiences of people living with diabetes.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: BarChart,
                title: "Data-Driven Insights",
                description: "We apply advanced pattern recognition to identify correlations between food, activity, medication, and glucose levels."
              },
              {
                icon: Users,
                title: "Co-Created With Patients",
                description: "Our development process involves continuous feedback from people with diabetes at every stage."
              },
              {
                icon: GraduationCap,
                title: "Evidence-Based Medicine",
                description: "All recommendations follow clinical guidelines and are regularly updated based on new research."
              },
              {
                icon: Globe,
                title: "Cultural Adaptation",
                description: "We adapt our dietary recommendations to include foods and meal patterns from diverse cultural backgrounds."
              },
              {
                icon: Building,
                title: "Healthcare Integration",
                description: "Allied Health is designed to complement medical care by providing shareable reports for healthcare providers."
              },
              {
                icon: Medal,
                title: "Continuous Improvement",
                description: "We're committed to constant refinement based on the latest research, technology, and user feedback."
              }
            ].map((item, index) => (
              <div 
                key={index} 
                className={`${transitionClasses} ${isPageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${1500 + index * 100}ms` }}
              >
                <ApproachCard 
                  icon={item.icon}
                  title={item.title}
                  description={item.description}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-20 relative">
        <div className="absolute left-0 top-0 h-64 w-64 bg-primary/5 rounded-full blur-3xl -z-10"></div>
        <div className="absolute right-0 bottom-0 h-64 w-64 bg-primary/5 rounded-full blur-3xl -z-10"></div>
        
        <div className="container mx-auto px-4">
          <div className={`text-center max-w-3xl mx-auto mb-16 ${transitionClasses} ${isPageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '2000ms' }}>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary mb-4">
              <Users className="mr-2 h-4 w-4" />
              Our Team
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Meet the People Behind Allied Health
            </h2>
            <p className="text-muted-foreground">
              Our diverse team combines expertise in medicine, technology, nutrition, and personal experience with diabetes.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-12">
            {[
              {
                name: "Dr. Sarah Johnson",
                role: "Founder & CEO",
                bio: "Endocrinologist with Type 1 diabetes who experienced firsthand the need for better management tools."
              },
              {
                name: "Michael Chen",
                role: "Co-Founder & CTO",
                bio: "Software engineer specializing in AI and machine learning applications in healthcare."
              },
              {
                name: "Dr. Maya Patel",
                role: "Chief Medical Officer",
                bio: "Diabetes specialist with 15 years of clinical experience and research in glucose management."
              },
              {
                name: "David Rodriguez",
                role: "Head of User Experience",
                bio: "Designer living with Type 1 diabetes for 20 years, focused on creating intuitive diabetes management tools."
              },
              {
                name: "Emma Thompson",
                role: "Lead Dietitian",
                bio: "Registered dietitian specializing in diabetes nutrition and culturally diverse dietary patterns."
              },
              {
                name: "James Wilson",
                role: "Head of Data Science",
                bio: "Former NASA data scientist now applying advanced analytics to improve diabetes management."
              }
            ].map((member, index) => (
              <div 
                key={index}
                className={`${transitionClasses} ${isPageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${2100 + index * 100}ms` }}
              >
                <TeamMember 
                  name={member.name}
                  role={member.role}
                  bio={member.bio}
                />
              </div>
            ))}
          </div>
          
          <div className={`text-center mt-12 ${transitionClasses} ${isPageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '2700ms' }}>
            <p className="text-muted-foreground mb-6">
              Beyond our core leadership, Allied Health is powered by a team of 50+ dedicated professionals across engineering, medicine, customer support, and operations.
            </p>
            <Link href="/careers">
              <Button variant="outline" className="group">
                Join Our Team
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Impact & Testimonials */}
      <section id="impact" className="py-20 bg-muted/30 dark:bg-muted/10 relative">
        <div className="container mx-auto px-4">
          <div className={`text-center max-w-3xl mx-auto mb-16 ${transitionClasses} ${isPageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '2800ms' }}>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary mb-4">
              <Trophy className="mr-2 h-4 w-4" />
              Our Impact
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Transforming Lives With Better Glucose Control
            </h2>
            <p className="text-muted-foreground">
              Our users report improved glucose levels, reduced stress, and better quality of life after using Allied Health.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                quote: "After 12 years with diabetes, Allied Health finally helped me understand my glucose patterns. My A1C dropped from 8.1% to 6.7% in four months.",
                name: "Robert M.",
                title: "Type 2 Diabetes, User for 6 months"
              },
              {
                quote: "As a mother of a child with Type 1, Allied Health has given us both confidence and better control. The meal suggestions actually work and my daughter loves them!",
                name: "Jennifer T.",
                title: "Mother of child with Type 1 Diabetes"
              },
              {
                quote: "The personalized insights about how different foods affect my glucose levels have been eye-opening. I've reduced my hypos by 70% since using Allied Health.",
                name: "Carlos G.",
                title: "Type 1 Diabetes, User for 1 year"
              }
            ].map((testimonial, index) => (
              <div 
                key={index}
                className={`${transitionClasses} ${isPageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${2900 + index * 100}ms` }}
              >
                <TestimonialCard 
                  quote={testimonial.quote}
                  name={testimonial.name}
                  title={testimonial.title}
                />
              </div>
            ))}
          </div>
          
          <div className={`bg-card dark:bg-card/50 border rounded-xl p-8 mt-12 max-w-3xl mx-auto ${transitionClasses} ${isPageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '3200ms' }}>
            <h3 className="text-xl font-bold mb-4 text-center">Our Research Impact</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ImpactStat 
                value="1.2%"
                label="Average A1C Reduction"
                description="In users who consistently use Allied Health for 6+ months"
              />
              
              <ImpactStat 
                value="68%"
                label="Fewer Hypoglycemic Events"
                description="Reduction in low blood sugar episodes in our users"
              />
              
              <ImpactStat 
                value="83%"
                label="Increased Confidence"
                description="Users reporting improved confidence in managing diabetes"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-b from-primary/10 to-primary/5 dark:from-primary/5 dark:to-background/80">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-3xl opacity-20" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/20 rounded-full blur-3xl opacity-20" />
        
        <div className="container mx-auto px-4 relative">
          <div className={`max-w-3xl mx-auto text-center space-y-8 ${transitionClasses} ${isPageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '3300ms' }}>
            <h2 className="text-3xl md:text-4xl font-bold">
              Join Us on Our Mission
            </h2>
            <p className="text-xl text-muted-foreground">
              Experience better diabetes management with personalized insights tailored just for you
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="group shadow-md hover:shadow-lg" asChild>
                <Link href="/login">
                  Start Your Journey 
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="group" asChild>
                <Link href="/contact">
                  Contact Our Team
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

// Helper Components
function StatCard({ icon: Icon, value, label }: { icon: React.ElementType; value: string; label: string }) {
  return (
    <div className="bg-card dark:bg-card/50 border border-border/60 rounded-xl p-4 text-center hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">
      <div className="flex justify-center mb-2">
        <div className="h-10 w-10 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center transition-all duration-300 group-hover:bg-primary/20 dark:group-hover:bg-primary/30">
          <Icon className="h-5 w-5 text-primary transition-transform duration-300 group-hover:scale-110" />
        </div>
      </div>
      <div className="text-xl font-bold transition-colors duration-300 group-hover:text-primary">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function MissionPoint({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="flex gap-4 group">
      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110">
        <Icon className="h-4 w-4 text-primary transition-transform duration-300 group-hover:scale-110" />
      </div>
      <div>
        <h3 className="text-lg font-medium mb-1 transition-colors duration-300 group-hover:text-primary">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function TimelineItem({ year, title, description, side = "left" }: { year: string; title: string; description: string; side?: "left" | "right" }) {
  return (
    <div className={`relative flex flex-col md:flex-row gap-4 items-center ${
      side === "right" ? "md:flex-row-reverse text-left md:text-right" : "text-left"
    }`}>
      {/* Center point with animation */}
      <div className="absolute left-1/2 top-6 w-6 h-6 bg-primary/20 rounded-full transform -translate-x-1/2 border-4 border-background dark:border-background hidden md:block transition-all duration-500 hover:bg-primary/40 hover:scale-125"></div>
      
      {/* Year */}
      <div className="md:hidden text-center md:text-right py-2 px-4 bg-primary/10 dark:bg-primary/20 rounded-full text-sm font-bold text-primary transition-all duration-300 hover:bg-primary/20 dark:hover:bg-primary/30">
        {year}
      </div>
      
      {/* Content with hover effects */}
      <div className={`md:w-[calc(50%_-_1rem)] bg-card dark:bg-card/50 border border-border/60 rounded-xl p-6 transition-all duration-300 hover:shadow-md hover:border-primary/30 group ${
        side === "left" ? "md:mr-auto" : "md:ml-auto"
      }`}>
        <div className="md:hidden text-lg font-bold mb-2 transition-colors duration-300 group-hover:text-primary">{title}</div>
        <div className="hidden md:block">
          <div className="text-primary font-bold mb-2">{year}</div>
          <div className="text-lg font-bold mb-2 transition-colors duration-300 group-hover:text-primary">{title}</div>
        </div>
        <p className="text-muted-foreground">{description}</p>
      </div>
      
      {/* Spacer for layout */}
      <div className="hidden md:block md:w-[calc(50%_-_1rem)]"></div>
    </div>
  );
}

function ApproachCard({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="bg-card dark:bg-card/50 border border-border/60 rounded-xl p-6 hover:shadow-md transition-all duration-300 hover:-translate-y-1 group h-full">
      <div className="h-12 w-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4 transition-all duration-300 group-hover:bg-primary/20 dark:group-hover:bg-primary/30">
        <Icon className="h-6 w-6 text-primary transition-transform duration-300 group-hover:scale-110" />
      </div>
      <h3 className="text-xl font-medium mb-2 transition-colors duration-300 group-hover:text-primary">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

function TeamMember({ name, role, bio }: { name: string; role: string; bio: string }) {
  return (
    <div className="bg-card dark:bg-card/50 border border-border/60 rounded-xl p-6 hover:shadow-md transition-all duration-300 hover:-translate-y-1 group h-full">
      <div className="flex justify-center mb-4 relative overflow-hidden">
        <div className="h-24 w-24 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center transition-all duration-500 group-hover:bg-primary/20 dark:group-hover:bg-primary/30">
          <CircleUser className="h-14 w-14 text-primary/70 transition-all duration-500 group-hover:scale-110 group-hover:text-primary" />
        </div>
        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 rounded-full transition-colors duration-300" />
      </div>
      <h3 className="text-xl font-medium text-center mb-1 transition-colors duration-300 group-hover:text-primary">{name}</h3>
      <p className="text-sm text-primary font-medium text-center mb-4">{role}</p>
      <p className="text-muted-foreground text-center">{bio}</p>
    </div>
  );
}

function TestimonialCard({ quote, name, title }: { quote: string; name: string; title: string }) {
  return (
    <div className="bg-card dark:bg-card/50 border border-border/60 rounded-xl p-6 hover:shadow-md transition-all duration-300 hover:-translate-y-1 h-full">
      <div className="text-primary mb-4">
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
        >
          <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
          <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
        </svg>
      </div>
      <p className="text-muted-foreground mb-6 italic">"{quote}"</p>
      <div className="pt-4 border-t">
        <p className="font-medium">{name}</p>
        <p className="text-sm text-muted-foreground">{title}</p>
      </div>
    </div>
  );
}

function ImpactStat({ value, label, description }: { value: string; label: string; description: string }) {
  return (
    <div className="text-center p-4">
      <div className="text-3xl font-bold text-primary mb-2">{value}</div>
      <div className="font-medium mb-1">{label}</div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}