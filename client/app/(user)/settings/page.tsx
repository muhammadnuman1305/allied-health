"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Settings, Bell, Shield, User } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">Doctor Settings</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle>Personal Information</CardTitle>
            </div>
            <CardDescription>
              Manage your personal and contact details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input id="firstName" value="Dr. John" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" value="Doe" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value="johndoe@hospital.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" value="+92 300 1234567" />
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        {/* Professional Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Professional Details</CardTitle>
            </div>
            <CardDescription>
              Manage your qualifications and specialization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="specialization">Specialization</Label>
              <Select defaultValue="cardiology">
                <SelectTrigger>
                  <SelectValue placeholder="Select specialization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cardiology">Cardiology</SelectItem>
                  <SelectItem value="neurology">Neurology</SelectItem>
                  <SelectItem value="orthopedics">Orthopedics</SelectItem>
                  <SelectItem value="pediatrics">Pediatrics</SelectItem>
                  <SelectItem value="general">General Physician</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="qualification">Qualification</Label>
              <Input id="qualification" value="MBBS, FCPS" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience">Years of Experience</Label>
              <Input id="experience" type="number" value="10" />
            </div>
            <Button>Update Professional Info</Button>
          </CardContent>
        </Card>

        {/* Availability */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle>Availability & Notifications</CardTitle>
            </div>
            <CardDescription>
              Set your availability and notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="availableDays">Available Days</Label>
              <Input id="availableDays" placeholder="e.g. Mon, Wed, Fri" value="Mon, Wed, Fri" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="availableTime">Available Time</Label>
              <Input id="availableTime" placeholder="e.g. 9:00 AM - 1:00 PM" value="9:00 AM - 1:00 PM" />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Appointment Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when a patient books or cancels an appointment
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Admin Announcements</Label>
                <p className="text-sm text-muted-foreground">
                  Receive important hospital announcements
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <Button>Save Preferences</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
