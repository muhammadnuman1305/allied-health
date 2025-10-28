import { Task, TaskFormData, TaskSummary } from "./_model";

// Mock data for development
const MOCK_TASKS: Task[] = [
  {
    id: "task-001",
    patientId: "1",
    patientName: "John Smith",
    patientMrn: "MRN001234",
    taskType: "Assessment",
    title: "Initial Mobility Assessment",
    clinicalInstructions: "Complete initial mobility assessment including gait analysis and transfer capabilities. Focus on fall risk evaluation.",
    priority: "High",
    dueDate: "2024-01-20",
    dueTime: "10:00",
    assignedToDepartment: "Physiotherapy",
    assignedToStaff: "user-001",
    assignedToStaffName: "Dr. Sarah Wilson",
    subTasks: [
      { id: "1", name: "Gait analysis and documentation", assignedToStaff: "user-001" },
      { id: "2", name: "Transfer assessment (bed to chair)", assignedToStaff: "user-002" },
      { id: "3", name: "Balance testing and fall risk evaluation", assignedToStaff: "user-001" }
    ],
    status: "Assigned",
    linkedReferral: true,
    referralFromDepartment: "General Medical",
    referralToDepartment: "Physiotherapy",
    createdAt: "2024-01-18T09:00:00Z",
    updatedAt: "2024-01-18T09:00:00Z",
    createdBy: "admin-001"
  },
  {
    id: "task-002",
    patientId: "2",
    patientName: "Mary Johnson",
    patientMrn: "MRN001235",
    taskType: "Treatment Session",
    title: "Speech Therapy - Aphasia Treatment",
    clinicalInstructions: "Continue expressive aphasia treatment. Focus on naming exercises and sentence construction. Monitor frustration levels.",
    priority: "High",
    dueDate: "2024-01-19",
    dueTime: "14:00",
    assignedToDepartment: "Speech Therapy",
    assignedToStaff: "user-002",
    assignedToStaffName: "Emma Thompson",
    subTasks: [
      { id: "1", name: "Expressive language assessment", assignedToStaff: "user-002" },
      { id: "2", name: "Naming exercises and word retrieval", assignedToStaff: "user-002" },
      { id: "3", name: "Sentence construction practice", assignedToStaff: "user-003" }
    ],
    status: "In Progress",
    feedbackType: "Additional support needed",
    feedbackNotes: "Patient showing good progress but requires family involvement for home practice.",
    createdAt: "2024-01-17T10:30:00Z",
    updatedAt: "2024-01-19T09:15:00Z",
    createdBy: "admin-001"
  },
  {
    id: "task-003",
    patientId: "3",
    patientName: "Robert Davis",
    patientMrn: "MRN001236",
    taskType: "Progress Review",
    title: "Post-Op Hip Fracture Review",
    clinicalInstructions: "Review progress post hip fracture surgery. Assess weight-bearing tolerance and pain levels. Update mobilization plan.",
    priority: "Medium",
    dueDate: "2024-01-21",
    dueTime: "11:30",
    assignedToDepartment: "Physiotherapy",
    status: "Not Assigned",
    createdAt: "2024-01-18T14:20:00Z",
    updatedAt: "2024-01-18T14:20:00Z",
    createdBy: "admin-001"
  },
  {
    id: "task-004",
    patientId: "4",
    patientName: "Elizabeth Wilson",
    patientMrn: "MRN001237",
    taskType: "Follow-up",
    title: "Nutrition Follow-up Assessment",
    clinicalInstructions: "Follow-up assessment of nutritional status. Check weight, review dietary intake, and assess hydration.",
    priority: "Low",
    dueDate: "2024-01-16",
    dueTime: "15:00",
    assignedToDepartment: "Dietetics",
    assignedToStaff: "user-003",
    assignedToStaffName: "Lisa Chen",
    status: "Completed",
    feedbackType: "Completed as prescribed",
    feedbackNotes: "Patient has achieved target weight and demonstrates good understanding of dietary plan.",
    outcomeNotes: "Nutritional goals met. Patient ready for discharge. Provided written dietary guidelines for home.",
    completedDate: "2024-01-16",
    completedBy: "user-003",
    createdAt: "2024-01-13T08:00:00Z",
    updatedAt: "2024-01-16T15:45:00Z",
    createdBy: "admin-001"
  },
  {
    id: "task-005",
    patientId: "5",
    patientName: "William Anderson",
    patientMrn: "MRN001238",
    taskType: "Treatment Session",
    title: "Cardiac Rehabilitation Session",
    clinicalInstructions: "Continue cardiac rehabilitation program. Monitor vitals throughout. Focus on gentle strengthening and breathing exercises.",
    priority: "High",
    dueDate: "2024-01-19",
    dueTime: "09:00",
    assignedToDepartment: "Physiotherapy",
    assignedToStaff: "user-001",
    assignedToStaffName: "Dr. Sarah Wilson",
    status: "In Progress",
    linkedReferral: true,
    referralFromDepartment: "Cardiology",
    referralToDepartment: "Physiotherapy",
    feedbackType: "Needs review",
    feedbackNotes: "Patient reports increased fatigue. May need to adjust exercise intensity.",
    createdAt: "2024-01-18T07:30:00Z",
    updatedAt: "2024-01-19T09:20:00Z",
    createdBy: "admin-001"
  },
  {
    id: "task-006",
    patientId: "1",
    patientName: "John Smith",
    patientMrn: "MRN001234",
    taskType: "Equipment Assessment",
    title: "Walking Aid Assessment",
    clinicalInstructions: "Assess patient for appropriate walking aid. Consider frame vs stick. Ensure proper height and training provided.",
    priority: "Medium",
    dueDate: "2024-01-22",
    dueTime: "10:30",
    assignedToDepartment: "Occupational Therapy",
    status: "Not Assigned",
    createdAt: "2024-01-18T11:00:00Z",
    updatedAt: "2024-01-18T11:00:00Z",
    createdBy: "admin-001"
  },
  {
    id: "task-007",
    patientId: "2",
    patientName: "Mary Johnson",
    patientMrn: "MRN001235",
    taskType: "Family Education",
    title: "Family Communication Training",
    clinicalInstructions: "Provide family education on supporting patient with aphasia. Demonstrate effective communication strategies.",
    priority: "Medium",
    dueDate: "2024-01-18",
    dueTime: "13:00",
    assignedToDepartment: "Speech Therapy",
    assignedToStaff: "user-002",
    assignedToStaffName: "Emma Thompson",
    status: "Completed",
    feedbackType: "Completed as prescribed",
    feedbackNotes: "Family engaged and receptive. Provided written materials and demonstrated techniques.",
    outcomeNotes: "Family education completed successfully. Family members demonstrate good understanding and are supportive.",
    completedDate: "2024-01-18",
    completedBy: "user-002",
    createdAt: "2024-01-17T15:00:00Z",
    updatedAt: "2024-01-18T14:30:00Z",
    createdBy: "admin-001"
  }
];

const MOCK_SUMMARY: TaskSummary = {
  totalTasks: 87,
  tasksToday: 12,
  notAssigned: 15,
  assigned: 28,
  inProgress: 22,
  completed: 22,
  overdue: 8,
  priorityBreakdown: {
    high: 25,
    medium: 38,
    low: 24
  },
  departmentBreakdown: {
    physiotherapy: 32,
    occupationalTherapy: 21,
    speechTherapy: 18,
    dietetics: 11,
    unassigned: 15
  }
};

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getAll$ = async (): Promise<{ data: Task[] }> => {
  await delay(500);
  return { data: MOCK_TASKS };
};

export const getById$ = async (id: string): Promise<{ data: Task }> => {
  await delay(300);
  const task = MOCK_TASKS.find(t => t.id === id);
  if (!task) {
    throw new Error("Task not found");
  }
  return { data: task };
};

export const getSummary$ = async (): Promise<{ data: TaskSummary }> => {
  await delay(200);
  return { data: MOCK_SUMMARY };
};

export const getByPatientId$ = async (patientId: string): Promise<{ data: Task[] }> => {
  await delay(300);
  const patientTasks = MOCK_TASKS.filter(t => t.patientId === patientId);
  return { data: patientTasks };
};

export const getOverdue$ = async (): Promise<{ data: Task[] }> => {
  await delay(300);
  const now = new Date();
  const overdueTasks = MOCK_TASKS.filter(task => {
    if (task.status === "Completed") return false;
    const dueDateTime = new Date(`${task.dueDate}T${task.dueTime}`);
    return dueDateTime < now;
  });
  return { data: overdueTasks };
};

export const create$ = async (task: TaskFormData): Promise<{ data: Task }> => {
  await delay(800);
  
  // Determine status based on assignment
  let status: Task["status"] = "Not Assigned";
  if (task.assignedToDepartment) {
    status = "Assigned";
  }
  
  // In a real app, we'd fetch patient info from the backend
  const newTask: Task = {
    ...task,
    id: `task-${Math.random().toString(36).substr(2, 9)}`,
    patientName: "Patient Name", // Would come from backend
    patientMrn: "MRN000000", // Would come from backend
    status,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "current-user-id"
  };
  
  MOCK_TASKS.push(newTask);
  return { data: newTask };
};

export const update$ = async (task: TaskFormData): Promise<{ data: Task }> => {
  await delay(800);
  const index = MOCK_TASKS.findIndex(t => t.id === task.id);
  if (index === -1) {
    throw new Error("Task not found");
  }
  
  const updatedTask: Task = {
    ...MOCK_TASKS[index],
    ...task,
    updatedAt: new Date().toISOString()
  };
  
  MOCK_TASKS[index] = updatedTask;
  return { data: updatedTask };
};

export const updateStatus$ = async (id: string, status: Task["status"], outcomeNotes?: string): Promise<{ data: Task }> => {
  await delay(500);
  const task = MOCK_TASKS.find(t => t.id === id);
  if (!task) {
    throw new Error("Task not found");
  }
  
  task.status = status;
  task.updatedAt = new Date().toISOString();
  
  if (status === "Completed") {
    task.completedDate = new Date().toISOString().split("T")[0];
    task.completedBy = "current-user-id";
    if (outcomeNotes) {
      task.outcomeNotes = outcomeNotes;
    }
  }
  
  return { data: task };
};

export const deleteTask$ = async (id: string): Promise<{ data: { success: boolean } }> => {
  await delay(500);
  const index = MOCK_TASKS.findIndex(t => t.id === id);
  if (index === -1) {
    throw new Error("Task not found");
  }
  
  MOCK_TASKS.splice(index, 1);
  return { data: { success: true } };
};

