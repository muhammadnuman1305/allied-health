"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  FileText,
  Calendar,
  Users,
  Activity,
  TrendingUp,
  BarChart3,
  PieChart,
  Filter,
  RefreshCw,
  Eye,
  Share,
} from "lucide-react";

export default function ReportsPage() {
  const reports = [
    {
      id: 1,
      title: "Monthly Patient Referral Summary",
      type: "Operational",
      department: "All Departments",
      status: "Generated",
      lastGenerated: "2024-01-15",
      size: "2.3 MB",
      format: "PDF",
    },
    {
      id: 2,
      title: "Department Performance Analysis",
      type: "Performance",
      department: "Physiotherapy",
      status: "Generated",
      lastGenerated: "2024-01-14",
      size: "1.8 MB",
      format: "Excel",
    },
    {
      id: 3,
      title: "Ward Occupancy Report",
      type: "Operational",
      department: "All Wards",
      status: "Scheduled",
      lastGenerated: "2024-01-13",
      size: "1.2 MB",
      format: "PDF",
    },
    {
      id: 4,
      title: "Patient Outcome Metrics",
      type: "Clinical",
      department: "All Departments",
      status: "Generated",
      lastGenerated: "2024-01-15",
      size: "3.1 MB",
      format: "PDF",
    },
    {
      id: 5,
      title: "Wait Time Analysis",
      type: "Performance",
      department: "All Departments",
      status: "Generating",
      lastGenerated: "2024-01-12",
      size: "0.9 MB",
      format: "Excel",
    },
    {
      id: 6,
      title: "Referral Completion Rates",
      type: "Quality",
      department: "All Departments",
      status: "Generated",
      lastGenerated: "2024-01-15",
      size: "1.5 MB",
      format: "PDF",
    },
  ];

  const scheduledReports = [
    {
      id: 1,
      name: "Daily Activity Summary",
      frequency: "Daily",
      nextRun: "2024-01-16 06:00",
      recipients: "admin@hospital.com, manager@hospital.com",
      status: "Active",
    },
    {
      id: 2,
      name: "Weekly Performance Review",
      frequency: "Weekly",
      nextRun: "2024-01-22 08:00",
      recipients: "department-heads@hospital.com",
      status: "Active",
    },
    {
      id: 3,
      name: "Monthly Quality Report",
      frequency: "Monthly",
      nextRun: "2024-02-01 09:00",
      recipients: "quality@hospital.com, admin@hospital.com",
      status: "Paused",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Generated":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "Generating":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "Scheduled":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "Active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "Paused":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Generate and manage healthcare system reports
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reports</SelectItem>
              <SelectItem value="operational">Operational</SelectItem>
              <SelectItem value="performance">Performance</SelectItem>
              <SelectItem value="clinical">Clinical</SelectItem>
              <SelectItem value="quality">Quality</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm">
            <FileText className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      <Tabs defaultValue="generated" className="space-y-4">
        <TabsList>
          <TabsTrigger value="generated">Generated Reports</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
          <TabsTrigger value="templates">Report Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="generated" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Reports</CardTitle>
              <CardDescription>
                Recently generated reports ready for download
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Generated</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">
                        {report.title}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{report.type}</Badge>
                      </TableCell>
                      <TableCell>{report.department}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(report.status)}>
                          {report.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{report.lastGenerated}</TableCell>
                      <TableCell>{report.size}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="icon" title="View Report">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Download Report"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Share Report"
                        >
                          <Share className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
              <CardDescription>
                Automated reports that run on a schedule
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Name</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Next Run</TableHead>
                    <TableHead>Recipients</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scheduledReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">
                        {report.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{report.frequency}</Badge>
                      </TableCell>
                      <TableCell>{report.nextRun}</TableCell>
                      <TableCell
                        className="max-w-xs truncate"
                        title={report.recipients}
                      >
                        {report.recipients}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(report.status)}>
                          {report.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Edit Schedule"
                        >
                          <Calendar className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Run Now">
                          <Activity className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Patient Demographics
                </CardTitle>
                <CardDescription>
                  Comprehensive patient population analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Generate Report</Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Referral Activity
                </CardTitle>
                <CardDescription>
                  Detailed referral patterns and outcomes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Generate Report</Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Performance Metrics
                </CardTitle>
                <CardDescription>
                  Department and system performance analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Generate Report</Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Wait Time Analysis
                </CardTitle>
                <CardDescription>
                  Patient wait times and bottleneck identification
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Generate Report</Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="w-5 h-5 mr-2" />
                  Resource Utilization
                </CardTitle>
                <CardDescription>
                  Ward occupancy and resource allocation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Generate Report</Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Quality Indicators
                </CardTitle>
                <CardDescription>
                  Patient satisfaction and outcome metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Generate Report</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
