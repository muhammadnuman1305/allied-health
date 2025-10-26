import { Ward, WardFormData, WardSummary, WARD_LOCATIONS } from "./_model";

// Dummy data for wards
const DUMMY_WARDS: Ward[] = [
  {
    id: "ward-1",
    name: "ICU Ward",
    code: "ICU",
    location: "ICU",
    bedCount: 12,
    defaultDepartment: "dept-1",
    defaultDepartmentName: "Physiotherapy Department",
    coverageDepartments: ["dept-1", "dept-3", "dept-4"],
    coverageDepartmentNames: ["Physiotherapy Department", "Speech Pathology Department", "Dietitians Department"],
    currentPatients: 8,
    openTasks: 5,
    overdueTasks: 1,
    status: "A",
    notes: "Critical care unit with specialized equipment",
    createdAt: "2024-01-15T09:00:00Z",
    updatedAt: "2024-01-20T14:30:00Z",
  },
  {
    id: "ward-2",
    name: "Surgery Ward",
    code: "SURG",
    location: "Surgery",
    bedCount: 24,
    defaultDepartment: "dept-1",
    defaultDepartmentName: "Physiotherapy Department",
    coverageDepartments: ["dept-1", "dept-2"],
    coverageDepartmentNames: ["Physiotherapy Department", "Occupational Therapy Department"],
    currentPatients: 18,
    openTasks: 8,
    overdueTasks: 2,
    status: "A",
    notes: "Post-surgical recovery ward",
    createdAt: "2024-01-10T08:00:00Z",
    updatedAt: "2024-01-22T11:15:00Z",
  },
  {
    id: "ward-3",
    name: "Rehabilitation Ward",
    code: "REHAB",
    location: "Rehabilitation",
    bedCount: 16,
    defaultDepartment: "dept-2",
    defaultDepartmentName: "Occupational Therapy Department",
    coverageDepartments: ["dept-1", "dept-2", "dept-3"],
    coverageDepartmentNames: ["Physiotherapy Department", "Occupational Therapy Department", "Speech Pathology Department"],
    currentPatients: 12,
    openTasks: 6,
    overdueTasks: 0,
    status: "A",
    notes: "Specialized rehabilitation facility",
    createdAt: "2024-01-12T10:00:00Z",
    updatedAt: "2024-01-21T16:45:00Z",
  },
];

// Calculate summary data from dummy wards
const calculateSummary = (): WardSummary => {
  const activeWards = DUMMY_WARDS.filter(w => w.status === "A");
  
  return {
    totalWards: DUMMY_WARDS.length,
    activeWards: activeWards.length,
    totalBeds: DUMMY_WARDS.reduce((sum, w) => sum + w.bedCount, 0),
    occupiedBeds: DUMMY_WARDS.reduce((sum, w) => sum + w.currentPatients, 0),
    statusBreakdown: {
      active: DUMMY_WARDS.filter(w => w.status === "A").length,
      inactive: DUMMY_WARDS.filter(w => w.status === "X").length,
    },
    totalOpenTasks: DUMMY_WARDS.reduce((sum, w) => sum + w.openTasks, 0),
    totalOverdueTasks: DUMMY_WARDS.reduce((sum, w) => sum + w.overdueTasks, 0),
  };
};

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Get all wards
export const getAll$ = async () => {
  await delay(500);
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
    id: `ward-${DUMMY_WARDS.length + 1}`,
    name: data.name,
    code: data.code,
    location: data.location,
    bedCount: data.bedCount,
    defaultDepartment: data.defaultDepartment,
    defaultDepartmentName: data.defaultDepartment ? "Department Name" : undefined,
    coverageDepartments: data.coverageDepartments,
    coverageDepartmentNames: data.coverageDepartments.map(() => "Department Name"),
    currentPatients: 0,
    openTasks: 0,
    overdueTasks: 0,
    status: data.status,
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
    code: data.code,
    location: data.location,
    bedCount: data.bedCount,
    defaultDepartment: data.defaultDepartment,
    defaultDepartmentName: data.defaultDepartment ? "Department Name" : undefined,
    coverageDepartments: data.coverageDepartments,
    coverageDepartmentNames: data.coverageDepartments.map(() => "Department Name"),
    status: data.status,
    notes: data.notes || "",
    updatedAt: new Date().toISOString(),
  };
  
  DUMMY_WARDS[wardIndex] = updatedWard;
  return { data: updatedWard };
};

// Delete ward
export const delete$ = async (id: string) => {
  await delay(400);
  const wardIndex = DUMMY_WARDS.findIndex(w => w.id === id);
  if (wardIndex === -1) {
    throw new Error("Ward not found");
  }
  
  DUMMY_WARDS.splice(wardIndex, 1);
  return { data: {} };
};

// Toggle ward active status
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

// Get wards by department coverage
export const getByDepartment$ = async (departmentId: string) => {
  await delay(400);
  const wardsByDepartment = DUMMY_WARDS.filter(w => w.coverageDepartments.includes(departmentId));
  return { data: wardsByDepartment };
};

// Update ward coverage departments
export const updateCoverage$ = async (id: string, departmentIds: string[]) => {
  await delay(600);
  const wardIndex = DUMMY_WARDS.findIndex(w => w.id === id);
  if (wardIndex === -1) {
    throw new Error("Ward not found");
  }
  
  const updatedWard = {
    ...DUMMY_WARDS[wardIndex],
    coverageDepartments: departmentIds,
    coverageDepartmentNames: departmentIds.map(() => "Department Name"),
    updatedAt: new Date().toISOString(),
  };
  
  DUMMY_WARDS[wardIndex] = updatedWard;
  return { data: updatedWard };
};

// Set default department for ward
export const setDefaultDepartment$ = async (id: string, departmentId: string) => {
  await delay(600);
  const wardIndex = DUMMY_WARDS.findIndex(w => w.id === id);
  if (wardIndex === -1) {
    throw new Error("Ward not found");
  }
  
  const updatedWard = {
    ...DUMMY_WARDS[wardIndex],
    defaultDepartment: departmentId,
    defaultDepartmentName: "Department Name",
    updatedAt: new Date().toISOString(),
  };
  
  DUMMY_WARDS[wardIndex] = updatedWard;
  return { data: updatedWard };
};