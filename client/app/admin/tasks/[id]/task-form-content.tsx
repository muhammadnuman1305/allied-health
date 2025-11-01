"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getUser } from "@/lib/auth-utils";
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
import {
  getById$,
  create$,
  update$,
  getSpecialties$,
  getInterventions$,
  getAHAOptions$,
  getDeptOptions$,
  getWardOptions$,
  TaskSpecialty,
  TaskIntervention,
  AHAOption,
  DeptOption,
  WardOption,
} from "@/lib/api/admin/tasks/_request";
import {
  TaskFormData,
  SubTask,
  TASK_TYPES,
} from "@/lib/api/admin/tasks/_model";
import { getAll$ as getAllPatients } from "@/lib/api/admin/patients/_request";
import { Patient } from "@/lib/api/admin/patients/_model";

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
  const [ahaOptions, setAhaOptions] = useState<AHAOption[]>([]);
  const [deptOptions, setDeptOptions] = useState<DeptOption[]>([]);
  const [wardOptions, setWardOptions] = useState<WardOption[]>([]);
  const [dropdownsLoaded, setDropdownsLoaded] = useState(false);

  // Specialties and interventions data
  const [specialties, setSpecialties] = useState<TaskSpecialty[]>([]);
  const [interventions, setInterventions] = useState<TaskIntervention[]>([]);
  const [interventionsLoaded, setInterventionsLoaded] = useState(false);

  // Form states
  const [customTaskType, setCustomTaskType] = useState(false);
  const [isDepartmentDisabled, setIsDepartmentDisabled] = useState(false);

  // Form data
  const [formData, setFormData] = useState<TaskFormData>({
    patientId: "",
    taskType: "",
    title: "",
    diagnosis: "",
    goals: "",
    clinicalInstructions: "",
    priority: "Medium",
    dueDate: "",
    dueTime: "00:00",
    assignedToDepartment: "",
    subTasks: [{ id: "1", name: "", assignedToStaff: "" }], // Default one sub-task
    status: "Not Assigned",
  });

  // Local date range state (UI only). We'll map endDate -> dueDate for API.
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Interventions state
  const [selectedInterventions, setSelectedInterventions] = useState<string[]>(
    []
  );
  const [interventionAssignments, setInterventionAssignments] = useState<
    Record<string, string>
  >({});

  // Per-intervention scheduling and priority
  const [interventionSchedules, setInterventionSchedules] = useState<
    Record<string, { startDate: string; endDate: string }>
  >({});

  // Per-intervention ward selection
  const [interventionWardAssignments, setInterventionWardAssignments] =
    useState<Record<string, string>>({});

  // Helper to build date options between task start/end (inclusive)
  const buildDateRangeOptions = (start: string, end: string): string[] => {
    if (!start || !end) return [];
    const startDt = new Date(start);
    const endDt = new Date(end);
    if (isNaN(startDt.getTime()) || isNaN(endDt.getTime())) return [];
    const dates: string[] = [];
    let cursor = new Date(startDt);
    while (cursor <= endDt) {
      const iso = cursor.toISOString().slice(0, 10);
      dates.push(iso);
      cursor.setDate(cursor.getDate() + 1);
    }
    return dates;
  };

  const toDate = (d: string): Date => new Date(d);
  const minDate = (a: string, b: string): string =>
    toDate(a) <= toDate(b) ? a : b;
  const maxDate = (a: string, b: string): string =>
    toDate(a) >= toDate(b) ? a : b;
  const addDays = (d: string, n: number): string => {
    const dt = new Date(d);
    dt.setDate(dt.getDate() + n);
    return dt.toISOString().slice(0, 10);
  };

  // Check if a proposed range for a given intervention would overlap others
  const wouldOverlapWithOthers = (
    key: string,
    proposedStart: string,
    proposedEnd: string
  ): boolean => {
    if (!proposedStart || !proposedEnd) return false;
    const startDt = new Date(proposedStart);
    const endDt = new Date(proposedEnd);
    for (const otherKey of Object.keys(interventionSchedules)) {
      if (otherKey === key) continue;
      const other = interventionSchedules[otherKey];
      if (!other || !other.startDate || !other.endDate) continue;
      const os = new Date(other.startDate);
      const oe = new Date(other.endDate);
      // conflict if ranges overlap or touch (no adjacency allowed)
      if (startDt <= oe && os <= endDt) {
        return true;
      }
    }
    return false;
  };

  // For a given start, return the latest allowed end date (inclusive) that
  // won't overlap or touch any other intervention and stays within task end
  const getLatestAllowedEnd = (key: string, start: string): string => {
    if (!start) return "";
    let latest = endDate || start; // cap by task end
    for (const otherKey of Object.keys(interventionSchedules)) {
      if (otherKey === key) continue;
      const other = interventionSchedules[otherKey];
      if (!other || !other.startDate || !other.endDate) continue;
      const os = other.startDate;
      const oe = other.endDate;
      // If our start is before or within other's window, our end must be < os (no touching)
      if (toDate(start) <= toDate(oe)) {
        const allowed = addDays(os, -1);
        if (!latest || toDate(allowed) < toDate(latest)) latest = allowed;
      }
    }
    // Ensure not before start
    if (toDate(latest) < toDate(start)) return "";
    return latest;
  };

  // Compute execution order based on start date (then end date)
  const getInterventionExecutionOrder = (): Record<string, number> => {
    const items = selectedInterventions
      .map((key) => ({
        key,
        start: interventionSchedules[key]?.startDate || "",
        end: interventionSchedules[key]?.endDate || "",
      }))
      .filter((x) => x.start && x.end);
    items.sort((a, b) => {
      const sa = new Date(a.start).getTime();
      const sb = new Date(b.start).getTime();
      if (sa !== sb) return sa - sb;
      const ea = new Date(a.end).getTime();
      const eb = new Date(b.end).getTime();
      return ea - eb;
    });
    const order: Record<string, number> = {};
    items.forEach((item, idx) => {
      order[item.key] = idx + 1;
    });
    return order;
  };

  // Set pre-selected patient when available
  useEffect(() => {
    if (preSelectedPatientId) {
      setFormData((prev) => ({ ...prev, patientId: preSelectedPatientId }));
    }
  }, [preSelectedPatientId]);

  // Load patients, AHA options, departments, and wards on mount
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        // Set empty arrays first to prevent undefined errors
        setPatients([]);
        setAhaOptions([]);
        setDeptOptions([]);
        setWardOptions([]);

        const [
          patientsResponse,
          ahaOptionsResponse,
          deptOptionsResponse,
          wardOptionsResponse,
        ] = await Promise.all([
          getAllPatients(),
          getAHAOptions$(),
          getDeptOptions$(),
          getWardOptions$(),
        ]);

        // Patients API returns { data: Patient[] }
        const patientsData = patientsResponse?.data || [];
        setPatients(Array.isArray(patientsData) ? patientsData : []);

        // AHA Options API returns { data: AHAOption[] }
        const ahaOptionsData = ahaOptionsResponse?.data || [];
        setAhaOptions(Array.isArray(ahaOptionsData) ? ahaOptionsData : []);

        // Department Options API returns { data: DeptOption[] }
        const deptOptionsData = deptOptionsResponse?.data || [];
        setDeptOptions(Array.isArray(deptOptionsData) ? deptOptionsData : []);

        // Ward Options API returns { data: WardOption[] }
        const wardOptionsData = wardOptionsResponse?.data || [];
        setWardOptions(Array.isArray(wardOptionsData) ? wardOptionsData : []);

        // Mark dropdowns as loaded
        setDropdownsLoaded(true);

        // Check if user has departmentId in localStorage and pre-select it
        const user = getUser();
        if (
          user?.departmentId &&
          Array.isArray(deptOptionsData) &&
          deptOptionsData.length > 0
        ) {
          // Check if the departmentId exists in the loaded departments
          const departmentExists = deptOptionsData.some(
            (dept) => dept.id === user.departmentId
          );
          if (departmentExists) {
            setFormData((prev) => ({
              ...prev,
              assignedToDepartment: user.departmentId!,
            }));
            setIsDepartmentDisabled(true);
          }
        }
      } catch (err) {
        console.error("Error fetching dropdown data:", err);
        setError("Failed to load form data. Please try again.");
        // Set empty arrays as fallback
        setPatients([]);
        setAhaOptions([]);
        setDeptOptions([]);
        setWardOptions([]);
        setDropdownsLoaded(true);
      }
    };

    fetchDropdownData();
  }, []);

  // Load specialties and interventions on mount
  useEffect(() => {
    const fetchInterventionsData = async () => {
      try {
        const [specialtiesResponse, interventionsResponse] = await Promise.all([
          getSpecialties$(),
          getInterventions$(),
        ]);

        const specialtiesData = specialtiesResponse?.data || [];
        const interventionsData = interventionsResponse?.data || [];

        setSpecialties(Array.isArray(specialtiesData) ? specialtiesData : []);
        setInterventions(
          Array.isArray(interventionsData) ? interventionsData : []
        );

        setInterventionsLoaded(true);
      } catch (err) {
        console.error("Error fetching specialties/interventions:", err);
        setError("Failed to load interventions data. Please try again.");
        setSpecialties([]);
        setInterventions([]);
        setInterventionsLoaded(true);
      }
    };

    fetchInterventionsData();
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
            taskType: task.taskType || "",
            title: task.title,
            diagnosis: task.diagnosis || "",
            goals: task.goals || "",
            clinicalInstructions:
              task.clinicalInstructions || task.description || "",
            priority: task.priority,
            dueDate: task.dueDate || task.endDate || "",
            dueTime: task.dueTime || "00:00",
            assignedToDepartment:
              task.assignedToDepartment || task.departmentId || "",
            subTasks: task.subTasks || [
              { id: "1", name: "", assignedToStaff: "" },
            ],
            status: task.status,
          });

          // Initialize date range from existing startDate/endDate or dueDate
          setStartDate(task.startDate || task.dueDate || "");
          setEndDate(task.endDate || task.dueDate || "");

          // Load interventions if they exist (from transformed task or raw response)
          const taskWithInterventions = task as any;
          if (
            taskWithInterventions.interventions &&
            Array.isArray(taskWithInterventions.interventions)
          ) {
            // Filter out duplicates to prevent duplicate intervention cards
            const uniqueInterventions = Array.from(
              new Set(taskWithInterventions.interventions as string[])
            );
            setSelectedInterventions(uniqueInterventions);
          }
          if (taskWithInterventions.interventionAssignments) {
            setInterventionAssignments(
              taskWithInterventions.interventionAssignments
            );
          }
          if (taskWithInterventions.interventionSchedules) {
            setInterventionSchedules(
              taskWithInterventions.interventionSchedules
            );
          }
          if (taskWithInterventions.interventionWardAssignments) {
            setInterventionWardAssignments(
              taskWithInterventions.interventionWardAssignments
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

  // Helper function to count words in a string
  const countWords = (text: string): number => {
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  };

  // Check if form is valid (silent validation for button disabling)
  const isFormValid = (): boolean => {
    if (!formData.patientId) return false;
    if (!formData.title.trim()) return false;
    if (!formData.diagnosis?.trim()) return false;
    if (countWords(formData.diagnosis || "") < 20) return false;
    if (!formData.goals?.trim()) return false;
    if (countWords(formData.goals || "") < 20) return false;
    if (!formData.clinicalInstructions.trim()) return false;
    if (countWords(formData.clinicalInstructions) < 20) return false;
    if (!formData.assignedToDepartment) return false;
    if (!startDate) return false;
    if (!endDate) return false;
    if (startDate && endDate && new Date(startDate) > new Date(endDate))
      return false;
    if (selectedInterventions.length === 0) return false;

    // Check if all selected interventions have AHA, start, end, and ward
    for (const interventionId of selectedInterventions) {
      if (!interventionAssignments[interventionId]) return false;
      const schedule = interventionSchedules[interventionId];
      if (!schedule || !schedule.startDate || !schedule.endDate) return false;
      if (!interventionWardAssignments[interventionId]) return false;

      // Validate date ranges
      if (new Date(schedule.startDate) > new Date(schedule.endDate))
        return false;
      if (startDate && new Date(schedule.startDate) < new Date(startDate))
        return false;
      if (endDate && new Date(schedule.endDate) > new Date(endDate))
        return false;
    }

    // Ensure no overlaps between interventions
    const ranges = selectedInterventions.map((k) => {
      return {
        key: k,
        start: new Date(interventionSchedules[k].startDate),
        end: new Date(interventionSchedules[k].endDate),
      };
    });
    for (let i = 0; i < ranges.length; i++) {
      for (let j = i + 1; j < ranges.length; j++) {
        const a = ranges[i];
        const b = ranges[j];
        if (a.start <= b.end && b.start <= a.end) return false;
      }
    }

    return true;
  };

  // Validate form
  const validateForm = (): boolean => {
    if (!formData.patientId) {
      setError("Patient is required");
      return false;
    }
    if (!formData.title.trim()) {
      setError("Title is required");
      return false;
    }
    if (!formData.diagnosis?.trim()) {
      setError("Diagnosis is required");
      return false;
    }
    const diagnosisWordCount = countWords(formData.diagnosis || "");
    if (diagnosisWordCount < 20) {
      setError(
        `Diagnosis must contain at least 20 words (currently ${diagnosisWordCount} words)`
      );
      return false;
    }
    if (!formData.goals?.trim()) {
      setError("Goals are required");
      return false;
    }
    const goalsWordCount = countWords(formData.goals || "");
    if (goalsWordCount < 20) {
      setError(
        `Goals must contain at least 20 words (currently ${goalsWordCount} words)`
      );
      return false;
    }
    if (!formData.clinicalInstructions.trim()) {
      setError("Clinical Instructions are required");
      return false;
    }
    const clinicalInstructionsWordCount = countWords(
      formData.clinicalInstructions
    );
    if (clinicalInstructionsWordCount < 20) {
      setError(
        `Clinical Instructions must contain at least 20 words (currently ${clinicalInstructionsWordCount} words)`
      );
      return false;
    }
    if (!formData.assignedToDepartment) {
      setError("Department is required");
      return false;
    }
    if (!startDate) {
      setError("Start Date is required");
      return false;
    }
    if (!endDate) {
      setError("End Date is required");
      return false;
    }
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      setError("End Date cannot be earlier than Start Date");
      return false;
    }
    if (selectedInterventions.length === 0) {
      setError("At least one intervention must be selected");
      return false;
    }
    // Check if all selected interventions have AHA assignments
    const unassignedInterventions = selectedInterventions.filter(
      (interventionId) => !interventionAssignments[interventionId]
    );
    if (unassignedInterventions.length > 0) {
      const unassignedNames = unassignedInterventions.map((id) => {
        const intervention = interventions.find((i) => i.id === id);
        return intervention?.name || id;
      });
      setError(
        `All selected interventions must be assigned to an AHA: ${unassignedNames.join(
          ", "
        )}`
      );
      return false;
    }

    // Validate per-intervention schedules and wards
    for (const interventionId of selectedInterventions) {
      const schedule = interventionSchedules[interventionId];
      const intervention = interventions.find((i) => i.id === interventionId);
      const interventionName = intervention?.name || interventionId;
      if (!schedule || !schedule.startDate || !schedule.endDate) {
        setError(`Please select start and end dates for: ${interventionName}`);
        return false;
      }
      if (!interventionWardAssignments[interventionId]) {
        setError(`Please select a ward for: ${interventionName}`);
        return false;
      }
      if (new Date(schedule.startDate) > new Date(schedule.endDate)) {
        setError(
          `End date cannot be earlier than start date for: ${interventionName}`
        );
        return false;
      }
      if (startDate && new Date(schedule.startDate) < new Date(startDate)) {
        setError(
          `Start date for ${interventionName} must be on/after the task start date`
        );
        return false;
      }
      if (endDate && new Date(schedule.endDate) > new Date(endDate)) {
        setError(
          `End date for ${interventionName} must be on/before the task end date`
        );
        return false;
      }
    }

    // Ensure no overlaps between interventions
    const ranges = selectedInterventions.map((k) => {
      const intervention = interventions.find((i) => i.id === k);
      return {
        key: k,
        name: intervention?.name || k,
        start: new Date(interventionSchedules[k].startDate),
        end: new Date(interventionSchedules[k].endDate),
      };
    });
    for (let i = 0; i < ranges.length; i++) {
      for (let j = i + 1; j < ranges.length; j++) {
        const a = ranges[i];
        const b = ranges[j];
        // Overlap if a.start <= b.end and b.start <= a.end (inclusive)
        if (a.start <= b.end && b.start <= a.end) {
          setError(
            `Interventions "${a.name}" and "${b.name}" have overlapping dates. Adjust their ranges.`
          );
          return false;
        }
      }
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
        // Include startDate and endDate for backend DTO
        startDate: startDate || formData.dueDate,
        endDate: endDate || formData.dueDate,
        // Map endDate to dueDate to maintain compatibility
        dueDate: endDate || formData.dueDate,
        interventions: selectedInterventions,
        interventionAssignments: interventionAssignments,
        interventionSchedules: interventionSchedules,
        interventionWardAssignments: interventionWardAssignments,
        interventionOrder: getInterventionExecutionOrder(),
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
    return patient ? `${patient.fullName}` : "Select patient...";
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          {patient.fullName}
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
                  Department <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.assignedToDepartment || "none"}
                  onValueChange={(value) =>
                    handleChange(
                      "assignedToDepartment",
                      value === "none" ? "" : value
                    )
                  }
                  disabled={isDepartmentDisabled}
                >
                  <SelectTrigger disabled={isDepartmentDisabled}>
                    <SelectValue placeholder="Select department (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {!dropdownsLoaded ? (
                      <SelectItem value="loading" disabled>
                        Loading departments...
                      </SelectItem>
                    ) : Array.isArray(deptOptions) && deptOptions.length > 0 ? (
                      deptOptions.map((dept) => (
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
              {/* <div className="space-y-2">
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
              </div> */}

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="cursor-text">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="Short descriptive title"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                />
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

              {/* Diagnosis */}
              <div className="space-y-2">
                <Label htmlFor="diagnosis" className="cursor-text">
                  Diagnosis <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="diagnosis"
                  placeholder="Enter patient diagnosis or medical condition..."
                  value={formData.diagnosis || ""}
                  onChange={(e) => handleChange("diagnosis", e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Provide the diagnosis or medical condition relevant to this
                  task. Minimum 20 words required (
                  {countWords(formData.diagnosis || "")} words).
                </p>
              </div>

              {/* Goals */}
              <div className="space-y-2">
                <Label htmlFor="goals" className="cursor-text">
                  Goals <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="goals"
                  placeholder="Enter treatment goals or objectives..."
                  value={formData.goals || ""}
                  onChange={(e) => handleChange("goals", e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Describe the goals or objectives for this task. Minimum 20
                  words required ({countWords(formData.goals || "")} words).
                </p>
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <Label htmlFor="startDate" className="cursor-text">
                  Start Date <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="startDate"
                    type="date"
                    className="pl-10"
                    value={startDate}
                    max={endDate || undefined}
                    onChange={(e) => {
                      const v = e.target.value;
                      setStartDate(v);
                      if (endDate && new Date(v) > new Date(endDate)) {
                        setEndDate(v);
                      }
                    }}
                  />
                </div>
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <Label htmlFor="endDate" className="cursor-text">
                  End Date <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="endDate"
                    type="date"
                    className="pl-10"
                    value={endDate}
                    min={startDate || undefined}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Clinical Instructions (full width) */}
              <div className="space-y-2 md:col-span-2">
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
                  Minimum 20 words required (
                  {countWords(formData.clinicalInstructions)} words).
                </p>
              </div>
            </div>
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
                {(() => {
                  // Group interventions by specialtyId
                  const interventionsBySpecialty = specialties.reduce(
                    (acc, specialty) => {
                      const specialtyInterventions = interventions.filter(
                        (intervention) =>
                          intervention.specialtyId === specialty.id
                      );
                      // Only include specialties that have interventions
                      if (specialtyInterventions.length > 0) {
                        acc[specialty.id] = {
                          specialty,
                          interventions: specialtyInterventions,
                        };
                      }
                      return acc;
                    },
                    {} as Record<
                      string,
                      {
                        specialty: TaskSpecialty;
                        interventions: TaskIntervention[];
                      }
                    >
                  );

                  if (!interventionsLoaded) {
                    return (
                      <div className="text-center py-4 text-muted-foreground">
                        Loading interventions...
                      </div>
                    );
                  }

                  if (Object.keys(interventionsBySpecialty).length === 0) {
                    return (
                      <div className="text-center py-4 text-muted-foreground">
                        No interventions available
                      </div>
                    );
                  }

                  return Object.values(interventionsBySpecialty).map(
                    ({ specialty, interventions: specialtyInterventions }) => (
                      <div key={specialty.id} className="space-y-2">
                        <h4 className="font-medium">{specialty.name}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {specialtyInterventions.map((intervention) => (
                            <div
                              key={intervention.id}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={intervention.id}
                                checked={selectedInterventions.includes(
                                  intervention.id
                                )}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    // Prevent duplicates
                                    if (
                                      !selectedInterventions.includes(
                                        intervention.id
                                      )
                                    ) {
                                      setSelectedInterventions([
                                        ...selectedInterventions,
                                        intervention.id,
                                      ]);
                                    }
                                  } else {
                                    setSelectedInterventions(
                                      selectedInterventions.filter(
                                        (i) => i !== intervention.id
                                      )
                                    );
                                    // Remove assignment when intervention is unchecked
                                    const newAssignments = {
                                      ...interventionAssignments,
                                    };
                                    delete newAssignments[intervention.id];
                                    setInterventionAssignments(newAssignments);
                                    // Remove ward assignment when intervention is unchecked
                                    const newWardAssignments = {
                                      ...interventionWardAssignments,
                                    };
                                    delete newWardAssignments[intervention.id];
                                    setInterventionWardAssignments(
                                      newWardAssignments
                                    );
                                    // Remove schedule when intervention is unchecked
                                    const newSchedules = {
                                      ...interventionSchedules,
                                    };
                                    delete newSchedules[intervention.id];
                                    setInterventionSchedules(newSchedules);
                                  }
                                }}
                              />
                              <Label
                                htmlFor={intervention.id}
                                className="text-sm"
                              >
                                {intervention.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  );
                })()}
              </div>

              {/* AHA Assignment for Selected Interventions */}
              {selectedInterventions.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium">Assign AHAs to Interventions</h4>
                  <div className="space-y-4">
                    {Array.from(new Set(selectedInterventions)).map(
                      (interventionId, index) => {
                        const intervention = interventions.find(
                          (i) => i.id === interventionId
                        );
                        const interventionName =
                          intervention?.name || interventionId;
                        const interventionSpecialtyId =
                          intervention?.specialtyId;

                        // Filter AHA options to only show those with matching specialty
                        const availableAHAs = interventionSpecialtyId
                          ? ahaOptions.filter((aha) =>
                              aha.specialties.includes(interventionSpecialtyId)
                            )
                          : [];

                        return (
                          <div
                            key={`${interventionId}-${index}`}
                            className="flex items-start gap-4 p-4 border rounded-lg bg-muted/30"
                          >
                            <div className="flex-1">
                              <div className="flex items-center justify-between gap-3 mb-2">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <div className="w-2 h-2 rounded-full bg-primary shrink-0"></div>
                                  <Label className="text-base font-semibold text-foreground flex items-center gap-2 min-w-0">
                                    <span className="truncate">
                                      {interventionName}
                                    </span>
                                    {/* Order badge */}
                                    <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-2 rounded-full bg-primary/10 text-primary text-xs font-semibold shrink-0">
                                      {getInterventionExecutionOrder()[
                                        interventionId
                                      ] ?? "-"}
                                    </span>
                                  </Label>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 shrink-0 text-destructive hover:text-destructive bg-transparent hover:bg-destructive/10"
                                  onClick={() => {
                                    // Remove from selected interventions
                                    setSelectedInterventions(
                                      selectedInterventions.filter(
                                        (i) => i !== interventionId
                                      )
                                    );
                                    // Remove assignment
                                    const newAssignments = {
                                      ...interventionAssignments,
                                    };
                                    delete newAssignments[interventionId];
                                    setInterventionAssignments(newAssignments);
                                    // Remove ward assignment
                                    const newWardAssignments = {
                                      ...interventionWardAssignments,
                                    };
                                    delete newWardAssignments[interventionId];
                                    setInterventionWardAssignments(
                                      newWardAssignments
                                    );
                                    // Remove schedule
                                    const newSchedules = {
                                      ...interventionSchedules,
                                    };
                                    delete newSchedules[interventionId];
                                    setInterventionSchedules(newSchedules);
                                  }}
                                  title="Remove intervention"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Select an AHA, start date, end date, and ward
                                for this intervention
                              </p>
                            </div>
                            <div className="flex-1 min-w-[220px] space-y-3">
                              {/* AHA Select */}
                              <div className="space-y-1">
                                <Label className="text-xs">
                                  AHA{" "}
                                  <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                  value={
                                    interventionAssignments[interventionId] ||
                                    "none"
                                  }
                                  onValueChange={(value) => {
                                    setInterventionAssignments({
                                      ...interventionAssignments,
                                      [interventionId]:
                                        value === "none" ? "" : value,
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
                                        Loading AHAs...
                                      </SelectItem>
                                    ) : availableAHAs.length > 0 ? (
                                      availableAHAs.map((aha) => (
                                        <SelectItem key={aha.id} value={aha.id}>
                                          {aha.name}
                                        </SelectItem>
                                      ))
                                    ) : (
                                      <SelectItem value="no-aha" disabled>
                                        No AHAs available for this specialty
                                      </SelectItem>
                                    )}
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Start/End/Ward dropdowns */}
                              <div className="grid grid-cols-3 gap-3 items-end">
                                <div>
                                  <Label className="text-xs">
                                    Start{" "}
                                    <span className="text-destructive">*</span>
                                  </Label>
                                  <Select
                                    value={
                                      interventionSchedules[interventionId]
                                        ?.startDate || "none"
                                    }
                                    onValueChange={(value) => {
                                      const v = value === "none" ? "" : value;
                                      const current = interventionSchedules[
                                        interventionId
                                      ] || {
                                        startDate: "",
                                        endDate: "",
                                      };
                                      const next = { ...current, startDate: v };
                                      // auto-fix if end before start
                                      if (
                                        next.endDate &&
                                        v &&
                                        new Date(v) > new Date(next.endDate)
                                      ) {
                                        next.endDate = v;
                                      }
                                      // set end date equal to start date when start is assigned
                                      if (next.startDate) {
                                        const latest = getLatestAllowedEnd(
                                          interventionId,
                                          next.startDate
                                        );
                                        if (!latest) {
                                          setError(
                                            "No available end date for the chosen start."
                                          );
                                          return;
                                        }
                                        // Always default to same-day range (start == end)
                                        next.endDate = next.startDate;
                                      }
                                      // overlap guard
                                      if (
                                        next.startDate &&
                                        next.endDate &&
                                        wouldOverlapWithOthers(
                                          interventionId,
                                          next.startDate,
                                          next.endDate
                                        )
                                      ) {
                                        setError(
                                          "Selected dates overlap with another intervention."
                                        );
                                        return;
                                      }
                                      setInterventionSchedules({
                                        ...interventionSchedules,
                                        [interventionId]: next,
                                      });
                                    }}
                                    disabled={!startDate || !endDate}
                                  >
                                    <SelectTrigger>
                                      <SelectValue
                                        placeholder={
                                          !startDate || !endDate
                                            ? "Pick task dates first"
                                            : "Start date"
                                        }
                                      />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="none">None</SelectItem>
                                      {buildDateRangeOptions(
                                        startDate,
                                        endDate
                                      ).map((d) => {
                                        const latest = getLatestAllowedEnd(
                                          interventionId,
                                          d
                                        );
                                        const disabled = !latest;
                                        return (
                                          <SelectItem
                                            key={d}
                                            value={d}
                                            disabled={disabled}
                                          >
                                            {d}
                                          </SelectItem>
                                        );
                                      })}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label className="text-xs">
                                    End{" "}
                                    <span className="text-destructive">*</span>
                                  </Label>
                                  <Select
                                    value={
                                      interventionSchedules[interventionId]
                                        ?.endDate || "none"
                                    }
                                    onValueChange={(value) => {
                                      const v = value === "none" ? "" : value;
                                      const current = interventionSchedules[
                                        interventionId
                                      ] || {
                                        startDate: "",
                                        endDate: "",
                                      };
                                      const next = { ...current, endDate: v };
                                      // auto-fix if end before start
                                      if (
                                        next.startDate &&
                                        v &&
                                        new Date(next.startDate) > new Date(v)
                                      ) {
                                        next.startDate = v;
                                      }
                                      // overlap guard
                                      if (
                                        next.startDate &&
                                        next.endDate &&
                                        wouldOverlapWithOthers(
                                          interventionId,
                                          next.startDate,
                                          next.endDate
                                        )
                                      ) {
                                        setError(
                                          "Selected dates overlap with another intervention."
                                        );
                                        return;
                                      }
                                      setInterventionSchedules({
                                        ...interventionSchedules,
                                        [interventionId]: next,
                                      });
                                    }}
                                    disabled={!startDate || !endDate}
                                  >
                                    <SelectTrigger>
                                      <SelectValue
                                        placeholder={
                                          !startDate || !endDate
                                            ? "Pick task dates first"
                                            : "End date"
                                        }
                                      />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="none">None</SelectItem>
                                      {buildDateRangeOptions(
                                        startDate,
                                        endDate
                                      ).map((d) => {
                                        const current = interventionSchedules[
                                          interventionId
                                        ] || {
                                          startDate: "",
                                          endDate: "",
                                        };
                                        const latest = current.startDate
                                          ? getLatestAllowedEnd(
                                              interventionId,
                                              current.startDate
                                            )
                                          : "";
                                        const disabled =
                                          !current.startDate ||
                                          !latest ||
                                          new Date(d) > new Date(latest) ||
                                          wouldOverlapWithOthers(
                                            interventionId,
                                            current.startDate || d,
                                            d
                                          );
                                        return (
                                          <SelectItem
                                            key={d}
                                            value={d}
                                            disabled={disabled}
                                          >
                                            {d}
                                          </SelectItem>
                                        );
                                      })}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="max-w-xs">
                                  <Label className="text-xs">
                                    Ward{" "}
                                    <span className="text-destructive">*</span>
                                  </Label>
                                  <Select
                                    value={
                                      interventionWardAssignments[
                                        interventionId
                                      ] || "none"
                                    }
                                    onValueChange={(value) => {
                                      setInterventionWardAssignments({
                                        ...interventionWardAssignments,
                                        [interventionId]:
                                          value === "none" ? "" : value,
                                      });
                                    }}
                                    disabled={!formData.assignedToDepartment}
                                  >
                                    <SelectTrigger className="">
                                      <SelectValue
                                        placeholder={
                                          !formData.assignedToDepartment
                                            ? "Select department first"
                                            : "Select ward..."
                                        }
                                      />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="none">None</SelectItem>
                                      {(() => {
                                        // Filter wards based on selected department
                                        const selectedDept =
                                          formData.assignedToDepartment;

                                        if (!selectedDept) {
                                          return (
                                            <SelectItem
                                              value="no-dept"
                                              disabled
                                            >
                                              Select a department first
                                            </SelectItem>
                                          );
                                        }

                                        const availableWards =
                                          wardOptions.filter((ward) =>
                                            ward.departments.includes(
                                              selectedDept
                                            )
                                          );

                                        if (!dropdownsLoaded) {
                                          return (
                                            <SelectItem
                                              value="loading"
                                              disabled
                                            >
                                              Loading wards...
                                            </SelectItem>
                                          );
                                        }
                                        if (availableWards.length > 0) {
                                          return availableWards.map((ward) => (
                                            <SelectItem
                                              key={ward.id}
                                              value={ward.id}
                                            >
                                              {ward.name}
                                            </SelectItem>
                                          ));
                                        }
                                        return (
                                          <SelectItem value="no-wards" disabled>
                                            No wards available for this
                                            department
                                          </SelectItem>
                                        );
                                      })()}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Each selected intervention must have an AHA, start date, end
                    date, and ward assigned.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-2">
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
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
