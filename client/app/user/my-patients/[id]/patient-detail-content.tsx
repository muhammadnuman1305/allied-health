"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  User,
  ClipboardList,
  GitBranch,
  MessageSquare,
  History,
  Phone,
  Mail,
  Calendar,
  MapPin,
} from "lucide-react";
import { getById$ } from "@/lib/api/aha/_request";
import { AHAPatientDetails } from "@/lib/api/aha/_model";
import {
  getPatientTasks$,
  getPatientReferrals$,
  getPatientFeedback$,
} from "@/lib/api/admin/patients/_request";
import {
  PatientTask,
  PatientReferral,
  PatientFeedback,
} from "@/lib/api/admin/patients/_model";

// No need for formatMRN since mrn comes directly from API

// Helper functions for badge variants
const getTaskStatusBadge = (
  status: string
): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "Completed":
      return "default";
    case "InProgress":
      return "secondary";
    case "Cancelled":
      return "destructive";
    default:
      return "outline";
  }
};

const getReferralStatusBadge = (
  status: string
): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "Completed":
      return "default";
    case "Accepted":
      return "secondary";
    case "Declined":
      return "destructive";
    default:
      return "outline";
  }
};

const getFeedbackTypeBadge = (
  type: string
): "default" | "secondary" | "destructive" | "outline" => {
  switch (type) {
    case "Positive":
      return "default";
    case "Concern":
      return "destructive";
    default:
      return "outline";
  }
};

export default function PatientDetailContent({
  patientId,
  returnTo,
}: {
  patientId: string;
  returnTo?: string;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [patient, setPatient] = useState<AHAPatientDetails | null>(null);
  const [tasks, setTasks] = useState<PatientTask[]>([]);
  const [referrals, setReferrals] = useState<PatientReferral[]>([]);
  const [feedback, setFeedback] = useState<PatientFeedback[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch patient data from AHA API and related information in parallel
        const [
          patientResponse,
          tasksResponse,
          referralsResponse,
          feedbackResponse,
        ] = await Promise.all([
          getById$(patientId), // Fetch from AHA API
          getPatientTasks$(patientId),
          getPatientReferrals$(patientId),
          getPatientFeedback$(patientId),
        ]);

        setPatient(patientResponse.data);
        setTasks(tasksResponse.data);
        setReferrals(referralsResponse.data);
        setFeedback(feedbackResponse.data);
      } catch (err) {
        setError("Failed to fetch patient data. Please try again.");
        console.error("Error fetching patient data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [patientId]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading patient data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-10">
          <div className="text-center">
            <p className="text-destructive mb-4">
              {error || "Patient not found"}
            </p>
            <Button
              onClick={() => router.push(returnTo || "/user/my-patients")}
            >
              Back to Patients
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(returnTo || "/user/my-patients")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">View Patient</h1>
          <p className="text-muted-foreground">
            View patient information, medical history, tasks, referrals, and
            related details
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6 w-full h-full"
      >
        <TabsList>
          <TabsTrigger value="overview">
            <User className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-4 w-4 mr-2" />
            Past History
          </TabsTrigger>
          <TabsTrigger value="tasks">
            <ClipboardList className="h-4 w-4 mr-2" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="referrals">
            <GitBranch className="h-4 w-4 mr-2" />
            Referrals
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Full Name
                    </Label>
                    <p className="text-sm mt-1">{patient.fullName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Medical Record Number
                    </Label>
                    <p className="text-sm mt-1">{patient.mrn}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Age
                    </Label>
                    <p className="text-sm mt-1">{patient.age} years old</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Gender
                    </Label>
                    <p className="text-sm mt-1">{patient.gender}</p>
                  </div>
                  {patient.dateOfBirth && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Date of Birth
                      </Label>
                      <p className="text-sm mt-1">
                        {new Date(patient.dateOfBirth).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {patient.primaryPhone && (
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">
                          Primary Phone
                        </Label>
                        <p className="text-sm mt-1">{patient.primaryPhone}</p>
                      </div>
                    </div>
                  )}
                  {patient.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">
                          Email
                        </Label>
                        <p className="text-sm mt-1">{patient.email}</p>
                      </div>
                    </div>
                  )}
                  {patient.emergencyContactName && (
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">
                          Emergency Contact Name
                        </Label>
                        <p className="text-sm mt-1">
                          {patient.emergencyContactName}
                        </p>
                      </div>
                    </div>
                  )}
                  {patient.emergencyContactPhone && (
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">
                          Emergency Contact Phone
                        </Label>
                        <p className="text-sm mt-1">
                          {patient.emergencyContactPhone}
                        </p>
                      </div>
                    </div>
                  )}
                  {patient.emergencyContactEmail && (
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">
                          Emergency Contact Email
                        </Label>
                        <p className="text-sm mt-1">
                          {patient.emergencyContactEmail}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Active Tasks
                      </p>
                      <p className="text-2xl font-bold mt-1">
                        {patient.activeTasks}
                      </p>
                    </div>
                    <ClipboardList className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Total Tasks
                      </p>
                      <p className="text-2xl font-bold mt-1">
                        {patient.totalTasks}
                      </p>
                    </div>
                    <ClipboardList className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Total Referrals
                      </p>
                      <p className="text-2xl font-bold mt-1">
                        {patient.totalReferrals}
                      </p>
                    </div>
                    <GitBranch className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Past History Tab */}
        <TabsContent value="history">
          <div className="space-y-6">
            {/* Tasks Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Task History Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No tasks found for this patient
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tasks.slice(0, 5).map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{task.taskName}</p>
                          <p className="text-sm text-muted-foreground">
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={getTaskStatusBadge(task.status)}>
                          {task.status}
                        </Badge>
                      </div>
                    ))}
                    {tasks.length > 5 && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setActiveTab("tasks")}
                      >
                        View All Tasks ({tasks.length})
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Referrals Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5" />
                  Referral History Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                {referrals.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No referrals found for this patient
                  </div>
                ) : (
                  <div className="space-y-4">
                    {referrals.slice(0, 5).map((referral) => (
                      <div key={referral.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">
                            {referral.fromDepartment} → {referral.toDepartment}
                          </p>
                          <Badge
                            variant={getReferralStatusBadge(referral.status)}
                          >
                            {referral.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(referral.date).toLocaleDateString()}
                        </p>
                        {referral.notes && (
                          <p className="text-sm mt-2">{referral.notes}</p>
                        )}
                      </div>
                    ))}
                    {referrals.length > 5 && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setActiveTab("referrals")}
                      >
                        View All Referrals ({referrals.length})
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Feedback Summary */}
            {feedback.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Recent Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {feedback.slice(0, 3).map((item) => (
                      <div key={item.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">{item.taskName}</p>
                          <Badge variant={getFeedbackTypeBadge(item.type)}>
                            {item.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {item.ahp} •{" "}
                          {new Date(item.date).toLocaleDateString()}
                        </p>
                        <p className="text-sm">{item.commentPreview}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>Task History</CardTitle>
            </CardHeader>
            <CardContent>
              {tasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No tasks found for this patient
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>AHA(s)</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Last Activity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">
                          {task.taskName}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getTaskStatusBadge(task.status)}>
                            {task.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{task.assignedTo.join(", ")}</TableCell>
                        <TableCell>
                          {new Date(task.dueDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {new Date(task.lastActivity).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Referrals Tab */}
        <TabsContent value="referrals">
          <Card>
            <CardHeader>
              <CardTitle>Referral History</CardTitle>
            </CardHeader>
            <CardContent>
              {referrals.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No referrals found for this patient
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>From Department</TableHead>
                      <TableHead>To Department</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referrals.map((referral) => (
                      <TableRow key={referral.id}>
                        <TableCell>{referral.fromDepartment}</TableCell>
                        <TableCell>{referral.toDepartment}</TableCell>
                        <TableCell>
                          {new Date(referral.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {referral.notes}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getReferralStatusBadge(referral.status)}
                          >
                            {referral.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
