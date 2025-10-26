import { Department, DepartmentFormData, DepartmentSummary, SERVICE_LINES, INTERVENTIONS_BY_SERVICE_LINE, getDepartmentName } from "./_model";

// Dummy data for departments
const DUMMY_DEPARTMENTS: Department[] = [
  {
    id: "1",
    name: "Physiotherapy Department",
    code: "PT",
    description: "Comprehensive physiotherapy services focusing on mobility, strength, and functional rehabilitation",
    serviceLine: "Physiotherapy",
    headAHP: "user-1",
    headAHPName: "Dr. Sarah Mitchell",
    status: "A",
    defaultTaskPriority: "Medium",
    coverageWards: ["ward-1", "ward-2"],
    coverageWardNames: ["ICU", "Surgery Ward"],
    activeAHPs: 8,
    activeAHAs: 12,
    openTasks: 15,
    overdueTasks: 3,
    incomingReferralsToday: 5,
    contactNumber: "+1-555-0201",
    email: "physio@alliedhealth.com",
    notes: "Fully equipped with modern rehabilitation equipment",
    createdAt: "2024-01-15T09:00:00Z",
    updatedAt: "2024-01-20T14:30:00Z",
  },
  {
    id: "2",
    name: "Occupational Therapy Department",
    code: "OT",
    description: "Specialized occupational therapy services for functional independence and cognitive rehabilitation",
    serviceLine: "Occupational Therapy",
    headAHP: "user-2",
    headAHPName: "Ms. Jennifer Thompson",
    status: "A",
    defaultTaskPriority: "Medium",
    coverageWards: ["ward-2", "ward-3"],
    coverageWardNames: ["Surgery Ward", "Rehabilitation Ward"],
    activeAHPs: 6,
    activeAHAs: 10,
    openTasks: 12,
    overdueTasks: 2,
    incomingReferralsToday: 3,
    contactNumber: "+1-555-0202",
    email: "ot@alliedhealth.com",
    notes: "Focus on activities of daily living and cognitive rehabilitation",
    createdAt: "2024-01-10T08:00:00Z",
    updatedAt: "2024-01-22T11:15:00Z",
  },
  {
    id: "3",
    name: "Speech Pathology Department",
    code: "SP",
    description: "Speech therapy services for communication, swallowing, and language disorders",
    serviceLine: "Speech Therapy",
    headAHP: "user-3",
    headAHPName: "Dr. Michael Rodriguez",
    status: "A",
    defaultTaskPriority: "High",
    coverageWards: ["ward-1", "ward-3"],
    coverageWardNames: ["ICU", "Rehabilitation Ward"],
    activeAHPs: 4,
    activeAHAs: 8,
    openTasks: 8,
    overdueTasks: 1,
    incomingReferralsToday: 2,
    contactNumber: "+1-555-0203",
    email: "speech@alliedhealth.com",
    notes: "Specialized in swallowing assessments and communication disorders",
    createdAt: "2024-01-12T10:00:00Z",
    updatedAt: "2024-01-21T16:45:00Z",
  },
  {
    id: "4",
    name: "Dietitians Department",
    code: "DT",
    description: "Clinical nutrition services and dietary counseling for optimal patient outcomes",
    serviceLine: "Dietetics",
    headAHP: "user-4",
    headAHPName: "Ms. Lisa Chen",
    status: "A",
    defaultTaskPriority: "Low",
    coverageWards: ["ward-1", "ward-2", "ward-3"],
    coverageWardNames: ["ICU", "Surgery Ward", "Rehabilitation Ward"],
    activeAHPs: 3,
    activeAHAs: 6,
    openTasks: 6,
    overdueTasks: 0,
    incomingReferralsToday: 4,
    contactNumber: "+1-555-0204",
    email: "dietetics@alliedhealth.com",
    notes: "Comprehensive nutritional care and education services",
    createdAt: "2024-01-08T07:30:00Z",
    updatedAt: "2024-01-19T13:20:00Z",
  },
];

// Calculate summary data from dummy departments
const calculateSummary = (): DepartmentSummary => {
  const activeDepartments = DUMMY_DEPARTMENTS.filter(d => d.status === "A");
  
  return {
    totalDepartments: DUMMY_DEPARTMENTS.length,
    activeDepartments: activeDepartments.length,
    serviceLineBreakdown: {
      physiotherapy: DUMMY_DEPARTMENTS.filter(d => d.serviceLine === "Physiotherapy").length,
      occupationalTherapy: DUMMY_DEPARTMENTS.filter(d => d.serviceLine === "Occupational Therapy").length,
      speechTherapy: DUMMY_DEPARTMENTS.filter(d => d.serviceLine === "Speech Therapy").length,
      dietetics: DUMMY_DEPARTMENTS.filter(d => d.serviceLine === "Dietetics").length,
    },
    statusBreakdown: {
      active: DUMMY_DEPARTMENTS.filter(d => d.status === "A").length,
      inactive: DUMMY_DEPARTMENTS.filter(d => d.status === "X").length,
    },
    totalOpenTasks: DUMMY_DEPARTMENTS.reduce((sum, d) => sum + d.openTasks, 0),
    totalOverdueTasks: DUMMY_DEPARTMENTS.reduce((sum, d) => sum + d.overdueTasks, 0),
    totalIncomingReferralsToday: DUMMY_DEPARTMENTS.reduce((sum, d) => sum + d.incomingReferralsToday, 0),
  };
};

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Get all departments
export const getAll$ = async () => {
  await delay(500); // Simulate network delay
  return { data: DUMMY_DEPARTMENTS };
};

// Get department by ID
export const getById$ = async (id: string) => {
  await delay(300);
  const department = DUMMY_DEPARTMENTS.find(d => d.id === id);
  if (!department) {
    throw new Error("Department not found");
  }
  return { data: department };
};

// Create new department
export const create$ = async (data: DepartmentFormData) => {
  await delay(800);
  const newDepartment: Department = {
    id: (DUMMY_DEPARTMENTS.length + 1).toString(),
    name: data.name,
    code: data.code,
    description: data.description,
    serviceLine: data.serviceLine,
    headAHP: data.headAHP,
    status: data.status,
    defaultTaskPriority: data.defaultTaskPriority,
    coverageWards: data.coverageWards,
    activeAHPs: 0,
    activeAHAs: 0,
    openTasks: 0,
    overdueTasks: 0,
    incomingReferralsToday: 0,
    contactNumber: data.contactNumber,
    email: data.email,
    notes: data.notes || "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  DUMMY_DEPARTMENTS.push(newDepartment);
  return { data: newDepartment };
};

// Update department
export const update$ = async (id: string, data: DepartmentFormData) => {
  await delay(600);
  const departmentIndex = DUMMY_DEPARTMENTS.findIndex(d => d.id === id);
  if (departmentIndex === -1) {
    throw new Error("Department not found");
  }
  
  const updatedDepartment: Department = {
    ...DUMMY_DEPARTMENTS[departmentIndex],
    name: data.name,
    code: data.code,
    description: data.description,
    serviceLine: data.serviceLine,
    headAHP: data.headAHP,
    status: data.status,
    defaultTaskPriority: data.defaultTaskPriority,
    coverageWards: data.coverageWards,
    contactNumber: data.contactNumber,
    email: data.email,
    notes: data.notes || "",
    updatedAt: new Date().toISOString(),
  };
  
  DUMMY_DEPARTMENTS[departmentIndex] = updatedDepartment;
  return { data: updatedDepartment };
};

// Toggle department status (activate/deactivate)
export const toggleActive$ = async (id: string) => {
  await delay(400);
  const departmentIndex = DUMMY_DEPARTMENTS.findIndex(d => d.id === id);
  if (departmentIndex === -1) {
    throw new Error("Department not found");
  }
  
  const department = DUMMY_DEPARTMENTS[departmentIndex];
  const newStatus = department.status === "X" ? "A" : "X";
  
  const updatedDepartment = {
    ...department,
    status: newStatus as Department["status"],
    updatedAt: new Date().toISOString(),
  };
  
  DUMMY_DEPARTMENTS[departmentIndex] = updatedDepartment;
  return { data: updatedDepartment };
};

// Get department summary statistics
export const getSummary$ = async () => {
  await delay(300);
  return { data: calculateSummary() };
};

// Get departments by service line
export const getByServiceLine$ = async (serviceLine: string) => {
  await delay(400);
  const departmentsByServiceLine = DUMMY_DEPARTMENTS.filter(d => d.serviceLine === serviceLine);
  return { data: departmentsByServiceLine };
};

// Get available interventions for a service line
export const getInterventionsForServiceLine$ = async (serviceLine: string) => {
  await delay(200);
  const interventions = INTERVENTIONS_BY_SERVICE_LINE[serviceLine as keyof typeof INTERVENTIONS_BY_SERVICE_LINE] || [];
  return { data: interventions };
};
