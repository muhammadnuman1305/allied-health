"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart3,
  TrendingUp,
  Users,
  Activity,
  FileText,
  Bed,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Building2,
  UserCheck,
  Heart,
  Brain,
  Stethoscope,
  Target,
  PieChart,
  LineChart,
  BarChart,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  Settings,
  Zap,
  Eye,
  Plus,
  Search,
  MoreHorizontal,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Pause,
  Play,
} from "lucide-react";
import { StatsCard } from "@/components/ui/stats-card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
  Area,
  AreaChart,
  RadialBarChart,
  RadialBar,
  Tooltip,
  Legend,
} from "recharts";

// Healthcare system analytics data
const analyticsData = {
  overview: {
    totalPatients: 1247,
    activeReferrals: 356,
    completedReferrals: 1823,
    averageWaitTime: 2.3,
    completionRate: 87.5,
    patientSatisfaction: 4.2,
    urgentReferrals: 45,
    todayCompletions: 47,
    systemUptime: 99.8,
  },
  realTime: {
    livePatients: 1247,
    activeSessions: 23,
    pendingApprovals: 12,
    systemAlerts: 3,
  },
  notifications: [
    {
      id: 1,
      type: "urgent",
      title: "High Priority Referral",
      message: "Patient John Doe requires immediate physiotherapy assessment",
      time: "2 minutes ago",
      icon: AlertCircle,
    },
    {
      id: 2,
      type: "success",
      title: "Referral Completed",
      message: "Occupational therapy session completed for Sarah Wilson",
      time: "15 minutes ago",
      icon: CheckCircle2,
    },
    {
      id: 3,
      type: "warning",
      title: "Ward Capacity Alert",
      message: "Geriatrics ward is at 85% capacity",
      time: "1 hour ago",
      icon: AlertTriangle,
    },
  ],
  monthlyTrends: [
    { month: "Aug", patients: 98, referrals: 145, completed: 132 },
    { month: "Sep", patients: 112, referrals: 167, completed: 158 },
    { month: "Oct", patients: 127, referrals: 189, completed: 174 },
    { month: "Nov", patients: 143, referrals: 201, completed: 195 },
    { month: "Dec", patients: 156, referrals: 234, completed: 218 },
    { month: "Jan", patients: 169, referrals: 267, completed: 245 },
  ],
  departmentPerformance: [
    {
      name: "Physiotherapy",
      referrals: 156,
      completed: 142,
      rate: 91,
      avgTime: 2.1,
    },
    {
      name: "Occupational Therapy",
      referrals: 89,
      completed: 78,
      rate: 88,
      avgTime: 2.4,
    },
    {
      name: "Speech & Language Therapy",
      referrals: 67,
      completed: 61,
      rate: 91,
      avgTime: 1.8,
    },
    {
      name: "Dietetics & Nutrition",
      referrals: 43,
      completed: 39,
      rate: 91,
      avgTime: 1.5,
    },
  ],
  wardDistribution: [
    {
      name: "Geriatrics",
      value: 24,
      percentage: 19.2,
      color: "hsl(var(--chart-1))",
    },
    {
      name: "Stroke Unit",
      value: 18,
      percentage: 14.4,
      color: "hsl(var(--chart-2))",
    },
    {
      name: "Orthopaedic",
      value: 32,
      percentage: 25.6,
      color: "hsl(var(--chart-3))",
    },
    {
      name: "Cardiology",
      value: 15,
      percentage: 12.0,
      color: "hsl(var(--chart-4))",
    },
    {
      name: "Intensive Care",
      value: 8,
      percentage: 6.4,
      color: "hsl(var(--chart-5))",
    },
    {
      name: "Medical Wards",
      value: 28,
      percentage: 22.4,
      color: "hsl(var(--muted))",
    },
  ],
  priorityBreakdown: [
    {
      priority: "Urgent",
      count: 45,
      percentage: 12.6,
      color: "hsl(var(--destructive))",
    },
    {
      priority: "Routine",
      count: 128,
      percentage: 36.0,
      color: "hsl(var(--warning))",
    },
    {
      priority: "Non-urgent",
      count: 183,
      percentage: 51.4,
      color: "hsl(var(--success))",
    },
  ],
  waitTimeAnalysis: [
    { timeRange: "0-1 days", count: 142, percentage: 39.9 },
    { timeRange: "1-3 days", count: 98, percentage: 27.5 },
    { timeRange: "3-7 days", count: 76, percentage: 21.3 },
    { timeRange: "7+ days", count: 40, percentage: 11.2 },
  ],
  outcomeMetrics: [
    { outcome: "Successful", count: 287, percentage: 80.6 },
    { outcome: "Partial Success", count: 42, percentage: 11.8 },
    { outcome: "Cancelled", count: 19, percentage: 5.3 },
    { outcome: "Transferred", count: 8, percentage: 2.2 },
  ],
  weeklyActivity: [
    { day: "Mon", referrals: 52, completed: 48 },
    { day: "Tue", referrals: 61, completed: 56 },
    { day: "Wed", referrals: 58, completed: 54 },
    { day: "Thu", referrals: 64, completed: 59 },
    { day: "Fri", referrals: 67, completed: 61 },
    { day: "Sat", referrals: 31, completed: 28 },
    { day: "Sun", referrals: 23, completed: 21 },
  ],
};

const chartConfig = {
  patients: { label: "Patients", color: "hsl(var(--chart-1))" },
  referrals: { label: "Referrals", color: "hsl(var(--chart-2))" },
  completed: { label: "Completed", color: "hsl(var(--chart-3))" },
  urgent: { label: "Urgent", color: "hsl(var(--destructive))" },
  routine: { label: "Routine", color: "hsl(var(--warning))" },
  nonUrgent: { label: "Non-urgent", color: "hsl(var(--success))" },
};

export default function AdminAnalyticsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [activeTab, setActiveTab] = useState("overview");
  const [mounted, setMounted] = useState(false);

  // Ensure charts only render on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLastUpdated(new Date());
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">Dashboard</h1>
          </div>
          <p className="text-muted-foreground">
            Real-time insights and healthcare analytics
          </p>
          <p className="text-xs text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select defaultValue="last30days">
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last7days">Last 7 days</SelectItem>
              <SelectItem value="last30days">Last 30 days</SelectItem>
              <SelectItem value="last3months">Last 3 months</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="transition-all duration-200 hover:scale-105"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            size="sm"
            className="transition-all duration-200 hover:scale-105"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics with Insights */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Patients
                </p>
                <p className="text-3xl font-bold text-blue-600">
                  {analyticsData.overview.totalPatients.toLocaleString()}
                </p>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-600 font-medium">
                    +12.3%
                  </span>
                  <span className="text-xs text-muted-foreground">
                    vs last month
                  </span>
                </div>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Active Referrals
                </p>
                <p className="text-3xl font-bold text-orange-600">
                  {analyticsData.overview.activeReferrals.toLocaleString()}
                </p>
                <div className="flex items-center gap-1">
                  <Activity className="h-3 w-3 text-orange-500" />
                  <span className="text-xs text-muted-foreground">
                    In progress
                  </span>
                </div>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Completion Rate
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {analyticsData.overview.completionRate}%
                </p>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-600 font-medium">
                    +3.2%
                  </span>
                  <span className="text-xs text-muted-foreground">
                    improvement
                  </span>
                </div>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Avg Wait Time
                </p>
                <p className="text-3xl font-bold text-purple-600">
                  {analyticsData.overview.averageWaitTime} days
                </p>
                <div className="flex items-center gap-1">
                  <TrendingDown className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-600 font-medium">
                    -0.5 days
                  </span>
                  <span className="text-xs text-muted-foreground">
                    improvement
                  </span>
                </div>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Insights Bar */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">
                  Patient Satisfaction
                </p>
                <p className="text-2xl font-bold text-blue-900">
                  {analyticsData.overview.patientSatisfaction}/5.0
                </p>
                <p className="text-xs text-blue-600">+0.3 points this month</p>
              </div>
              <Heart className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">
                  Completed Today
                </p>
                <p className="text-2xl font-bold text-green-900">
                  {analyticsData.overview.todayCompletions}
                </p>
                <p className="text-xs text-green-600">8 above target</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">
                  Urgent Referrals
                </p>
                <p className="text-2xl font-bold text-orange-900">
                  {analyticsData.overview.urgentReferrals}
                </p>
                <p className="text-xs text-orange-600">
                  Require immediate attention
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-muted/50">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="departments"
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200"
          >
            <Building2 className="w-4 h-4 mr-2" />
            Departments
          </TabsTrigger>
          <TabsTrigger
            value="wards"
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200"
          >
            <Bed className="w-4 h-4 mr-2" />
            Wards
          </TabsTrigger>
          <TabsTrigger
            value="performance"
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Performance
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Insights */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Monthly Trends Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Patient & Referral Activity</CardTitle>
                <CardDescription>
                  Monthly patient admissions and referral completion trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!mounted ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <Skeleton className="w-full h-full" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsLineChart
                      data={analyticsData.monthlyTrends}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                      <YAxis stroke="#6b7280" fontSize={12} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="patients"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        name="Patients"
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="referrals"
                        stroke="#10b981"
                        strokeWidth={2}
                        name="Referrals"
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="completed"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        name="Completed"
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Priority Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Priority Distribution
                </CardTitle>
                <CardDescription>Current referral priorities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analyticsData.priorityBreakdown.map((item) => (
                  <div key={item.priority} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-medium">{item.priority}</span>
                      </div>
                      <span className="text-muted-foreground">
                        {item.count} ({item.percentage}%)
                      </span>
                    </div>
                    <Progress value={item.percentage} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Ward Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="w-5 h-5 mr-2" />
                  Patient Distribution by Ward
                </CardTitle>
                <CardDescription>
                  Current patient allocation across wards
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!mounted ? (
                  <div className="h-[250px] flex items-center justify-center">
                    <Skeleton className="w-full h-full" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <RechartsPieChart>
                      <Pie
                        data={analyticsData.wardDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percentage }) =>
                          `${name} ${percentage}%`
                        }
                      >
                        {analyticsData.wardDistribution.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              [
                                "#3b82f6",
                                "#10b981",
                                "#f59e0b",
                                "#ef4444",
                                "#8b5cf6",
                                "#ec4899",
                              ][index]
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                )}
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {analyticsData.wardDistribution.map((item, index) => (
                    <div
                      key={item.name}
                      className="flex items-center space-x-2 text-sm"
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: [
                            "#3b82f6",
                            "#10b981",
                            "#f59e0b",
                            "#ef4444",
                            "#8b5cf6",
                            "#ec4899",
                          ][index],
                        }}
                      />
                      <span>{item.name}</span>
                      <span className="text-muted-foreground">
                        ({item.percentage}%)
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Weekly Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart className="w-5 h-5 mr-2" />
                  Weekly Activity
                </CardTitle>
                <CardDescription>
                  Referrals and completions by day of week
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!mounted ? (
                  <div className="h-[250px] flex items-center justify-center">
                    <Skeleton className="w-full h-full" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <RechartsBarChart
                      data={analyticsData.weeklyActivity}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
                      <YAxis stroke="#6b7280" fontSize={12} />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="referrals"
                        fill="#10b981"
                        name="Referrals"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="completed"
                        fill="#f59e0b"
                        name="Completed"
                        radius={[4, 4, 0, 0]}
                      />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Departments Tab */}
        <TabsContent value="departments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Department Performance Analysis</CardTitle>
              <CardDescription>
                Detailed breakdown of each therapy department
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {analyticsData.departmentPerformance.map((dept) => (
                  <div
                    key={dept.name}
                    className="border rounded-lg p-4 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">{dept.name}</h3>
                      <Badge
                        variant={dept.rate >= 90 ? "default" : "secondary"}
                      >
                        {dept.rate}% completion rate
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">
                          {dept.referrals}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Active Referrals
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">
                          {dept.completed}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Completed
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">
                          {dept.rate}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Success Rate
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">
                          {dept.avgTime}d
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Avg Wait Time
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Completion Progress</span>
                        <span>
                          {dept.completed}/{dept.referrals}
                        </span>
                      </div>
                      <Progress value={dept.rate} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Wards Tab */}
        <TabsContent value="wards" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Ward Occupancy Rates</CardTitle>
                <CardDescription>
                  Current bed utilization across all wards
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    name: "Geriatrics Ward",
                    occupancy: 80,
                    capacity: 30,
                    current: 24,
                  },
                  {
                    name: "Stroke Unit",
                    occupancy: 72,
                    capacity: 25,
                    current: 18,
                  },
                  {
                    name: "Orthopaedic Ward",
                    occupancy: 80,
                    capacity: 40,
                    current: 32,
                  },
                  {
                    name: "Cardiology Ward",
                    occupancy: 75,
                    capacity: 20,
                    current: 15,
                  },
                  {
                    name: "Intensive Care",
                    occupancy: 67,
                    capacity: 12,
                    current: 8,
                  },
                  {
                    name: "Medical Ward A",
                    occupancy: 88,
                    capacity: 25,
                    current: 22,
                  },
                ].map((ward) => (
                  <div key={ward.name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{ward.name}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-muted-foreground">
                          {ward.current}/{ward.capacity} beds
                        </span>
                        <Badge
                          variant={
                            ward.occupancy > 85
                              ? "destructive"
                              : ward.occupancy > 70
                              ? "secondary"
                              : "default"
                          }
                        >
                          {ward.occupancy}%
                        </Badge>
                      </div>
                    </div>
                    <Progress value={ward.occupancy} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ward Performance Metrics</CardTitle>
                <CardDescription>
                  Key indicators for ward management
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-foreground">
                      78.5%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Average Occupancy
                    </div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-foreground">
                      2.3
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Avg Length of Stay (days)
                    </div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-foreground">
                      94%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Patient Satisfaction
                    </div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-foreground">
                      1.2%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Readmission Rate
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Wait Time Analysis</CardTitle>
                <CardDescription>
                  Distribution of referral wait times
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analyticsData.waitTimeAnalysis.map((item) => (
                  <div key={item.timeRange} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{item.timeRange}</span>
                      <span className="text-muted-foreground">
                        {item.count} referrals ({item.percentage}%)
                      </span>
                    </div>
                    <Progress value={item.percentage} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Outcome Analysis</CardTitle>
                <CardDescription>
                  Treatment outcomes and success rates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analyticsData.outcomeMetrics.map((item) => (
                  <div key={item.outcome} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{item.outcome}</span>
                      <span className="text-muted-foreground">
                        {item.count} cases ({item.percentage}%)
                      </span>
                    </div>
                    <Progress value={item.percentage} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">System Notifications</h2>
              <p className="text-muted-foreground">
                Real-time alerts and system updates
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Mark All Read
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {analyticsData.notifications.map((notification) => {
              const IconComponent = notification.icon;
              return (
                <Card
                  key={notification.id}
                  className={`border-l-4 ${
                    notification.type === "urgent"
                      ? "border-l-red-500 bg-red-50"
                      : notification.type === "success"
                      ? "border-l-green-500 bg-green-50"
                      : "border-l-orange-500 bg-orange-50"
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div
                        className={`p-2 rounded-full ${
                          notification.type === "urgent"
                            ? "bg-red-100"
                            : notification.type === "success"
                            ? "bg-green-100"
                            : "bg-orange-100"
                        }`}
                      >
                        <IconComponent
                          className={`w-4 h-4 ${
                            notification.type === "urgent"
                              ? "text-red-600"
                              : notification.type === "success"
                              ? "text-green-600"
                              : "text-orange-600"
                          }`}
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-sm">
                            {notification.title}
                          </h3>
                          <span className="text-xs text-muted-foreground">
                            {notification.time}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {notification.message}
                        </p>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View Details
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Mark Read
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium">Urgent Alerts</span>
                </div>
                <p className="text-2xl font-bold mt-2">1</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Completed Today</span>
                </div>
                <p className="text-2xl font-bold mt-2">47</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-sm font-medium">Pending Reviews</span>
                </div>
                <p className="text-2xl font-bold mt-2">12</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
