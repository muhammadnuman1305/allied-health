"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/ui/stats-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  FileText,
  AlertTriangle,
  Clock,
  ArrowRight,
  CheckCircle,
  ClipboardList,
} from "lucide-react";
import { getSummary$ } from "@/lib/api/admin/patients/_request";
import { getSummary$ as getTaskSummary$ } from "@/lib/api/admin/tasks/_request";
import { getSummary$ as getReferralSummary$ } from "@/lib/api/admin/referrals/_request";
import { PatientSummary } from "@/lib/api/admin/patients/_model";
import { TaskSummary } from "@/lib/api/admin/tasks/_model";
import { ReferralSummary } from "@/lib/api/admin/referrals/_model";

// ---- visx (charts) ----
import {
  XYChart,
  AnimatedAxis,
  AnimatedGrid,
  AnimatedBarSeries,
  Tooltip as VisxTooltip,
  BarGroup,
} from "@visx/xychart";

// Accessors
const xName = (d: { name: string }) => d.name;
const yValue = (d: { value: number }) => d.value;
const xDay = (d: { day: string }) => d.day;
const yTasks = (d: { tasks: number }) => d.tasks;
const yCompleted = (d: { completed: number }) => d.completed;

// Consistent color scheme - using app theme colors
const chartColors = {
  // Status colors (consistent across all charts)
  completed: "hsl(142, 30%, 48%)", // Primary green from theme
  active: "hsl(217, 91%, 60%)", // Blue - consistent across charts
  overdue: "hsl(0, 62.8%, 30.6%)", // Destructive red from theme

  // Priority colors
  low: "hsl(0, 0%, 50%)", // Muted gray
  medium: "hsl(217, 91%, 60%)", // Same blue as "Active"
  high: "hsl(0, 62.8%, 30.6%)", // Same red as "Overdue"

  // Theme colors for chart styling (using CSS variables for dark/light mode)
  grid: "hsl(var(--border))",
  axis: "hsl(var(--muted-foreground))",
  text: "hsl(var(--foreground))",
  mutedText: "hsl(var(--muted-foreground))",
};

// Reusable chart card
function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="min-w-0">
        <div className="h-[300px]">{children}</div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [patientSummary, setPatientSummary] = useState<PatientSummary>({
    totalPatients: 0,
    newPatients: 0,
    activeTasks: 0,
    completedTasks: 0,
  });

  const [taskSummary, setTaskSummary] = useState<TaskSummary>({
    totalTasks: 0,
    overdueTasks: 0,
    activeTasks: 0,
    completedTasks: 0,
    highPriority: 0,
    midPriority: 0,
    lowPriority: 0,
    deptWiseSummary: [],
  });

  const [referralSummary, setReferralSummary] = useState<ReferralSummary>({
    totalReferrals: 0,
    referralsToday: 0,
    priorityBreakdown: { P1: 0, P2: 0, P3: 0 },
    disciplineBreakdown: {
      physiotherapy: 0,
      occupationalTherapy: 0,
      speechTherapy: 0,
      dietetics: 0,
    },
    statusBreakdown: {
      active: 0,
      completed: 0,
      pending: 0,
      cancelled: 0,
    },
    pendingOutcomes: 0,
    completedReferrals: 0,
    pendingTriage: 0,
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [patientsResponse, tasksResponse, referralsResponse] =
        await Promise.all([
          getSummary$().catch(() => ({
            data: {
              totalPatients: 0,
              newPatients: 0,
              activeTasks: 0,
              completedTasks: 0,
            },
          })),
          getTaskSummary$().catch(() => ({
            data: {
              totalTasks: 0,
              overdueTasks: 0,
              activeTasks: 0,
              completedTasks: 0,
              highPriority: 0,
              midPriority: 0,
              lowPriority: 0,
              deptWiseSummary: [],
            },
          })),
          getReferralSummary$().catch(() => ({
            data: {
              totalReferrals: 0,
              referralsToday: 0,
              priorityBreakdown: { P1: 0, P2: 0, P3: 0 },
              disciplineBreakdown: {
                physiotherapy: 0,
                occupationalTherapy: 0,
                speechTherapy: 0,
                dietetics: 0,
              },
              statusBreakdown: {
                active: 0,
                completed: 0,
                pending: 0,
                cancelled: 0,
              },
              pendingOutcomes: 0,
              completedReferrals: 0,
              pendingTriage: 0,
            },
          })),
        ]);

      setPatientSummary(
        patientsResponse?.data ?? {
          totalPatients: 0,
          newPatients: 0,
          activeTasks: 0,
          completedTasks: 0,
        }
      );

      setTaskSummary(
        tasksResponse?.data ?? {
          totalTasks: 0,
          overdueTasks: 0,
          activeTasks: 0,
          completedTasks: 0,
          highPriority: 0,
          midPriority: 0,
          lowPriority: 0,
          deptWiseSummary: [],
        }
      );

      const referralData = referralsResponse?.data ?? {
        totalReferrals: 0,
        referralsToday: 0,
        priorityBreakdown: { P1: 0, P2: 0, P3: 0 },
        disciplineBreakdown: {
          physiotherapy: 0,
          occupationalTherapy: 0,
          speechTherapy: 0,
          dietetics: 0,
        },
        statusBreakdown: {
          active: 0,
          completed: 0,
          pending: 0,
          cancelled: 0,
        },
        pendingOutcomes: 0,
        completedReferrals: 0,
        pendingTriage: 0,
      };

      setReferralSummary({
        ...referralData,
        statusBreakdown: referralData.statusBreakdown ?? {
          active: 0,
          completed: 0,
          pending: 0,
          cancelled: 0,
        },
        priorityBreakdown: referralData.priorityBreakdown ?? {
          P1: 0,
          P2: 0,
          P3: 0,
        },
        disciplineBreakdown: referralData.disciplineBreakdown ?? {
          physiotherapy: 0,
          occupationalTherapy: 0,
          speechTherapy: 0,
          dietetics: 0,
        },
      });
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to fetch dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ---- Chart data with realistic dummy data ----
  const taskPriorityChartData = [
    { name: "Low", value: taskSummary.lowPriority || 142 },
    { name: "Medium", value: taskSummary.midPriority || 87 },
    { name: "High", value: taskSummary.highPriority || 34 },
  ];

  const taskStatusChartData = [
    { name: "Completed", value: taskSummary.completedTasks || 198 },
    { name: "Active", value: taskSummary.activeTasks || 156 },
    { name: "Overdue", value: taskSummary.overdueTasks || 23 },
  ];

  const weeklyTasksData = [
    { day: "Mon", tasks: 47, completed: 38 },
    { day: "Tue", tasks: 52, completed: 45 },
    { day: "Wed", tasks: 41, completed: 36 },
    { day: "Thu", tasks: 58, completed: 51 },
    { day: "Fri", tasks: 49, completed: 43 },
    { day: "Sat", tasks: 32, completed: 28 },
    { day: "Sun", tasks: 28, completed: 24 },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <p className="text-destructive">{error}</p>
        <Button onClick={() => fetchData()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your healthcare system
        </p>
      </div>

      {/* TOP STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 [&>*]:min-w-0">
        <StatsCard
          title="Total Patients"
          value={patientSummary.totalPatients}
          description="All registered patients"
          icon={Users}
        />
        <StatsCard
          title="Active Tasks"
          value={taskSummary.activeTasks}
          description="Tasks in progress"
          icon={Clock}
        />
        <StatsCard
          title="Active Referrals"
          value={referralSummary.statusBreakdown?.active ?? 0}
          description="Ongoing referrals"
          icon={FileText}
        />
        <StatsCard
          title="Overdue Tasks"
          value={taskSummary.overdueTasks}
          description="Requires attention"
          icon={AlertTriangle}
        />
      </div>

      {/* QUICK STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 [&>*]:min-w-0">
        <Card className=" border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
                <p className="text-2xl font-bold mt-1">
                  {taskSummary.totalTasks}
                </p>
              </div>
              <ClipboardList className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed Tasks</p>
                <p className="text-2xl font-bold mt-1 text-primary">
                  {taskSummary.completedTasks}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">New Patients</p>
                <p className="text-2xl font-bold mt-1 text-primary">
                  {patientSummary.newPatients}
                </p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Triage</p>
                <p className="text-2xl font-bold mt-1">
                  {referralSummary.pendingTriage ?? 0}
                </p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* OVERVIEW CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 [&>*]:min-w-0">
        {/* Tasks Overview */}
        <Card className="border-border">
          <CardHeader className="pb-3 flex justify-between items-center">
            <CardTitle className="text-lg">Tasks Overview</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/admin/tasks")}
              className="h-8"
            >
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold">
                  {taskSummary.totalTasks}
                </div>
                <div className="text-xs text-muted-foreground">Total Tasks</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {taskSummary.completedTasks}
                </div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
            </div>
            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">High Priority</span>
                <Badge variant="destructive">{taskSummary.highPriority}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Medium Priority</span>
                <Badge variant="secondary">{taskSummary.midPriority}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Low Priority</span>
                <Badge variant="outline">{taskSummary.lowPriority}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Referrals Overview */}
        <Card className="border-border">
          <CardHeader className="pb-3 flex justify-between items-center">
            <CardTitle className="text-lg">Referrals Overview</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/admin/referrals/outgoing")}
              className="h-8"
            >
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold">
                  {referralSummary.totalReferrals}
                </div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {referralSummary.completedReferrals}
                </div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
            </div>
            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Active</span>
                <Badge variant="secondary">
                  {referralSummary.statusBreakdown?.active ?? 0}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pending Triage</span>
                <Badge variant="outline">
                  {referralSummary.pendingTriage ?? 0}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Completed</span>
                <Badge variant="default">
                  {referralSummary.completedReferrals ?? 0}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patients Overview */}
        <Card className="border-border">
          <CardHeader className="pb-3 flex justify-between items-center">
            <CardTitle className="text-lg">Patients Overview</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/admin/patients")}
              className="h-8"
            >
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold">
                  {patientSummary.totalPatients}
                </div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {patientSummary.newPatients}
                </div>
                <div className="text-xs text-muted-foreground">New</div>
              </div>
            </div>
            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Active Tasks</span>
                <Badge variant="secondary">
                  {patientSummary.activeTasks ?? 0}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Completed Tasks</span>
                <Badge variant="default">
                  {patientSummary.completedTasks ?? 0}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CHARTS (visx) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 [&>*]:min-w-0">
        {/* Task Priority Distribution */}
        <ChartCard title="Task Priority Distribution">
          <XYChart
            height={300}
            xScale={{ type: "band", paddingInner: 0.5 }}
            yScale={{ type: "linear" }}
            margin={{ top: 24, right: 24, bottom: 44, left: 54 }}
          >
            <AnimatedGrid
              columns={false}
              numTicks={5}
              stroke={chartColors.grid}
            />
            <AnimatedAxis
              orientation="bottom"
              tickLabelProps={{
                fill: chartColors.mutedText,
                fontSize: 12,
                fontWeight: 500,
              }}
            />
            <AnimatedAxis
              orientation="left"
              numTicks={5}
              tickLabelProps={{
                fill: chartColors.mutedText,
                fontSize: 12,
                fontWeight: 500,
              }}
            />
            <AnimatedBarSeries
              dataKey="Priority"
              data={taskPriorityChartData}
              xAccessor={xName}
              yAccessor={yValue}
              colorAccessor={(d) => {
                const colors: Record<string, string> = {
                  Low: chartColors.low,
                  Medium: chartColors.medium,
                  High: chartColors.high,
                };
                return colors[d.name] || chartColors.medium;
              }}
              radius={8}
            />
            <VisxTooltip
              snapTooltipToDatumX
              snapTooltipToDatumY
              renderTooltip={({ tooltipData }) => {
                const d = tooltipData?.nearestDatum?.datum as
                  | { name: string; value: number }
                  | undefined;
                const isDark = theme === "dark";
                return d ? (
                  <div
                    className="rounded-md px-3 py-2 text-sm"
                    style={{
                      backgroundColor: isDark ? "#171717" : "#ffffff",
                      color: isDark ? "#f3f4f6" : "#111827",
                    }}
                  >
                    <div className="font-medium">{d.name} Priority</div>
                    <div
                      style={{
                        color: isDark ? "#9ca3af" : "#6b7280",
                        fontSize: "0.875rem",
                      }}
                    >
                      {d.value.toLocaleString()} tasks
                    </div>
                  </div>
                ) : null;
              }}
            />
          </XYChart>
        </ChartCard>

        {/* Task Status Overview */}
        <ChartCard title="Task Status Overview">
          <XYChart
            height={300}
            xScale={{ type: "band", paddingInner: 0.5 }}
            yScale={{ type: "linear" }}
            margin={{ top: 24, right: 24, bottom: 44, left: 54 }}
          >
            <AnimatedGrid
              columns={false}
              numTicks={5}
              stroke={chartColors.grid}
            />
            <AnimatedAxis
              orientation="bottom"
              tickLabelProps={{
                fill: chartColors.mutedText,
                fontSize: 12,
                fontWeight: 500,
              }}
            />
            <AnimatedAxis
              orientation="left"
              numTicks={5}
              tickLabelProps={{
                fill: chartColors.mutedText,
                fontSize: 12,
                fontWeight: 500,
              }}
            />
            <AnimatedBarSeries
              dataKey="Status"
              data={taskStatusChartData}
              xAccessor={xName}
              yAccessor={yValue}
              colorAccessor={(d) => {
                const colors: Record<string, string> = {
                  Completed: chartColors.completed,
                  Active: chartColors.active,
                  Overdue: chartColors.overdue,
                };
                return colors[d.name] || chartColors.active;
              }}
              radius={8}
            />
            <VisxTooltip
              snapTooltipToDatumX
              snapTooltipToDatumY
              renderTooltip={({ tooltipData }) => {
                const d = tooltipData?.nearestDatum?.datum as
                  | { name: string; value: number }
                  | undefined;
                const isDark = theme === "dark";
                return d ? (
                  <div
                    className="rounded-md px-3 py-2 text-sm"
                    style={{
                      backgroundColor: isDark ? "#171717" : "#ffffff",
                      color: isDark ? "#f3f4f6" : "#111827",
                    }}
                  >
                    <div className="font-medium">{d.name}</div>
                    <div
                      style={{
                        color: isDark ? "#9ca3af" : "#6b7280",
                        fontSize: "0.875rem",
                      }}
                    >
                      {d.value.toLocaleString()} tasks
                    </div>
                  </div>
                ) : null;
              }}
            />
          </XYChart>
        </ChartCard>
      </div>

      {/* Weekly Task Performance (two series) */}
      <ChartCard title="Weekly Task Performance">
        <XYChart
          height={300}
          xScale={{ type: "band", paddingInner: 0.4 }}
          yScale={{ type: "linear" }}
          margin={{ top: 24, right: 24, bottom: 44, left: 54 }}
        >
          <AnimatedGrid
            columns={false}
            numTicks={5}
            stroke={chartColors.grid}
          />
          <AnimatedAxis
            orientation="bottom"
            tickLabelProps={{
              fill: chartColors.mutedText,
              fontSize: 12,
              fontWeight: 500,
            }}
          />
          <AnimatedAxis
            orientation="left"
            numTicks={5}
            tickLabelProps={{
              fill: chartColors.mutedText,
              fontSize: 12,
              fontWeight: 500,
            }}
          />
          {/* Grouped bars: two series */}
          <BarGroup>
            <AnimatedBarSeries
              dataKey="Total Tasks"
              data={weeklyTasksData}
              xAccessor={xDay}
              yAccessor={yTasks}
              colorAccessor={() => chartColors.active}
              radius={8}
            />
            <AnimatedBarSeries
              dataKey="Completed"
              data={weeklyTasksData}
              xAccessor={xDay}
              yAccessor={yCompleted}
              colorAccessor={() => chartColors.completed}
              radius={8}
            />
          </BarGroup>
          <VisxTooltip
            snapTooltipToDatumX
            snapTooltipToDatumY
            renderTooltip={({ tooltipData }) => {
              const d = tooltipData?.nearestDatum?.datum as
                | { day: string; tasks: number; completed: number }
                | undefined;
              const isDark = theme === "dark";
              return d ? (
                <div
                  className="rounded-md px-3 py-2 text-sm"
                  style={{
                    backgroundColor: isDark ? "#171717" : "#ffffff",
                    color: isDark ? "#f3f4f6" : "#111827",
                  }}
                >
                  <div className="font-medium mb-1">{d.day}</div>
                  <div
                    className="space-y-0.5"
                    style={{
                      color: isDark ? "#9ca3af" : "#6b7280",
                      fontSize: "0.875rem",
                    }}
                  >
                    <div>Total: {d.tasks.toLocaleString()} tasks</div>
                    <div>
                      Completed: {d.completed.toLocaleString()} (
                      {Math.round((d.completed / d.tasks) * 100)}%)
                    </div>
                  </div>
                </div>
              ) : null;
            }}
          />
        </XYChart>
      </ChartCard>
    </div>
  );
}
