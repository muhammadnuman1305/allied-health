"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  Save,
  X,
  AlertCircle,
  User,
  Calendar,
  Clock,
  Plus,
  Trash2,
  Stethoscope,
} from "lucide-react";
import { getById$, create$, update$ } from "@/lib/api/admin/tasks/_request";
import {
  TaskFormData,
  SubTask,
  TASK_TYPES,
} from "@/lib/api/admin/tasks/_model";
import { INTERVENTIONS } from "@/lib/api/admin/referrals/_model";
import { getAll$ as getAllPatients } from "@/lib/api/admin/patients/_request";
import { Patient } from "@/lib/api/admin/patients/_model";
import { getAll$ as getAllUsers } from "@/lib/api/admin/users/_request";
import { User as StaffUser } from "@/lib/api/admin/users/_model";
import { getAll$ as getAllDepartments } from "@/lib/api/admin/departments/_request";
import { Department } from "@/lib/api/admin/departments/_model";

export default function TaskFormContent() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;
  const isNewTask = taskId === "0";

  // Get patientId from URL params if creating a new task from patient page
  const searchParams =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : null;
  const preSelectedPatientId = searchParams?.get("patientId") || "";

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Dropdown data - initialize with empty arrays to prevent undefined errors
  const [patients, setPatients] = useState<Patient[]>([]);
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [dropdownsLoaded, setDropdownsLoaded] = useState(false);

  // Form states
  const [customTaskType, setCustomTaskType] = useState(false);

  // Form data
  const [formData, setFormData] = useState<TaskFormData>({
    patientId: "",
    taskType: "",
    title: "",
    clinicalInstructions: "",
    priority: "Medium",
    dueDate: "",
    dueTime: "",
    assignedToDepartment: "",
    subTasks: [{ id: "1", name: "", assignedToStaff: "" }], // Default one sub-task
    status: "Not Assigned",
  });

  // Interventions state
  const [selectedInterventions, setSelectedInterventions] = useState<string[]>(
    []
  );
  const [interventionAssignments, setInterventionAssignments] = useState<
    Record<string, string>
  >({});

  // Set pre-selected patient when available
  useEffect(() => {
    if (preSelectedPatientId) {
      setFormData((prev) => ({ ...prev, patientId: preSelectedPatientId }));
    }
  }, [preSelectedPatientId]);

  // Load patients, staff, and departments on mount
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        // Set empty arrays first to prevent undefined errors
        setPatients([]);
        setStaff([]);
        setDepartments([]);

        const [patientsResponse, staffResponse, departmentsResponse] =
          await Promise.all([
            getAllPatients(),
            getAllUsers(),
            getAllDepartments(),
          ]);

        // Patients API returns { data: Patient[] }
        const patientsData = patientsResponse?.data || [];
        setPatients(Array.isArray(patientsData) ? patientsData : []);

        // Users API now returns { data: User[] } (mock data)
        const staffData = staffResponse?.data || [];
        setStaff(Array.isArray(staffData) ? staffData : []);

        // Departments API returns { data: Department[] }
        const departmentsData = departmentsResponse?.data || [];
        setDepartments(Array.isArray(departmentsData) ? departmentsData : []);

        // Mark dropdowns as loaded
        setDropdownsLoaded(true);
      } catch (err) {
        console.error("Error fetching dropdown data:", err);
        setError("Failed to load form data. Please try again.");
        // Set empty arrays as fallback
        setPatients([]);
        setStaff([]);
        setDepartments([]);
        setDropdownsLoaded(true);
      }
    };

    fetchDropdownData();
  }, []);

  // Load task data if editing
  useEffect(() => {
    if (!isNewTask) {
      const fetchTask = async () => {
        try {
          setLoading(true);
          const response = await getById$(taskId);
          const task = response.data;

          setFormData({
            id: task.id,
            patientId: task.patientId,
            taskType: task.taskType,
            title: task.title,
            clinicalInstructions: task.clinicalInstructions,
            priority: task.priority,
            dueDate: task.dueDate,
            dueTime: task.dueTime,
            assignedToDepartment: task.assignedToDepartment || "",
            subTasks: task.subTasks || [
              { id: "1", name: "", assignedToStaff: "" },
            ],
            status: task.status,
          });

          // Load interventions if they exist (optional properties)
          const taskWithInterventions = task as any;
          if (taskWithInterventions.interventions) {
            setSelectedInterventions(taskWithInterventions.interventions);
          }
          if (taskWithInterventions.interventionAssignments) {
            setInterventionAssignments(
              taskWithInterventions.interventionAssignments
            );
          }

          // Check if task type is custom
          if (!TASK_TYPES.includes(task.taskType as any)) {
            setCustomTaskType(true);
          }
        } catch (err) {
          setError("Failed to load task. Please try again.");
          console.error("Error fetching task:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchTask();
    }
  }, [taskId, isNewTask]);

  // Handle form field changes
  const handleChange = (field: keyof TaskFormData, value: string | boolean) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      // Auto-update status based on assignment
      if (field === "assignedToDepartment") {
        if (value && prev.status === "Not Assigned") {
          updated.status = "Assigned";
        } else if (
          !value &&
          !updated.assignedToDepartment &&
          !updated.subTasks.some((task) => task.assignedToStaff)
        ) {
          updated.status = "Not Assigned";
        }
      }

      return updated;
    });
    setError(null);
  };

  // Validate form
  const validateForm = (): boolean => {
    if (!formData.patientId) {
      setError("Patient is required");
      return false;
    }
    if (!formData.taskType) {
      setError("Task Type is required");
      return false;
    }
    if (!formData.title.trim()) {
      setError("Title is required");
      return false;
    }
    if (!formData.clinicalInstructions.trim()) {
      setError("Clinical Instructions are required");
      return false;
    }
    if (!formData.dueDate) {
      setError("Due Date is required");
      return false;
    }
    if (!formData.dueTime) {
      setError("Due Time is required");
      return false;
    }
    if (selectedInterventions.length === 0) {
      setError("At least one intervention must be selected");
      return false;
    }
    // Check if all selected interventions have AHA assignments
    const unassignedInterventions = selectedInterventions.filter(
      (intervention) => !interventionAssignments[intervention]
    );
    if (unassignedInterventions.length > 0) {
      setError(
        `All selected interventions must be assigned to an AHA: ${unassignedInterventions.join(
          ", "
        )}`
      );
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Prepare form data with interventions
      const formDataWithInterventions = {
        ...formData,
        interventions: selectedInterventions,
        interventionAssignments: interventionAssignments,
      };

      if (isNewTask) {
        await create$(formDataWithInterventions);
      } else {
        await update$(formDataWithInterventions);
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/admin/tasks");
      }, 1500);
    } catch (err) {
      setError("Failed to save task. Please try again.");
      console.error("Error saving task:", err);
    } finally {
      setSaving(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    router.push("/admin/tasks");
  };

  // Get selected patient name
  const getSelectedPatientName = () => {
    if (!Array.isArray(patients)) return "Select patient...";
    const patient = patients.find((p) => p.id === formData.patientId);
    return patient
      ? `${patient.fullName} (${patient.mrn})`
      : "Select patient...";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">
            {isNewTask ? "Create Task" : "Edit Task"}
          </h1>
        </div>
        <div className="flex items-center justify-center py-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading task...</p>
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
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
            disabled={saving}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isNewTask ? "Create Task" : "Edit Task"}
            </h1>
            <p className="text-muted-foreground">
              {isNewTask
                ? "Create a new task for a patient"
                : "Update task details and assignment"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleCancel} disabled={saving}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-primary hover:bg-primary/90"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Task"}
          </Button>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">
            Task saved successfully! Redirecting...
          </AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Task Basics */}
        <Card>
          <CardHeader>
            <CardTitle>Task Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Patient Selection */}
            <div className="space-y-2">
              <Label htmlFor="patientId" className="cursor-text">
                Patient <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.patientId}
                onValueChange={(value) => handleChange("patientId", value)}
                disabled={!!preSelectedPatientId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select patient..." />
                </SelectTrigger>
                <SelectContent>
                  {!dropdownsLoaded ? (
                    <SelectItem value="loading" disabled>
                      Loading patients...
                    </SelectItem>
                  ) : Array.isArray(patients) && patients.length > 0 ? (
                    patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.fullName} (MRN: {patient.mrn})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-patients" disabled>
                      No patients available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Department Selection */}
            <div className="space-y-2">
              <Label htmlFor="assignedToDepartment" className="cursor-text">
                Department
              </Label>
              <Select
                value={formData.assignedToDepartment || "none"}
                onValueChange={(value) =>
                  handleChange(
                    "assignedToDepartment",
                    value === "none" ? "" : value
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {!dropdownsLoaded ? (
                    <SelectItem value="loading" disabled>
                      Loading departments...
                    </SelectItem>
                  ) : Array.isArray(departments) && departments.length > 0 ? (
                    departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-dept" disabled>
                      No departments available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Task Type */}
            <div className="space-y-2">
              <Label htmlFor="taskType" className="cursor-text">
                Task Type <span className="text-destructive">*</span>
              </Label>
              <div className="flex gap-2">
                {!customTaskType ? (
                  <Select
                    value={formData.taskType}
                    onValueChange={(value) => handleChange("taskType", value)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select task type" />
                    </SelectTrigger>
                    <SelectContent>
                      {TASK_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    type="text"
                    className="flex-1"
                    placeholder="Enter custom task type"
                    value={formData.taskType}
                    onChange={(e) => handleChange("taskType", e.target.value)}
                  />
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setCustomTaskType(!customTaskType);
                    handleChange("taskType", "");
                  }}
                >
                  {customTaskType ? "Predefined" : "Custom"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Choose from predefined types or enter a custom task type.
              </p>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="cursor-text">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                type="text"
                placeholder="Short descriptive title (shown in lists)"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
              />
            </div>

            {/* Clinical Instructions */}
            <div className="space-y-2">
              <Label htmlFor="clinicalInstructions" className="cursor-text">
                Clinical Instructions / Description{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="clinicalInstructions"
                placeholder="Detailed instructions for the staff member on what needs to be done..."
                value={formData.clinicalInstructions}
                onChange={(e) =>
                  handleChange("clinicalInstructions", e.target.value)
                }
                rows={5}
              />
              <p className="text-xs text-muted-foreground">
                Provide clear, detailed instructions for the assigned staff.
              </p>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority" className="cursor-text">
                Priority <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleChange("priority", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">High</Badge>
                      <span className="text-xs text-muted-foreground">
                        - Urgent, immediate attention
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Medium">
                    <div className="flex items-center gap-2">
                      <Badge variant="default">Medium</Badge>
                      <span className="text-xs text-muted-foreground">
                        - Standard priority
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Low">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Low</Badge>
                      <span className="text-xs text-muted-foreground">
                        - Non-urgent, can be scheduled
                      </span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Due Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dueDate" className="cursor-text">
                  Due Date <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="dueDate"
                    type="date"
                    className="pl-10"
                    value={formData.dueDate}
                    onChange={(e) => handleChange("dueDate", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueTime" className="cursor-text">
                  Due Time <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="dueTime"
                    type="time"
                    className="pl-10"
                    value={formData.dueTime}
                    onChange={(e) => handleChange("dueTime", e.target.value)}
                  />
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Due date and time drive overdue logic and dashboard priorities.
            </p>
          </CardContent>
        </Card>

        {/* Interventions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Interventions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Intervention Selection */}
              <div className="space-y-4">
                {Object.entries(INTERVENTIONS).map(
                  ([discipline, interventions]) => (
                    <div key={discipline} className="space-y-2">
                      <h4 className="font-medium capitalize">
                        {discipline.replace(/([A-Z])/g, " $1").trim()}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {interventions.map((intervention) => (
                          <div
                            key={intervention}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={intervention}
                              checked={selectedInterventions.includes(
                                intervention
                              )}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedInterventions([
                                    ...selectedInterventions,
                                    intervention,
                                  ]);
                                } else {
                                  setSelectedInterventions(
                                    selectedInterventions.filter(
                                      (i) => i !== intervention
                                    )
                                  );
                                  // Remove assignment when intervention is unchecked
                                  const newAssignments = {
                                    ...interventionAssignments,
                                  };
                                  delete newAssignments[intervention];
                                  setInterventionAssignments(newAssignments);
                                }
                              }}
                            />
                            <Label htmlFor={intervention} className="text-sm">
                              {intervention}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* AHA Assignment for Selected Interventions */}
              {selectedInterventions.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium">Assign AHAs to Interventions</h4>
                  <div className="space-y-4">
                    {selectedInterventions.map((intervention) => (
                      <div
                        key={intervention}
                        className="flex items-start gap-4 p-4 border rounded-lg bg-muted/30"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-primary"></div>
                            <Label className="text-base font-semibold text-foreground">
                              {intervention}
                            </Label>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Select an AHA to assign this intervention
                          </p>
                        </div>
                        <div className="flex-1 min-w-[200px]">
                          <Select
                            value={
                              interventionAssignments[intervention] || "none"
                            }
                            onValueChange={(value) => {
                              setInterventionAssignments({
                                ...interventionAssignments,
                                [intervention]: value === "none" ? "" : value,
                              });
                            }}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select AHA..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              {!dropdownsLoaded ? (
                                <SelectItem value="loading" disabled>
                                  Loading staff...
                                </SelectItem>
                              ) : Array.isArray(staff) && staff.length > 0 ? (
                                staff.map((staffMember) => (
                                  <SelectItem
                                    key={staffMember.id}
                                    value={staffMember.id}
                                  >
                                    {staffMember.firstName}{" "}
                                    {staffMember.lastName}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="no-staff" disabled>
                                  No staff members available
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Each selected intervention must be assigned to an AHA.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={saving}
            className="bg-primary hover:bg-primary/90"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Task"}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={saving}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
