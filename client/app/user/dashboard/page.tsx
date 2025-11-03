"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/ui/stats-card";
import {
  ClipboardList,
  Clock,
  Users,
  CheckCircle,
  FileText,
  User,
} from "lucide-react";
import Link from "next/link";
import { getMyTasks$, getAll$ as getPatients$ } from "@/lib/api/aha/_request";

export default function DashboardPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
    activePatients: 0,
  });

  const fetchStats = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // Fetch tasks
      const tasksResponse = await getMyTasks$(user.id);
      const tasks = tasksResponse.data;

      // Fetch patients
      const patientsResponse = await getPatients$("Active", "mine");
      const patients = patientsResponse.data;

      // Calculate stats
      const totalTasks = tasks.length;
      const pendingTasks = tasks.filter(
        (t) => t.status === "Assigned" || t.status === "Not Assigned"
      ).length;
      const inProgressTasks = tasks.filter(
        (t) => t.status === "In Progress"
      ).length;
      const completedTasks = tasks.filter(
        (t) => t.status === "Completed"
      ).length;

      setStats({
        totalTasks,
        pendingTasks,
        inProgressTasks,
        completedTasks,
        activePatients: patients.length,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const userName = user ? `${user.firstName} ${user.lastName}` : "User";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {userName}!</h1>
        <p className="text-muted-foreground">
          Here's an overview of your tasks and patients
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Tasks"
          value={stats.totalTasks}
          description="All assigned tasks"
          icon={FileText}
        />
        <StatsCard
          title="Pending Tasks"
          value={stats.pendingTasks}
          description="Awaiting action"
          icon={Clock}
        />
        <StatsCard
          title="In Progress"
          value={stats.inProgressTasks}
          description="Currently working on"
          icon={ClipboardList}
        />
        <StatsCard
          title="Active Patients"
          value={stats.activePatients}
          description="Under your care"
          icon={Users}
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Button
              variant="outline"
              className="h-auto p-4 flex-col items-start"
              asChild
            >
              <Link href="/user/my-tasks">
                <ClipboardList className="h-5 w-5 mb-2" />
                <span className="font-medium">My Tasks</span>
                <span className="text-sm text-muted-foreground">
                  View and manage your tasks
                </span>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex-col items-start"
              asChild
            >
              <Link href="/user/my-patients">
                <User className="h-5 w-5 mb-2" />
                <span className="font-medium">My Patients</span>
                <span className="text-sm text-muted-foreground">
                  View your assigned patients
                </span>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex-col items-start"
              asChild
            >
              <Link href="/user/my-referrals">
                <ClipboardList className="h-5 w-5 mb-2" />
                <span className="font-medium">My Referrals</span>
                <span className="text-sm text-muted-foreground">
                  View referral requests
                </span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
