"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Filter, ArrowRight, FileText, User, Plus, CheckCircle2, XCircle, ThumbsUp, Clock } from "lucide-react";
import { toast } from "sonner";

// Types
interface PageProps {
  params?: Promise<{ [key: string]: string | string[] | undefined }>;
  searchParams?: Promise<any>;
}

type TaskStatus = "pending" | "in-progress" | "completed";
type ReferralStatus = "pending" | "accepted" | "completed" | "rejected";
type PatientStatus = "active" | "inactive" | "discharged";

interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  dueDate: string;
}

interface Referral {
  id: string;
  fromDepartment: string;
  toDepartment: string;
  reason: string;
  date: string;
  status: ReferralStatus;
  notes: string;
}

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  address: string;
  primaryCondition: string;
  assignedTo: string;
  lastVisit: string;
  nextAppointment: string;
  status: PatientStatus;
  department: string;
  referralHistory: Referral[];
  tasks: Task[];
  notes?: string;
}

interface ReferralRow extends Referral {
  patientId: string;
  patientName: string;
  assignedTo: string;
}

interface CreateReferralData {
  patientId: string;
  toDepartment: string;
  reason: string;
  date: string;
  notes?: string;
}

// Constants
const STORAGE_KEY = "hms-patients-referrals-v1";
const DEFAULT_DEPARTMENTS = ["Cardiology", "Endocrinology", "Physical Therapy", "Nutrition", "Primary Care"];

const REFERRAL_STATUS_CONFIG: Record<ReferralStatus, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" },
  accepted: { label: "Accepted", className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
  completed: { label: "Completed", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" },
};

// Utilities
const generateId = (prefix: string): string => `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
const getTodayISO = (): string => new Date().toISOString().slice(0, 10);

// Custom hook for localStorage with SSR safety
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<any>(initialValue);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        setStoredValue(Array.isArray(parsed) ? parsed : initialValue);
      }
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      setStoredValue(initialValue);
    }
  }, [key, initialValue]);

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      if (isClient && typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  };

  return [storedValue, setValue];
}

// Components
function StatCard({ title, value, Icon }: { title: string; value: number; Icon: any }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function CreateReferralForm({
  myPatients,
  departments,
  onSubmit,
  onClose,
}: {
  myPatients: Patient[];
  departments: string[];
  onSubmit: (data: CreateReferralData) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    patientId: "",
    toDepartment: "",
    reason: "",
    date: getTodayISO(),
    notes: "",
  });

  const handleSubmit = () => {
    if (!formData.patientId || !formData.toDepartment || !formData.reason) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    onSubmit(formData);
    onClose();
  };

  const updateField = (field: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (myPatients.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">No patients assigned to you yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Patient *</Label>
          <Select value={formData.patientId} onValueChange={updateField('patientId')}>
            <SelectTrigger>
              <SelectValue placeholder="Select patient" />
            </SelectTrigger>
            <SelectContent>
              {myPatients.map((patient) => (
                <SelectItem key={patient.id} value={patient.id}>
                  {patient.name} ({patient.id})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label>To Department *</Label>
          <Select value={formData.toDepartment} onValueChange={updateField('toDepartment')}>
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label>Reason *</Label>
          <Input 
            value={formData.reason} 
            onChange={(e) => updateField('reason')(e.target.value)}
            placeholder="e.g., Elevated glucose levels" 
          />
        </div>
        
        <div>
          <Label>Date</Label>
          <Input 
            type="date" 
            value={formData.date} 
            onChange={(e) => updateField('date')(e.target.value)}
          />
        </div>
      </div>
      
      <div>
        <Label>Notes</Label>
        <Textarea 
          value={formData.notes} 
          onChange={(e) => updateField('notes')(e.target.value)}
          placeholder="Optional notes" 
          rows={3}
        />
      </div>
      
      <div className="flex gap-2">
        <Button onClick={handleSubmit} className="flex-1">
          Create Referral
        </Button>
        <Button variant="outline" onClick={onClose} className="flex-1">
          Cancel
        </Button>
      </div>
    </div>
  );
}

function ReferralCard({ 
  referral, 
  onAccept, 
  onReject, 
  onComplete 
}: { 
  referral: ReferralRow;
  onAccept: () => void;
  onReject: () => void;
  onComplete: () => void;
}) {
  const statusConfig = REFERRAL_STATUS_CONFIG[referral.status];

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
          <div className="flex items-center gap-3">
            <Badge className={statusConfig.className}>
              {statusConfig.label}
            </Badge>
            <span className="text-sm text-muted-foreground">{referral.date}</span>
          </div>
          <div className="text-sm flex items-center gap-2">
            <span className="font-medium">{referral.patientName}</span>
            <span className="text-muted-foreground">({referral.patientId})</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm mb-3">
          <div>
            <Label className="text-xs font-medium">From</Label>
            <p className="text-foreground">{referral.fromDepartment}</p>
          </div>
          <div>
            <Label className="text-xs font-medium">To</Label>
            <p className="flex items-center gap-2 text-foreground">
              {referral.toDepartment} 
              <ArrowRight className="h-4 w-4" />
            </p>
          </div>
          <div>
            <Label className="text-xs font-medium">Assigned To</Label>
            <p className="text-foreground">{referral.assignedTo}</p>
          </div>
          <div>
            <Label className="text-xs font-medium">Reason</Label>
            <p className="truncate text-foreground" title={referral.reason}>
              {referral.reason}
            </p>
          </div>
        </div>

        {referral.notes && (
          <div className="mb-3">
            <Label className="text-xs font-medium">Notes</Label>
            <p className="text-sm bg-muted p-2 rounded mt-1">{referral.notes}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {referral.status === "pending" && (
            <>
              <Button size="sm" onClick={onAccept}>
                <ThumbsUp className="h-4 w-4 mr-1" /> Accept
              </Button>
              <Button size="sm" variant="destructive" onClick={onReject}>
                <XCircle className="h-4 w-4 mr-1" /> Reject
              </Button>
            </>
          )}
          {referral.status === "accepted" && (
            <Button size="sm" variant="secondary" onClick={onComplete}>
              <CheckCircle2 className="h-4 w-4 mr-1" /> Complete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Main Page Component
export default function ReferralsPage({ params, searchParams }: PageProps) {
  const [patients, setPatients] = useLocalStorage<Patient[]>(STORAGE_KEY, []);
  const [currentUser] = useState("Current User"); // In real app, get from auth context
  const [activeTab, setActiveTab] = useState<"incoming" | "outgoing" | "all">("incoming");
  const [filters, setFilters] = useState({
    status: "all" as ReferralStatus | "all",
    department: "all",
    search: "",
    dateFrom: "",
    dateTo: "",
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Derived data
  const myPatients = useMemo(
    () => patients.filter(p => p.assignedTo === currentUser),
    [patients, currentUser]
  );

  const allReferrals = useMemo<ReferralRow[]>(() => {
    if (isLoading) return [];
    
    const referrals: ReferralRow[] = [];
    
    patients.forEach(patient => {
      patient.referralHistory?.forEach(referral => {
        referrals.push({
          ...referral,
          patientId: patient.id,
          patientName: patient.name,
          assignedTo: patient.assignedTo,
        });
      });
    });
    
    return referrals.sort((a, b) => b.date.localeCompare(a.date));
  }, [patients, isLoading]);

  const categorizedReferrals = useMemo(() => {
    const myReferrals = allReferrals.filter(r => 
      patients.find(p => p.id === r.patientId)?.assignedTo === currentUser
    );
    
    return {
      incoming: myReferrals,
      outgoing: myReferrals,
      all: allReferrals,
    };
  }, [allReferrals, patients, currentUser]);

  const filteredReferrals = useMemo(() => {
    let referrals = categorizedReferrals[activeTab];

    if (filters.status !== "all") {
      referrals = referrals.filter(r => r.status === filters.status);
    }
    
    if (filters.department !== "all") {
      referrals = referrals.filter(r => 
        r.toDepartment === filters.department || r.fromDepartment === filters.department
      );
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      referrals = referrals.filter(r =>
        r.patientName.toLowerCase().includes(searchLower) ||
        r.patientId.toLowerCase().includes(searchLower) ||
        r.reason.toLowerCase().includes(searchLower)
      );
    }
    
    if (filters.dateFrom) {
      referrals = referrals.filter(r => r.date >= filters.dateFrom);
    }
    
    if (filters.dateTo) {
      referrals = referrals.filter(r => r.date <= filters.dateTo);
    }

    return referrals;
  }, [categorizedReferrals, activeTab, filters]);

  const stats = useMemo(() => ({
    total: allReferrals.length,
    incoming: categorizedReferrals.incoming.length,
    outgoing: categorizedReferrals.outgoing.length,
    pending: allReferrals.filter(r => r.status === "pending").length,
  }), [allReferrals, categorizedReferrals]);

  const departments = useMemo(() => {
    const deptSet = new Set(DEFAULT_DEPARTMENTS);
    patients.forEach(p => p.department && deptSet.add(p.department));
    return Array.from(deptSet).sort();
  }, [patients]);

  // Actions
  const updateReferralStatus = (referral: ReferralRow, status: ReferralStatus) => {
    const updatedPatients = patients.map(patient => {
      if (patient.id !== referral.patientId) return patient;
      
      return {
        ...patient,
        referralHistory: patient.referralHistory.map(r =>
          r.id === referral.id ? { ...r, status } : r
        ),
      };
    });
    
    setPatients(updatedPatients);
  };

  const createReferral = (data: CreateReferralData) => {
    const patient = patients.find(p => p.id === data.patientId);
    if (!patient) {
      toast.error("Patient not found");
      return;
    }

    const newReferral: Referral = {
      id: generateId("REF"),
      fromDepartment: patient.department || "Unknown",
      toDepartment: data.toDepartment,
      reason: data.reason,
      date: data.date,
      status: "pending",
      notes: data.notes || "",
    };

    const updatedPatients = patients.map(p =>
      p.id === data.patientId
        ? { ...p, referralHistory: [newReferral, ...p.referralHistory] }
        : p
    );

    setPatients(updatedPatients);
    toast.success("Referral created successfully");
  };

  const updateFilter = (key: string) => (value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading referrals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Referrals</h1>
          <p className="text-muted-foreground">
            Track and manage patient referrals across departments
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Referral
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Referral</DialogTitle>
            </DialogHeader>
            <CreateReferralForm
              myPatients={myPatients}
              departments={departments}
              onSubmit={createReferral}
              onClose={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Referrals" value={stats.total} Icon={FileText} />
        <StatCard title="Incoming" value={stats.incoming} Icon={ArrowRight} />
        <StatCard title="Outgoing" value={stats.outgoing} Icon={User} />
        <StatCard title="Pending Action" value={stats.pending} Icon={Clock} />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-10"
                    placeholder="Patient, ID, reason..."
                    value={filters.search}
                    onChange={(e) => updateFilter('search')(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="w-full lg:w-48">
                <Label>Status</Label>
                <Select value={filters.status} onValueChange={updateFilter('status')}>
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full lg:w-56">
                <Label>Department</Label>
                <Select value={filters.department} onValueChange={updateFilter('department')}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full lg:w-40">
                <Label>From Date</Label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => updateFilter('dateFrom')(e.target.value)}
                />
              </div>
              
              <div className="w-full lg:w-40">
                <Label>To Date</Label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => updateFilter('dateTo')(e.target.value)}
                />
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
              <TabsList>
                <TabsTrigger value="incoming">Incoming ({categorizedReferrals.incoming.length})</TabsTrigger>
                <TabsTrigger value="outgoing">Outgoing ({categorizedReferrals.outgoing.length})</TabsTrigger>
                <TabsTrigger value="all">All ({allReferrals.length})</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Referrals List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Referrals ({filteredReferrals.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredReferrals.map((referral) => (
              <ReferralCard
                key={`${referral.id}-${referral.patientId}`}
                referral={referral}
                onAccept={() => {
                  updateReferralStatus(referral, "accepted");
                  toast.success("Referral accepted successfully");
                }}
                onReject={() => {
                  updateReferralStatus(referral, "rejected");
                  toast.error("Referral rejected");
                }}
                onComplete={() => {
                  updateReferralStatus(referral, "completed");
                  toast.success("Referral marked as completed");
                }}
              />
            ))}
            
            {filteredReferrals.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No referrals found</h3>
                <p className="text-muted-foreground">
                  {filters.search || filters.status !== "all" || filters.department !== "all" 
                    ? "Try adjusting your filters to see more results."
                    : "Create your first referral to get started."}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
