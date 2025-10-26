"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  Users,
  Activity,
  Settings,
  Edit,
  Plus,
  ArrowLeft,
  Stethoscope,
  Clock,
  AlertTriangle,
  UserCheck,
  UserPlus,
  ClipboardList,
  ArrowDown,
  ArrowUp,
} from "lucide-react";
import { StatsCard } from "@/components/ui/stats-card";
import { getById$ } from "@/lib/api/admin/departments/_request";
import {
  Department,
  getServiceLineDisplayName,
} from "@/lib/api/admin/departments/_model";

export default function DepartmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const departmentId = params.id as string;

  const [department, setDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDepartment = async () => {
      if (departmentId === "0") {
        // New department - redirect to create form
        router.push("/admin/setup/departments/0/edit");
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await getById$(departmentId);
        setDepartment(response.data);
      } catch (err) {
        setError("Failed to fetch department details. Please try again.");
        console.error("Error fetching department:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartment();
  }, [departmentId, router]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Loading Department...</h1>
            <p className="text-muted-foreground">
              Please wait while we fetch the details
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              Loading department details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !department) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Department Not Found</h1>
            <p className="text-muted-foreground">
              The requested department could not be found
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-10">
          <div className="text-center">
            <p className="text-destructive mb-4">
              {error || "Department not found"}
            </p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{department.name}</h1>
              <Badge variant="outline" className="text-sm">
                {department.code}
              </Badge>
              <Badge
                variant={department.status === "A" ? "default" : "outline"}
                className="text-sm"
              >
                {department.status === "A" ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              {getServiceLineDisplayName(department.serviceLine)} Department
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() =>
              router.push(`/admin/setup/departments/${departmentId}/edit`)
            }
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Department
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          title="Open Tasks"
          value={department.openTasks}
          description="Currently assigned"
          icon={ClipboardList}
        />
        <StatsCard
          title="Overdue Tasks"
          value={department.overdueTasks}
          description="Requiring attention"
          icon={AlertTriangle}
          className={department.overdueTasks > 0 ? "border-destructive" : ""}
        />
        <StatsCard
          title="Incoming Referrals Today"
          value={department.incomingReferralsToday}
          description="New referrals received"
          icon={ArrowDown}
        />
        <StatsCard
          title="Active Staff"
          value={department.activeAHPs + department.activeAHAs}
          description={`${department.activeAHPs} AHPs, ${department.activeAHAs} AHAs`}
          icon={Users}
        />
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Service Line
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <Stethoscope className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {getServiceLineDisplayName(department.serviceLine)}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Head AHP
                  </label>
                  <p className="mt-1">
                    {department.headAHPName || "Not assigned"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Default Task Priority
                  </label>
                  <Badge variant="outline" className="mt-1">
                    {department.defaultTaskPriority}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Contact Information
                  </label>
                  <div className="mt-1 space-y-1">
                    <p className="text-sm">{department.contactNumber}</p>
                    <p className="text-sm">{department.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Coverage Wards */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Coverage Wards
                </CardTitle>
              </CardHeader>
              <CardContent>
                {department.coverageWardNames &&
                department.coverageWardNames.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {department.coverageWardNames.map((ward, index) => (
                      <Badge key={index} variant="secondary">
                        {ward}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    No wards assigned for coverage
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Notes */}
          {department.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {department.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Staff Tab */}
        <TabsContent value="staff" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Department Staff</h3>
              <p className="text-muted-foreground">
                Manage AHPs and AHAs assigned to this department
              </p>
            </div>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Staff
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AHPs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Allied Health Professionals ({department.activeAHPs})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">No AHPs assigned yet</p>
              </CardContent>
            </Card>

            {/* AHAs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Allied Health Assistants ({department.activeAHAs})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">No AHAs assigned yet</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Department Tasks</h3>
              <p className="text-muted-foreground">
                Read-only snapshot of tasks assigned to this department
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </Button>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Kanban View Coming Soon
                </h3>
                <p className="text-muted-foreground">
                  Tasks will be displayed in a Kanban board filtered to this
                  department
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Referrals Tab */}
        <TabsContent value="referrals" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Department Referrals</h3>
              <p className="text-muted-foreground">
                Manage incoming and outgoing referrals for this department
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Refer Patient
            </Button>
          </div>

          <Tabs defaultValue="incoming" className="space-y-4">
            <TabsList>
              <TabsTrigger value="incoming" className="flex items-center gap-2">
                <ArrowDown className="h-4 w-4" />
                Incoming ({department.incomingReferralsToday})
              </TabsTrigger>
              <TabsTrigger value="outgoing" className="flex items-center gap-2">
                <ArrowUp className="h-4 w-4" />
                Outgoing
              </TabsTrigger>
            </TabsList>

            <TabsContent value="incoming">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-8">
                    <ArrowDown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      Incoming Referrals
                    </h3>
                    <p className="text-muted-foreground">
                      Incoming referrals will be displayed here with
                      acknowledge/accept/decline actions
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="outgoing">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center py-8">
                    <ArrowUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      Outgoing Referrals
                    </h3>
                    <p className="text-muted-foreground">
                      Outgoing referrals will be displayed here
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold">Department Settings</h3>
            <p className="text-muted-foreground">
              Manage department configuration and coverage
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Department Details
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Building2 className="h-4 w-4 mr-2" />
                  Manage Coverage Wards
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Clock className="h-4 w-4 mr-2" />
                  Set Default Task Priority
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Advanced Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full justify-start text-destructive"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Deactivate Department
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-destructive"
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Merge with Another Department
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
