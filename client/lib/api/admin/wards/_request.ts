import { Ward, WardFormData, WardSummary } from "./_model";

// Dummy data for wards
const DUMMY_WARDS: Ward[] = [
  {
    id: "1",
    name: "Geriatrics Ward A",
    description: "Specialized ward for elderly patients with comprehensive care services",
    capacity: 24,
    currentOccupancy: 18,
    wardType: "Specialized",
    department: "Geriatrics",
    location: "Building A, Floor 2",
    contactNumber: "+1-555-0101",
    wardManager: "Dr. Sarah Johnson",
    status: "A",
    specializations: ["Geriatrics", "Dementia Care", "Palliative Care"],
    equipment: ["Cardiac Monitors", "Patient Lifts", "Wheelchairs", "Oxygen Supply"],
    notes: "Specialized care for patients over 65 with complex medical needs",
    createdAt: "2024-01-15T09:00:00Z",
    updatedAt: "2024-01-20T14:30:00Z",
  },
  {
    id: "2",
    name: "Stroke Unit",
    description: "Acute stroke care unit with specialized monitoring and rehabilitation",
    capacity: 16,
    currentOccupancy: 14,
    wardType: "Specialized",
    department: "Neurology",
    location: "Building B, Floor 3",
    contactNumber: "+1-555-0102",
    wardManager: "Dr. Michael Chen",
    status: "A",
    specializations: ["Stroke Care", "Rehabilitation"],
    equipment: ["Cardiac Monitors", "Ventilators", "IV Pumps", "Blood Pressure Monitors"],
    notes: "24/7 monitoring for acute stroke patients",
    createdAt: "2024-01-10T08:00:00Z",
    updatedAt: "2024-01-22T11:15:00Z",
  },
  {
    id: "3",
    name: "Orthopaedic Ward",
    description: "Post-surgical care for orthopedic patients",
    capacity: 20,
    currentOccupancy: 16,
    wardType: "Surgical",
    department: "Orthopedics",
    location: "Building A, Floor 3",
    contactNumber: "+1-555-0103",
    wardManager: "Dr. Emma Williams",
    status: "A",
    specializations: ["Orthopaedic", "Post-Surgical", "Trauma"],
    equipment: ["Patient Lifts", "Walking Aids", "Wheelchairs", "Pain Management Equipment"],
    notes: "Recovery ward for orthopedic surgery patients",
    createdAt: "2024-01-12T10:00:00Z",
    updatedAt: "2024-01-21T16:45:00Z",
  },
  {
    id: "4",
    name: "Cardiology Unit",
    description: "Cardiac monitoring and treatment unit",
    capacity: 18,
    currentOccupancy: 12,
    wardType: "Specialized",
    department: "Cardiology",
    location: "Building C, Floor 2",
    contactNumber: "+1-555-0104",
    wardManager: "Dr. James Rodriguez",
    status: "A",
    specializations: ["Cardiology"],
    equipment: ["Cardiac Monitors", "Defibrillators", "IV Pumps", "Pulse Oximeters"],
    notes: "Specialized cardiac care with telemetry monitoring",
    createdAt: "2024-01-08T07:30:00Z",
    updatedAt: "2024-01-19T13:20:00Z",
  },
  {
    id: "5",
    name: "Respiratory Ward",
    description: "Specialized care for respiratory conditions",
    capacity: 22,
    currentOccupancy: 19,
    wardType: "General Medical",
    department: "Internal Medicine",
    location: "Building B, Floor 2",
    contactNumber: "+1-555-0105",
    wardManager: "Dr. Lisa Thompson",
    status: "A",
    specializations: ["Respiratory"],
    equipment: ["Ventilators", "Oxygen Supply", "Suction Equipment", "Pulse Oximeters"],
    notes: "Comprehensive respiratory care and monitoring",
    createdAt: "2024-01-05T09:15:00Z",
    updatedAt: "2024-01-18T10:30:00Z",
  },
  {
    id: "6",
    name: "General Medical Ward B",
    description: "General medical care for various conditions",
    capacity: 30,
    currentOccupancy: 22,
    wardType: "General Medical",
    department: "Internal Medicine",
    location: "Building A, Floor 1",
    contactNumber: "+1-555-0106",
    wardManager: "Dr. Robert Davis",
    status: "A",
    specializations: ["General Medical"],
    equipment: ["Blood Pressure Monitors", "IV Pumps", "Wheelchairs", "Patient Lifts"],
    notes: "General medical care for adult patients",
    createdAt: "2024-01-03T08:45:00Z",
    updatedAt: "2024-01-17T15:00:00Z",
  },
  {
    id: "7",
    name: "ICU Ward",
    description: "Intensive care unit for critical patients",
    capacity: 12,
    currentOccupancy: 10,
    wardType: "ICU",
    department: "Critical Care",
    location: "Building C, Floor 4",
    contactNumber: "+1-555-0107",
    wardManager: "Dr. Amanda Foster",
    status: "A",
    specializations: ["Intensive Care"],
    equipment: ["Ventilators", "Cardiac Monitors", "Defibrillators", "IV Pumps", "Dialysis Equipment"],
    notes: "Critical care with 24/7 monitoring",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-16T12:00:00Z",
  },
  {
    id: "8",
    name: "Rehabilitation Unit",
    description: "Physical and occupational therapy ward",
    capacity: 15,
    currentOccupancy: 8,
    wardType: "Specialized",
    department: "Rehabilitation",
    location: "Building D, Floor 1",
    contactNumber: "+1-555-0108",
    wardManager: "Dr. Kevin Martinez",
    status: "M",
    specializations: ["Rehabilitation"],
    equipment: ["Walking Aids", "Patient Lifts", "Wheelchairs", "Exercise Equipment"],
    notes: "Currently under maintenance - reopening next week",
    createdAt: "2024-01-07T11:00:00Z",
    updatedAt: "2024-01-23T09:00:00Z",
  },
];

// Calculate summary data from dummy wards
const calculateSummary = (): WardSummary => {
  const activeWards = DUMMY_WARDS.filter(w => w.status === "A");
  const totalCapacity = DUMMY_WARDS.reduce((sum, ward) => sum + ward.capacity, 0);
  const totalOccupancy = DUMMY_WARDS.reduce((sum, ward) => sum + ward.currentOccupancy, 0);
  const availableBeds = totalCapacity - totalOccupancy;
  const occupancyRate = totalCapacity > 0 ? (totalOccupancy / totalCapacity) * 100 : 0;

  return {
    totalWards: DUMMY_WARDS.length,
    activeWards: activeWards.length,
    totalCapacity,
    totalOccupancy,
    occupancyRate,
    wardTypeBreakdown: {
      generalMedical: DUMMY_WARDS.filter(w => w.wardType === "General Medical").length,
      surgical: DUMMY_WARDS.filter(w => w.wardType === "Surgical").length,
      icu: DUMMY_WARDS.filter(w => w.wardType === "ICU").length,
      emergency: DUMMY_WARDS.filter(w => w.wardType === "Emergency").length,
      specialized: DUMMY_WARDS.filter(w => w.wardType === "Specialized").length,
    },
    statusBreakdown: {
      active: DUMMY_WARDS.filter(w => w.status === "A").length,
      maintenance: DUMMY_WARDS.filter(w => w.status === "M").length,
      closed: DUMMY_WARDS.filter(w => w.status === "C").length,
      inactive: DUMMY_WARDS.filter(w => w.status === "X").length,
    },
    wardsInMaintenance: DUMMY_WARDS.filter(w => w.status === "M").length,
    availableBeds,
  };
};

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Get all wards
export const getAll$ = async () => {
  await delay(500); // Simulate network delay
  return { data: DUMMY_WARDS };
};

// Get ward by ID
export const getById$ = async (id: string) => {
  await delay(300);
  const ward = DUMMY_WARDS.find(w => w.id === id);
  if (!ward) {
    throw new Error("Ward not found");
  }
  return { data: ward };
};

// Create new ward
export const create$ = async (data: WardFormData) => {
  await delay(800);
  const newWard: Ward = {
    id: (DUMMY_WARDS.length + 1).toString(),
    name: data.name,
    description: data.description,
    capacity: data.capacity,
    currentOccupancy: data.currentOccupancy,
    wardType: data.wardType,
    department: data.department,
    location: data.location,
    contactNumber: data.contactNumber,
    wardManager: data.wardManager,
    status: data.status,
    specializations: data.specializations,
    equipment: data.equipment,
    notes: data.notes || "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  DUMMY_WARDS.push(newWard);
  return { data: newWard };
};

// Update ward
export const update$ = async (id: string, data: WardFormData) => {
  await delay(600);
  const wardIndex = DUMMY_WARDS.findIndex(w => w.id === id);
  if (wardIndex === -1) {
    throw new Error("Ward not found");
  }
  
  const updatedWard: Ward = {
    ...DUMMY_WARDS[wardIndex],
    name: data.name,
    description: data.description,
    capacity: data.capacity,
    currentOccupancy: data.currentOccupancy,
    wardType: data.wardType,
    department: data.department,
    location: data.location,
    contactNumber: data.contactNumber,
    wardManager: data.wardManager,
    status: data.status,
    specializations: data.specializations,
    equipment: data.equipment,
    notes: data.notes || "",
    updatedAt: new Date().toISOString(),
  };
  
  DUMMY_WARDS[wardIndex] = updatedWard;
  return { data: updatedWard };
};

// Toggle ward status (activate/deactivate)
export const toggleActive$ = async (id: string) => {
  await delay(400);
  const wardIndex = DUMMY_WARDS.findIndex(w => w.id === id);
  if (wardIndex === -1) {
    throw new Error("Ward not found");
  }
  
  const ward = DUMMY_WARDS[wardIndex];
  const newStatus = ward.status === "X" ? "A" : "X";
  
  const updatedWard = {
    ...ward,
    status: newStatus as Ward["status"],
    updatedAt: new Date().toISOString(),
  };
  
  DUMMY_WARDS[wardIndex] = updatedWard;
  return { data: updatedWard };
};

// Get ward summary statistics
export const getSummary$ = async () => {
  await delay(300);
  return { data: calculateSummary() };
};

// Update ward occupancy
export const updateOccupancy$ = async (id: string, occupancy: number) => {
  await delay(400);
  const wardIndex = DUMMY_WARDS.findIndex(w => w.id === id);
  if (wardIndex === -1) {
    throw new Error("Ward not found");
  }
  
  const updatedWard = {
    ...DUMMY_WARDS[wardIndex],
    currentOccupancy: occupancy,
    updatedAt: new Date().toISOString(),
  };
  
  DUMMY_WARDS[wardIndex] = updatedWard;
  return { data: updatedWard };
};

// Get wards by department
export const getByDepartment$ = async (department: string) => {
  await delay(400);
  const wardsByDept = DUMMY_WARDS.filter(w => w.department === department);
  return { data: wardsByDept };
};

// Get available beds across all wards
export const getAvailableBeds$ = async () => {
  await delay(300);
  const availableBeds = DUMMY_WARDS.map(ward => ({
    wardId: ward.id,
    wardName: ward.name,
    availableBeds: ward.capacity - ward.currentOccupancy,
  }));
  return { data: availableBeds };
};
