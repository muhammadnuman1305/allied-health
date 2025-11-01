"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { StatsCard } from "@/components/ui/stats-card";
import {
  Search,
  Filter,
  User,
  Calendar,
  Phone,
  Mail,
  Heart,
  Activity,
  Clock,
  Eye,
  MessageSquare,
  FileText,
  Plus,
  PencilLine,
  Trash2,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

// ===== Types =====
interface Task {
  id: string;
  title: string;
  status: "pending" | "in-progress" | "completed";
  dueDate: string; // yyyy-mm-dd
}

interface Referral {
  id: string;
  fromDepartment: string;
  toDepartment: string;
  reason: string;
  date: string; // yyyy-mm-dd
  status: "pending" | "accepted" | "completed" | "rejected";
  notes: string;
}

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: "male" | "female" | "other" | string;
  phone: string;
  email: string;
  address: string;
  primaryCondition: string;
  assignedTo: string;
  lastVisit: string; // yyyy-mm-dd
  nextAppointment: string; // yyyy-mm-dd
  status: "active" | "inactive" | "discharged" | string;
  department: string;
  referralHistory: Referral[];
  tasks: Task[];
  notes?: string;
}

// ===== Demo seed (you can remove in production) =====
const seedPatients: Patient[] = [
  {
    id: "P001",
    name: "John Smith",
    age: 45,
    gender: "male",
    phone: "+1 (555) 123-4567",
    email: "john.smith@email.com",
    address: "123 Main St, City, State 12345",
    primaryCondition: "Hypertension",
    assignedTo: "Dr. Sarah Johnson",
    lastVisit: "2024-01-10",
    nextAppointment: "2024-01-20",
    status: "active",
    department: "Cardiology",
    referralHistory: [
      {
        id: "R001",
        fromDepartment: "Primary Care",
        toDepartment: "Cardiology",
        reason: "Elevated blood pressure readings",
        date: "2024-01-05",
        status: "completed",
        notes: "Patient referred for cardiac evaluation",
      },
    ],
    tasks: [
      {
        id: "T001",
        title: "Blood pressure monitoring",
        status: "in-progress",
        dueDate: "2024-01-15",
      },
    ],
    notes: "Tolerating ACE inhibitor well.",
  },
  {
    id: "P002",
    name: "Maria Garcia",
    age: 32,
    gender: "female",
    phone: "+1 (555) 234-5678",
    email: "maria.garcia@email.com",
    address: "456 Oak Ave, City, State 12345",
    primaryCondition: "Type 2 Diabetes",
    assignedTo: "Dr. Michael Chen",
    lastVisit: "2024-01-08",
    nextAppointment: "2024-01-25",
    status: "active",
    department: "Endocrinology",
    referralHistory: [
      {
        id: "R002",
        fromDepartment: "Primary Care",
        toDepartment: "Endocrinology",
        reason: "Elevated blood glucose levels",
        date: "2024-01-02",
        status: "completed",
        notes: "Patient referred for diabetes management",
      },
    ],
    tasks: [
      {
        id: "T002",
        title: "Glucose monitoring",
        status: "completed",
        dueDate: "2024-01-12",
      },
    ],
  },
];

// ===== UI config =====
const statusConfig = {
  active: { label: "Active", className: "bg-green-100 text-green-800" },
  inactive: { label: "Inactive", className: "bg-gray-100 text-gray-800" },
  discharged: { label: "Discharged", className: "bg-red-100 text-red-800" },
} as const;

const referralStatusConfig = {
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
  accepted: { label: "Accepted", className: "bg-blue-100 text-blue-800" },
  completed: { label: "Completed", className: "bg-green-100 text-green-800" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-800" },
} as const;

// ===== Helpers =====
const STORAGE_KEY = "my-patients-v1";
const todayISO = () => new Date().toISOString().slice(0, 10);

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

// ===== Main Page =====
export default function MyPatientsPage() {
  const currentUser = "Dr. John Doe";
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Patient | null>(null);
  const [openView, setOpenView] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [tab, setTab] = useState("active");

  // Load & persist to localStorage for demo
  useEffect(() => {
    const saved =
      typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (saved) {
      try {
        const parsed: Patient[] = JSON.parse(saved);
        setAllPatients(parsed);
      } catch {
        setAllPatients(seedPatients);
      }
    } else {
      setAllPatients(seedPatients);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allPatients));
    }
  }, [allPatients]);

  // My patients only
  const myPatients = useMemo(
    () => allPatients.filter((p) => p.assignedTo === currentUser),
    [allPatients, currentUser]
  );

  const filtered = useMemo(() => {
    const list = myPatients.filter((p) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.primaryCondition.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      const matchesDept =
        departmentFilter === "all" || p.department === departmentFilter;
      return matchesSearch && matchesStatus && matchesDept;
    });

    if (tab === "active") return list.filter((p) => p.status === "active");
    if (tab === "inactive") return list.filter((p) => p.status === "inactive");
    if (tab === "discharged")
      return list.filter((p) => p.status === "discharged");
    return list;
  }, [myPatients, search, statusFilter, departmentFilter, tab]);

  const counts = useMemo(
    () => ({
      total: myPatients.length,
      active: myPatients.filter((p) => p.status === "active").length,
      inactive: myPatients.filter((p) => p.status === "inactive").length,
      discharged: myPatients.filter((p) => p.status === "discharged").length,
    }),
    [myPatients]
  );

  // Mutations
  const upsertPatient = (patient: Patient) => {
    setAllPatients((prev) => {
      const idx = prev.findIndex((p) => p.id === patient.id);
      if (idx === -1) return [...prev, patient];
      const copy = [...prev];
      copy[idx] = patient;
      return copy;
    });
  };

  const updateById = (id: string, patch: any) => {
    setAllPatients((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...patch } : p))
    );
  };

  const removeById = (id: string) => {
    setAllPatients((prev) => prev.filter((p) => p.id !== id));
  };

  // ===== Render =====
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Patients</h1>
          <p className="text-muted-foreground">
            Patients assigned to{" "}
            <span className="font-medium">{currentUser}</span>
          </p>
        </div>
      </div>

      {/* Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total" value={counts.total} icon={User} />
        <StatsCard title="Active" value={counts.active} icon={Heart} />
        <StatsCard title="Inactive" value={counts.inactive} icon={Clock} />
        <StatsCard
          title="Discharged"
          value={counts.discharged}
          icon={Activity}
        />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" /> Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-10"
                  placeholder="Search by name, ID, or condition..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="discharged">Discharged</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Label>Department</Label>
              <Select
                value={departmentFilter}
                onValueChange={setDepartmentFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="Cardiology">Cardiology</SelectItem>
                  <SelectItem value="Endocrinology">Endocrinology</SelectItem>
                  <SelectItem value="Physical Therapy">
                    Physical Therapy
                  </SelectItem>
                  <SelectItem value="Nutrition">Nutrition</SelectItem>
                  <SelectItem value="Primary Care">Primary Care</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4">
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="inactive">Inactive</TabsTrigger>
                <TabsTrigger value="discharged">Discharged</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
              <TabsContent value="active" />
              <TabsContent value="inactive" />
              <TabsContent value="discharged" />
              <TabsContent value="all" />
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <Card>
        <CardHeader>
          <CardTitle>Patients ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filtered.map((p) => {
              const sc = statusConfig[p.status as keyof typeof statusConfig];
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium">{p.name}</h3>
                      {sc && <Badge className={sc.className}>{sc.label}</Badge>}
                      <span className="text-sm text-muted-foreground">
                        ID: {p.id}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {p.primaryCondition}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {p.assignedTo}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Next: {p.nextAppointment || "—"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {p.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {p.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {p.referralHistory.length} referrals
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {p.tasks.length} tasks
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Dialog
                      open={openView && selected?.id === p.id}
                      onOpenChange={(open) => {
                        setOpenView(open);
                        if (!open) setSelected(null);
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelected(p)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Patient – {selected?.name}</DialogTitle>
                        </DialogHeader>
                        {selected && <PatientDetail patient={selected} />}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No patients match your filters.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ===== Forms & Detail Views =====
function CreateOrEditPatientForm({
  onSubmit,
  initial,
  submitLabel = "Save",
}: {
  onSubmit: (data: Partial<Patient>) => void;
  initial?: Patient;
  submitLabel?: string;
}) {
  const [formData, setFormData] = useState<Partial<Patient>>({
    name: initial?.name || "",
    age: initial?.age || 0,
    gender: (initial?.gender as any) || "other",
    phone: initial?.phone || "",
    email: initial?.email || "",
    address: initial?.address || "",
    primaryCondition: initial?.primaryCondition || "",
    department: initial?.department || "",
    nextAppointment: initial?.nextAppointment || "",
    status: (initial?.status as any) || "active",
    notes: initial?.notes || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Full Name</Label>
          <Input
            value={formData.name as string}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label>Age</Label>
          <Input
            type="number"
            value={formData.age as number}
            onChange={(e) =>
              setFormData({ ...formData, age: parseInt(e.target.value) || 0 })
            }
            required
          />
        </div>
        <div>
          <Label>Gender</Label>
          <Select
            value={formData.gender as string}
            onValueChange={(value) =>
              setFormData({ ...formData, gender: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Phone</Label>
          <Input
            value={formData.phone as string}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            required
          />
        </div>
        <div>
          <Label>Email</Label>
          <Input
            type="email"
            value={formData.email as string}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />
        </div>
        <div>
          <Label>Department</Label>
          <Select
            value={formData.department as string}
            onValueChange={(v) => setFormData({ ...formData, department: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Cardiology">Cardiology</SelectItem>
              <SelectItem value="Endocrinology">Endocrinology</SelectItem>
              <SelectItem value="Physical Therapy">Physical Therapy</SelectItem>
              <SelectItem value="Nutrition">Nutrition</SelectItem>
              <SelectItem value="Primary Care">Primary Care</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Primary Condition</Label>
          <Input
            value={formData.primaryCondition as string}
            onChange={(e) =>
              setFormData({ ...formData, primaryCondition: e.target.value })
            }
            required
          />
        </div>
        <div>
          <Label>Next Appointment</Label>
          <Input
            type="date"
            value={formData.nextAppointment as string}
            onChange={(e) =>
              setFormData({ ...formData, nextAppointment: e.target.value })
            }
          />
        </div>
      </div>
      <div>
        <Label>Address</Label>
        <Textarea
          value={formData.address as string}
          onChange={(e) =>
            setFormData({ ...formData, address: e.target.value })
          }
          required
        />
      </div>
      <div>
        <Label>Notes</Label>
        <Textarea
          value={formData.notes as string}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Add clinical notes or context..."
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>Status</Label>
          <Select
            value={(formData.status as string) || "active"}
            onValueChange={(v) => setFormData({ ...formData, status: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="discharged">Discharged</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
        {submitLabel}
      </Button>
    </form>
  );
}

function PatientDetail({ patient }: { patient: Patient }) {
  const sc = statusConfig[patient.status as keyof typeof statusConfig];

  return (
    <div className="space-y-6">
      {/* Basic */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Name" value={patient.name} />
            <Field label="Age" value={`${patient.age} years`} />
            <Field label="Gender" value={patient.gender} />
            <div>
              <Label className="text-sm font-medium">Status</Label>
              <div className="mt-1 flex items-center gap-2">
                {sc && <Badge className={sc.className}>{sc.label}</Badge>}
              </div>
            </div>
            <Field label="Phone" value={patient.phone} />
            <Field label="Email" value={patient.email} />
            <div className="col-span-2">
              <Label className="text-sm font-medium">Address</Label>
              <p className="text-sm">{patient.address}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medical */}
      <Card>
        <CardHeader>
          <CardTitle>Medical Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Primary Condition" value={patient.primaryCondition} />
            <Field label="Assigned To" value={patient.assignedTo} />
            <Field label="Department" value={patient.department} />
            <Field label="Last Visit" value={patient.lastVisit} />
            <Field
              label="Next Appointment"
              value={patient.nextAppointment || "—"}
            />
            <div className="col-span-2">
              <Label className="text-sm font-medium">Clinical Notes</Label>
              <p className="text-sm bg-muted p-3 rounded-md">
                {patient.notes || "No notes available"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referrals */}
      <Card>
        <CardHeader>
          <CardTitle>Referral History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {patient.referralHistory.length === 0 && (
              <p className="text-sm text-muted-foreground">No referrals yet.</p>
            )}

            {patient.referralHistory.map((r) => {
              const rc = referralStatusConfig[r.status];
              return (
                <div key={r.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {r.fromDepartment} → {r.toDepartment}
                      </span>
                      <Badge className={rc.className}>{rc.label}</Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {r.date}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {r.reason}
                  </p>
                  {r.notes && (
                    <p className="text-sm bg-muted p-2 rounded">{r.notes}</p>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mt-4 space-y-2">
            {patient.tasks.length === 0 && (
              <p className="text-sm text-muted-foreground">No tasks yet.</p>
            )}
            {patient.tasks.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between p-3 border rounded"
              >
                <div>
                  <p className="font-medium flex items-center gap-2">
                    {t.title}
                    {t.status === "completed" && (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Due: {t.dueDate}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{t.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Label className="text-sm font-medium">{label}</Label>
      <p className="text-sm">{value}</p>
    </div>
  );
}
