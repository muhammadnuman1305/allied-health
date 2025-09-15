"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">System Settings</h1>
      
      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Site Information</CardTitle>
              <CardDescription>Manage your site details and branding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="site-name">Site Name</Label>
                <Input id="site-name" defaultValue="Allied Health" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="site-description">Site Description</Label>
                <Input id="site-description" defaultValue="Your Health Companion" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-email">Contact Email</Label>
                <Input id="contact-email" defaultValue="support@alliedhealth.com" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Mode</CardTitle>
              <CardDescription>Take your site offline for maintenance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch id="maintenance-mode" />
                <Label htmlFor="maintenance-mode">Enable Maintenance Mode</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maintenance-message">Maintenance Message</Label>
                <Input id="maintenance-message" defaultValue="We're currently performing maintenance. Please check back soon." />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Authentication</CardTitle>
              <CardDescription>Manage authentication settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch id="two-factor" defaultChecked />
                <Label htmlFor="two-factor">Require Two-Factor Authentication for Admins</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="password-expiry" />
                <Label htmlFor="password-expiry">Enable Password Expiry (90 days)</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-login-attempts">Maximum Login Attempts</Label>
                <Input id="max-login-attempts" type="number" defaultValue="5" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>Configure system email notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch id="new-user" defaultChecked />
                <Label htmlFor="new-user">New User Registration</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="password-reset" defaultChecked />
                <Label htmlFor="password-reset">Password Reset Requests</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="security-alerts" defaultChecked />
                <Label htmlFor="security-alerts">Security Alerts</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="system-updates" />
                <Label htmlFor="system-updates">System Updates</Label>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="integrations" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>API Integrations</CardTitle>
              <CardDescription>Manage third-party service integrations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="google-api">Google API Key</Label>
                <Input id="google-api" type="password" defaultValue="••••••••••••••••" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mailchimp-api">Mailchimp API Key</Label>
                <Input id="mailchimp-api" type="password" defaultValue="••••••••••••••••" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stripe-api">Stripe API Key</Label>
                <Input id="stripe-api" type="password" defaultValue="••••••••••••••••" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 
