"use client";

import Link from "next/link";
import { Leaf } from "lucide-react";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LandingFooter() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-muted/30 dark:bg-muted/10 border-t pt-16 pb-8">
      <div className="container px-4 mx-auto">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-6 lg:grid-cols-10">
          {/* Logo and description */}
          <div className="md:col-span-3 lg:col-span-4">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 mb-4 transition-transform hover:scale-105 group"
              aria-label="Allied Health Home"
            >
              <div className="flex items-center justify-center h-8 w-8 rounded-md bg-primary/10 dark:bg-primary/20 group-hover:bg-primary/20 transition-colors">
                <Leaf className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xl font-bold tracking-tight">Allied Health</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs mb-6">
              Your intelligent health companion for managing diabetes and living
              a healthier life with personalized insights and plans.
            </p>
            <div className="flex gap-4 mb-6">
              <SocialLink href="#" icon={<Facebook className="h-5 w-5" />} label="Facebook" />
              <SocialLink href="#" icon={<Twitter className="h-5 w-5" />} label="Twitter" />
              <SocialLink href="#" icon={<Instagram className="h-5 w-5" />} label="Instagram" />
              <SocialLink href="#" icon={<Linkedin className="h-5 w-5" />} label="LinkedIn" />
            </div>

            {/* Newsletter signup - new addition */}
            <div className="max-w-xs">
              <h3 className="text-sm font-medium mb-3">Stay Updated</h3>
              <div className="flex gap-2">
                <Input 
                  type="email" 
                  placeholder="Your email" 
                  className="max-w-[220px] bg-background dark:bg-background/50" 
                />
                <Button type="submit" size="sm">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>

          {/* Links sections */}
          <div className="md:col-span-3 lg:col-span-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <FooterLinkGroup 
                  title="Company" 
                  links={[
                    { label: "About Us", href: "/about" },
                    { label: "Careers", href: "/careers" },
                    { label: "Blog", href: "/blog" },
                    { label: "Press", href: "/press" }
                  ]} 
                />
              </div>

              <div>
                <FooterLinkGroup 
                  title="Resources" 
                  links={[
                    { label: "Features", href: "/features" },
                    { label: "Pricing", href: "/pricing" },
                    { label: "Testimonials", href: "/testimonials" },
                    { label: "FAQ", href: "/faq" }
                  ]} 
                />
              </div>

              <div className="space-y-6">
                <FooterLinkGroup 
                  title="Legal" 
                  links={[
                    { label: "Privacy Policy", href: "/privacy" },
                    { label: "Terms of Service", href: "/terms" },
                    { label: "Cookie Policy", href: "/cookies" },
                    { label: "HIPAA Compliance", href: "/hipaa" }
                  ]} 
                />
                
                {/* Contact info - new addition */}
                <div>
                  <h3 className="text-sm font-medium mb-4">Contact Us</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <Mail className="h-4 w-4 text-primary mt-0.5" />
                      <span className="text-sm text-muted-foreground">support@alliedhealth.com</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Phone className="h-4 w-4 text-primary mt-0.5" />
                      <span className="text-sm text-muted-foreground">1-800-SUGAR-SAGE</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Allied Health. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <FooterBottomLink href="/privacy" label="Privacy" />
            <FooterBottomLink href="/terms" label="Terms" />
            <FooterBottomLink href="/cookies" label="Cookies" />
            <FooterBottomLink href="/accessibility" label="Accessibility" />
          </div>
        </div>
      </div>
    </footer>
  );
}

// Helper components
function SocialLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-110 transform inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary/5 hover:bg-primary/10"
      aria-label={label}
    >
      {icon}
      <span className="sr-only">{label}</span>
    </Link>
  );
}

function FooterLinkGroup({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h3 className="text-sm font-medium mb-4">{title}</h3>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-muted-foreground hover:text-primary transition-colors group inline-flex items-center"
            >
              <span>{link.label}</span>
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-1 opacity-0 group-hover:opacity-100">
                &nbsp;›
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FooterBottomLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="text-xs text-muted-foreground hover:text-primary transition-colors"
    >
      {label}
    </Link>
  );
}