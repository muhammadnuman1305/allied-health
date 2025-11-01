import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Activity,
  Users,
  ClipboardList,
  Clock,
  AlertTriangle,
  ChevronDown,
  TrendingDown,
  TrendingUp,
  Plus,
  FileDown,
  FileText,
  User,
  ArrowRight,
  Calendar,
  Stethoscope,
  Bell,
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  Heart,
  Utensils,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/ui/stats-card";
import Link from "next/link";

export default function DashboardPage() {
  // Simulating Allied Health Professional data
  const ahpName = "Sarah Johnson";
  const department = "Dietetics";
  const role = "Senior Dietitian";

  // Mock data for AHP dashboard based on SRS requirements
  const pendingTasks = 3;
  const inProgressTasks = 2;
  const completedTasks = 8;
  const activePatients = 12;
  const todayAppointments = 5;
  const pendingReferrals = 2;
  const feedbackReceived = 4;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {ahpName}!</h1>
          <p className="text-muted-foreground">
            {role} • {department} Department • Fiona Stanley Hospital
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-primary hover:bg-primary/90" size="sm" asChild>
            <Link href="/user/tasks">
              <ClipboardList className="h-4 w-4 mr-1" /> View Tasks
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/user/my-patients">
              <User className="h-4 w-4 mr-1" /> My Patients
            </Link>
          </Button>
        </div>
      </div>

      {/* Task status overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Pending Tasks"
          value={pendingTasks}
          description="Awaiting assignment"
          icon={ClipboardList}
        />
        <StatsCard
          title="In Progress"
          value={inProgressTasks}
          description="Currently working on"
          icon={Clock}
        />
        <StatsCard
          title="Active Patients"
          value={activePatients}
          description="Under your care"
          icon={Users}
        />
        <StatsCard
          title="Completed Tasks"
          value={completedTasks}
          description="This week (+3 from last week)"
          icon={CheckCircle}
        />
      </div>

      {/* Task overview based on SRS statuses */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-medium">
              Recent Task Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/40 rounded-lg">
                <div className="flex items-center gap-3">
                  <ClipboardList className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium">
                      Nutrition Assessment - Patient #1234
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Status: In Progress
                    </p>
                  </div>
                </div>
                <span className="text-sm text-blue-600 dark:text-blue-400">
                  Due today
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/40 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">
                      Diet Plan Review - Maria Garcia
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Status: Completed
                    </p>
                  </div>
                </div>
                <span className="text-sm text-green-600 dark:text-green-400">
                  2 hours ago
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950/40 rounded-lg">
                <div className="flex items-center gap-3">
                  <ClockIcon className="h-5 w-5 text-amber-500" />
                  <div>
                    <p className="font-medium">
                      Patient Referral - Speech Therapy
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Status: Pending
                    </p>
                  </div>
                </div>
                <span className="text-sm text-amber-600 dark:text-amber-400">
                  Awaiting assignment
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-medium">
              Department Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Today's Appointments
                </span>
                <span className="text-sm text-muted-foreground">
                  {todayAppointments}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Pending Referrals</span>
                <span className="text-sm text-muted-foreground">
                  {pendingReferrals}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Feedback Received</span>
                <span className="text-sm text-muted-foreground">
                  {feedbackReceived}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Task Completion Rate
                </span>
                <span className="text-sm text-green-600 dark:text-green-400">
                  87%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions based on SRS User Panel Features */}
      <h2 className="text-xl font-semibold mt-8 mb-4">Quick Actions</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <ActionCard
          title="Manage Tasks"
          description="View and manage your assigned tasks, update status, and save final outcomes."
          icon={<ClipboardList className="h-6 w-6 text-primary" />}
          actionText="View Tasks"
          actionLink="/user/tasks"
          time="Priority"
        />

        <ActionCard
          title="My Patients"
          description="View patients assigned to you and access their records and history."
          icon={<User className="h-6 w-6 text-primary" />}
          actionText="View My Patients"
          actionLink="/user/my-patients"
          time="Active"
        />

        <ActionCard
          title="Referral System"
          description="View referrals assigned to you and track their status."
          icon={<ArrowRight className="h-6 w-6 text-primary" />}
          actionText="View Referrals"
          actionLink="/user/my-referrals"
          time="Collaboration"
        />
      </div>

      {/* Recent Activity based on SRS feedback feature */}
      <h2 className="text-xl font-semibold mt-8 mb-4">
        Recent Activity & Feedback
      </h2>
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/40 rounded-lg">
              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium">
                  Feedback received from Physiotherapy Department
                </p>
                <p className="text-sm text-muted-foreground">
                  Patient #1234 - Exercise recommendations noted
                </p>
              </div>
              <Button variant="ghost" size="sm">
                View
              </Button>
            </div>

            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/40 rounded-lg">
              <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium">
                  Task completed: Nutrition assessment for Patient #5678
                </p>
                <p className="text-sm text-muted-foreground">
                  Detailed notes and diet plan uploaded
                </p>
              </div>
              <Button variant="ghost" size="sm">
                Review
              </Button>
            </div>

            <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-950/40 rounded-lg">
              <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                <Bell className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium">
                  New referral from Speech Therapy Department
                </p>
                <p className="text-sm text-muted-foreground">
                  Patient #9012 - Swallowing assessment needed
                </p>
              </div>
              <Button variant="ghost" size="sm">
                Process
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick access buttons based on SRS User Panel Features */}
      <div className="flex flex-wrap gap-3 mt-6">
        <Link href="/user/tasks">
          <Button variant="outline" size="sm">
            My Tasks
          </Button>
        </Link>
        <Link href="/user/my-patients">
          <Button variant="outline" size="sm">
            My Patients
          </Button>
        </Link>
        <Link href="/user/my-referrals">
          <Button variant="outline" size="sm">
            My Referrals
          </Button>
        </Link>
        <Link href="/user/feedback">
          <Button variant="outline" size="sm">
            Feedback & Notes
          </Button>
        </Link>
        <Link href="/user/dashboard/calendar">
          <Button variant="outline" size="sm">
            Calendar
          </Button>
        </Link>
        <Link href="/user/settings">
          <Button variant="outline" size="sm">
            Settings
          </Button>
        </Link>
      </div>
    </div>
  );
}

function ActionCard({
  title,
  description,
  icon,
  actionText,
  actionLink,
  time,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  actionText: string;
  actionLink: string;
  time?: string;
}) {
  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            {icon}
          </div>
          {time && (
            <span className="text-sm text-muted-foreground">{time}</span>
          )}
        </div>
        <div>
          <h3 className="font-medium text-lg">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
        <Button variant="secondary" size="sm" className="w-full" asChild>
          <Link href={actionLink}>{actionText}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
