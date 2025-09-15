"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { 
  Search, 
  Filter, 
  User, 
  Calendar,
  Phone,
  Mail,
  MapPin,
  Heart,
  Activity,
  Clock,
  ArrowRight,
  Eye,
  MessageSquare,
  FileText,
  Plus
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

// Patient interface
interface Patient {
  id: string;
  name: string;
  age: number;
  // gender: "male" | "female" | "other";
  gender: string;
  phone: string;
  email: string;
  address: string;
  primaryCondition: string;
  assignedTo: string;
  lastVisit: string;
  nextAppointment: string;
  // status: "active" | "inactive" | "discharged";
  status: string;
  department: string;
  referralHistory: Referral[];
  tasks: Task[];
}

// Referral interface
interface Referral {
  id: string;
  fromDepartment: string;
  toDepartment: string;
  reason: string;
  date: string;
  status: "pending" | "accepted" | "completed" | "rejected";
  notes: string;
}

// Task interface (simplified)
interface Task {
  id: string;
  title: string;
  status: string;
  dueDate: string;
}

// Mock data
const mockPatients: Patient[] = [
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
        notes: "Patient referred for cardiac evaluation"
      }
    ],
    tasks: [
      {
        id: "T001",
        title: "Blood pressure monitoring",
        status: "in-progress",
        dueDate: "2024-01-15"
      }
    ]
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
        notes: "Patient referred for diabetes management"
      }
    ],
    tasks: [
      {
        id: "T002",
        title: "Glucose monitoring",
        status: "completed",
        dueDate: "2024-01-12"
      }
    ]
  },
  {
    id: "P003",
    name: "Robert Wilson",
    age: 58,
    gender: "male",
    phone: "+1 (555) 345-6789",
    email: "robert.wilson@email.com",
    address: "789 Pine Rd, City, State 12345",
    primaryCondition: "Post-surgery rehabilitation",
    assignedTo: "Dr. Emily Davis",
    lastVisit: "2024-01-05",
    nextAppointment: "2024-01-18",
    status: "active",
    department: "Physical Therapy",
    referralHistory: [
      {
        id: "R003",
        fromDepartment: "Orthopedics",
        toDepartment: "Physical Therapy",
        reason: "Post-knee surgery rehabilitation",
        date: "2023-12-20",
        status: "completed",
        notes: "Patient referred for physical therapy after knee surgery"
      }
    ],
    tasks: [
      {
        id: "T003",
        title: "Physical therapy session",
        status: "completed",
        dueDate: "2024-01-10"
      }
    ]
  },
  {
    id: "P004",
    name: "Lisa Brown",
    age: 28,
    gender: "female",
    phone: "+1 (555) 456-7890",
    email: "lisa.brown@email.com",
    address: "321 Elm St, City, State 12345",
    primaryCondition: "Weight management",
    assignedTo: "Dr. David Miller",
    lastVisit: "2024-01-11",
    nextAppointment: "2024-01-30",
    status: "active",
    department: "Nutrition",
    referralHistory: [
      {
        id: "R004",
        fromDepartment: "Primary Care",
        toDepartment: "Nutrition",
        reason: "Weight management consultation",
        date: "2024-01-08",
        status: "accepted",
        notes: "Patient referred for nutritional counseling"
      }
    ],
    tasks: [
      {
        id: "T004",
        title: "Nutrition consultation",
        status: "pending",
        dueDate: "2024-01-18"
      }
    ]
  }
];

const statusConfig = {
  active: { label: "Active", color: "bg-green-100 text-green-800" },
  inactive: { label: "Inactive", color: "bg-gray-100 text-gray-800" },
  discharged: { label: "Discharged", color: "bg-red-100 text-red-800" }
};

const referralStatusConfig = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  accepted: { label: "Accepted", color: "bg-blue-100 text-blue-800" },
  completed: { label: "Completed", color: "bg-green-100 text-green-800" },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-800" }
};

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Filter patients based on search and filters
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.primaryCondition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || patient.status === statusFilter;
    const matchesDepartment = departmentFilter === "all" || patient.department === departmentFilter;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  // Get patient counts
  const patientCounts = {
    total: patients.length,
    active: patients.filter(p => p.status === "active").length,
    inactive: patients.filter(p => p.status === "inactive").length,
    discharged: patients.filter(p => p.status === "discharged").length,
  };

  const handleCreatePatient = (patientData: Partial<Patient>) => {
    const newPatient: Patient = {
      id: `P${Date.now()}`,
      name: patientData.name || "",
      age: patientData.age || 0,
      gender: patientData.gender || "other",
      phone: patientData.phone || "",
      email: patientData.email || "",
      address: patientData.address || "",
      primaryCondition: patientData.primaryCondition || "",
      assignedTo: patientData.assignedTo || "Current User",
      lastVisit: new Date().toISOString().split('T')[0],
      nextAppointment: patientData.nextAppointment || "",
      status: "active",
      department: patientData.department || "",
      referralHistory: [],
      tasks: []
    };
    setPatients([...patients, newPatient]);
    setIsCreateDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Patient Management</h1>
          <p className="text-muted-foreground">View and manage your assigned patients</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Patient</DialogTitle>
            </DialogHeader>
            <CreatePatientForm onSubmit={handleCreatePatient} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Patient Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patientCounts.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patientCounts.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Patients</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patientCounts.inactive}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Discharged</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patientCounts.discharged}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search patients by name, ID, or condition..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Label htmlFor="status-filter">Status</Label>
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
              <Label htmlFor="department-filter">Department</Label>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="Cardiology">Cardiology</SelectItem>
                  <SelectItem value="Endocrinology">Endocrinology</SelectItem>
                  <SelectItem value="Physical Therapy">Physical Therapy</SelectItem>
                  <SelectItem value="Nutrition">Nutrition</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patient List */}
      <Card>
        <CardHeader>
          <CardTitle>Patients ({filteredPatients.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPatients.map((patient) => {
              const status = statusConfig[patient.status as keyof typeof statusConfig];
              
              return (
                <div key={patient.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium">{patient.name}</h3>
                      <Badge className={status.color}>
                        {status.label}
                      </Badge>
                      <span className="text-sm text-muted-foreground">ID: {patient.id}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{patient.primaryCondition}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {patient.assignedTo}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Next: {patient.nextAppointment}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {patient.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {patient.referralHistory.length} referrals
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {patient.tasks.length} tasks
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedPatient(patient)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Patient History - {selectedPatient?.name}</DialogTitle>
                        </DialogHeader>
                        {selectedPatient && <PatientHistoryView patient={selectedPatient} />}
                      </DialogContent>
                    </Dialog>
                    
                    <Button variant="ghost" size="sm">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                    
                    <Button variant="ghost" size="sm">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Create Patient Form Component
function CreatePatientForm({ onSubmit }: { onSubmit: (data: Partial<Patient>) => void }) {
  const [formData, setFormData] = useState({
    name: "",
    age: 0,
    gender: "other" as const,
    phone: "",
    email: "",
    address: "",
    primaryCondition: "",
    assignedTo: "",
    nextAppointment: "",
    department: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            type="number"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="gender">Gender</Label>
          <Select 
            value={formData.gender} 
            onValueChange={(value: any) => setFormData({ ...formData, gender: value })}
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
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="primaryCondition">Primary Condition</Label>
          <Input
            id="primaryCondition"
            value={formData.primaryCondition}
            onChange={(e) => setFormData({ ...formData, primaryCondition: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="department">Department</Label>
          <Select 
            value={formData.department} 
            onValueChange={(value) => setFormData({ ...formData, department: value })}
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
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="assignedTo">Assign To</Label>
          <Input
            id="assignedTo"
            value={formData.assignedTo}
            onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="nextAppointment">Next Appointment</Label>
          <Input
            id="nextAppointment"
            type="date"
            value={formData.nextAppointment}
            onChange={(e) => setFormData({ ...formData, nextAppointment: e.target.value })}
          />
        </div>
      </div>
      
      <Button type="submit" className="w-full">Add Patient</Button>
    </form>
  );
}

// Patient History View Component
function PatientHistoryView({ patient }: { patient: Patient }) {
  const status = statusConfig[patient.status as keyof typeof statusConfig];

  return (
    <div className="space-y-6">
      {/* Patient Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Name</Label>
              <p className="text-sm">{patient.name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Age</Label>
              <p className="text-sm">{patient.age} years old</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Gender</Label>
              <p className="text-sm capitalize">{patient.gender}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Status</Label>
              <Badge className={status.color}>
                {status.label}
              </Badge>
            </div>
            <div>
              <Label className="text-sm font-medium">Phone</Label>
              <p className="text-sm">{patient.phone}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Email</Label>
              <p className="text-sm">{patient.email}</p>
            </div>
            <div className="col-span-2">
              <Label className="text-sm font-medium">Address</Label>
              <p className="text-sm">{patient.address}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medical Information */}
      <Card>
        <CardHeader>
          <CardTitle>Medical Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Primary Condition</Label>
              <p className="text-sm">{patient.primaryCondition}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Assigned To</Label>
              <p className="text-sm">{patient.assignedTo}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Department</Label>
              <p className="text-sm">{patient.department}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Last Visit</Label>
              <p className="text-sm">{patient.lastVisit}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Next Appointment</Label>
              <p className="text-sm">{patient.nextAppointment}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referral History */}
      <Card>
        <CardHeader>
          <CardTitle>Referral History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {patient.referralHistory.map((referral) => {
              const referralStatus = referralStatusConfig[referral.status];
              
              return (
                <div key={referral.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{referral.fromDepartment} → {referral.toDepartment}</span>
                      <Badge className={referralStatus.color}>
                        {referralStatus.label}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">{referral.date}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{referral.reason}</p>
                  {referral.notes && (
                    <p className="text-sm bg-muted p-2 rounded">{referral.notes}</p>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Current Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Current Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {patient.tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">{task.title}</p>
                  <p className="text-sm text-muted-foreground">Due: {task.dueDate}</p>
                </div>
                <Badge variant="outline">{task.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

