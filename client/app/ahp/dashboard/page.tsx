"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/ui/stats-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  ArrowRight,
  FileText,
  UserCheck,
  PlayCircle,
  ArrowDown,
  ArrowUp,
  Building2,
  GraduationCap,
  UserCircle,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { getDashboardDetails$ } from "@/lib/api/admin/dashboard/_request";
import { DashboardDetails } from "@/lib/api/admin/dashboard/_model";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

// Enums
enum ETaskStatus {
  Assigned = 1,
  InProgress = 2,
  Completed = 3,
  Overdue = 4,
}

enum EReferralOutcomes {
  Pending = 1,
  Accepted = 2,
  Rejected = 3,
}

enum ETaskInterventionOutcomes {
  Seen = 1,
  Attempted = 2,
  Declined = 3,
  Unseen = 4,
  Handover = 5,
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardDetails | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getDashboardDetails$();
      console.log("Dashboard data received:", response.data);
      setData(response.data);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      toast({ variant: "destructive", title: "Error", description: "Failed to fetch dashboard data. Please try again." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const renderMetricValue = (
    value: number | undefined,
    className = "h-7 w-10"
  ) => (loading ? <Skeleton className={className} /> : value ?? 0);

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="space-y-1.5">
        <h1 className="text-3xl font-normal tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Overview of your healthcare system
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Patients"
          value={data?.totalPatients ?? 0}
          description="All registered patients"
          icon={Users}
          loading={loading}
        />
        <StatsCard
          title="Total Departments"
          value={data?.totalDepartments ?? 0}
          description="All departments"
          icon={Building2}
          loading={loading}
        />
        <StatsCard
          title="Total Specialties"
          value={data?.totalSpecialties ?? 0}
          description="All specialties"
          icon={GraduationCap}
          loading={loading}
        />
        <StatsCard
          title="Total Users"
          value={data?.totalUsers ?? 0}
          description="All system users"
          icon={UserCircle}
          loading={loading}
        />
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks Overview */}
        <Card className="border-border">
          <CardHeader className="pb-4 border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium">Tasks</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/ahp/tasks")}
                className="h-8 text-xs hover:bg-accent"
              >
                View All
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Task Status Grid */}
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <div className="text-2xl font-medium tracking-tight">
                  {renderMetricValue(data?.assignedTasks)}
                </div>
                <div className="text-xs text-muted-foreground font-medium">
                  Assigned
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="text-2xl font-medium text-primary tracking-tight">
                  {renderMetricValue(data?.inProgressTasks)}
                </div>
                <div className="text-xs text-muted-foreground font-medium">
                  In Progress
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="text-2xl font-medium text-success tracking-tight">
                  {renderMetricValue(data?.completedTasks)}
                </div>
                <div className="text-xs text-muted-foreground font-medium">
                  Completed
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="text-2xl font-medium text-destructive tracking-tight">
                  {renderMetricValue(data?.overdueTasks)}
                </div>
                <div className="text-xs text-muted-foreground font-medium">
                  Overdue
                </div>
              </div>
            </div>

            {/* Priority Breakdown */}
            <div className="space-y-3 pt-5 border-t border-border">
              <div className="text-sm font-medium text-foreground">
                Priority Breakdown
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-md transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-destructive" />
                    <span className="text-sm font-medium">High Priority</span>
                  </div>
                  <Badge
                    variant="destructive"
                    className="font-medium px-2.5 py-0.5"
                  >
                    {renderMetricValue(data?.highPriorityTasks, "h-4 w-6")}
                  </Badge>
                </div>
                <div className="flex items-center justify-between rounded-md transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-signature-mustard" />
                    <span className="text-sm font-medium">Medium Priority</span>
                  </div>
                  <Badge
                    variant="secondary"
                    className="font-medium px-2.5 py-0.5"
                  >
                    {renderMetricValue(data?.mediumPriorityTasks, "h-4 w-6")}
                  </Badge>
                </div>
                <div className="flex items-center justify-between rounded-md transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground" />
                    <span className="text-sm font-medium">Low Priority</span>
                  </div>
                  <Badge
                    variant="outline"
                    className="font-medium px-2.5 py-0.5"
                  >
                    {renderMetricValue(data?.lowPriorityTasks, "h-4 w-6")}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Referrals Overview */}
        <Card className="border-border">
          <CardHeader className="pb-4 border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium">Referrals</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/ahp/referrals/outgoing")}
                className="h-8 text-xs hover:bg-accent"
              >
                View All
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Referral Outcomes Grid */}
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <div className="text-2xl font-medium tracking-tight">
                  {renderMetricValue(data?.pendingReferrals)}
                </div>
                <div className="text-xs text-muted-foreground font-medium">
                  Pending
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="text-2xl font-medium text-success tracking-tight">
                  {renderMetricValue(data?.acceptedReferrals)}
                </div>
                <div className="text-xs text-muted-foreground font-medium">
                  Accepted
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="text-2xl font-medium text-destructive tracking-tight">
                  {renderMetricValue(data?.rejectedReferrals)}
                </div>
                <div className="text-xs text-muted-foreground font-medium">
                  Rejected
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="text-2xl font-medium tracking-tight">
                  {renderMetricValue(data?.totalReferrals)}
                </div>
                <div className="text-xs text-muted-foreground font-medium">
                  Total
                </div>
              </div>
            </div>

            {/* Incoming and Outgoing Referrals */}
            <div className="pt-5 border-t border-border space-y-3">
              <div className="text-sm font-medium text-foreground">
                Referral Types
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-3.5 rounded-lg border border-border bg-card transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-md bg-primary/10">
                      <ArrowDown className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium">Incoming</span>
                  </div>
                  <span className="text-lg font-medium">
                    {renderMetricValue(data?.incomingReferrals, "h-6 w-8")}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3.5 rounded-lg border border-border bg-card transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-md bg-primary/10">
                      <ArrowUp className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium">Outgoing</span>
                  </div>
                  <span className="text-lg font-medium">
                    {renderMetricValue(data?.outgoingReferrals, "h-6 w-8")}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Intervention Outcomes */}
      <Card className="border-border">
        <CardHeader className="pb-4 border-b border-border">
          <CardTitle className="text-lg font-medium">
            Task Intervention Outcomes
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="flex flex-col items-center justify-center p-5 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors">
              <div className="p-2.5 rounded-full bg-primary/10 mb-3">
                <UserCheck className="h-5 w-5 text-primary" />
              </div>
              <div className="text-2xl font-medium mb-1.5 tracking-tight">
                {renderMetricValue(data?.seenOutcomes)}
              </div>
              <div className="text-xs text-center text-muted-foreground font-medium">
                Seen (S)
              </div>
            </div>
            <div className="flex flex-col items-center justify-center p-5 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors">
              <div className="p-2.5 rounded-full bg-primary/10 mb-3">
                <PlayCircle className="h-5 w-5 text-primary" />
              </div>
              <div className="text-2xl font-medium mb-1.5 tracking-tight">
                {renderMetricValue(data?.attemptedOutcomes)}
              </div>
              <div className="text-xs text-center text-muted-foreground font-medium">
                Attempted (A)
              </div>
            </div>
            <div className="flex flex-col items-center justify-center p-5 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors">
              <div className="p-2.5 rounded-full bg-destructive/10 mb-3">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div className="text-2xl font-medium mb-1.5 tracking-tight">
                {renderMetricValue(data?.declinedOutcomes)}
              </div>
              <div className="text-xs text-center text-muted-foreground font-medium">
                Declined (D)
              </div>
            </div>
            <div className="flex flex-col items-center justify-center p-5 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors">
              <div className="p-2.5 rounded-full bg-muted mb-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="text-2xl font-medium mb-1.5 tracking-tight">
                {renderMetricValue(data?.unseenOutcomes)}
              </div>
              <div className="text-xs text-center text-muted-foreground font-medium">
                Unseen (U)
              </div>
            </div>
            <div className="flex flex-col items-center justify-center p-5 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors">
              <div className="p-2.5 rounded-full bg-muted mb-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="text-2xl font-medium mb-1.5 tracking-tight">
                {renderMetricValue(data?.handoverOutcomes)}
              </div>
              <div className="text-xs text-center text-muted-foreground font-medium">
                Handover (X)
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
