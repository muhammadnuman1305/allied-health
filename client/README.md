# Allied Health HMS - Healthcare Management System

A comprehensive healthcare management system built with Next.js, TypeScript, and Tailwind CSS. This system provides healthcare professionals with tools to manage tasks, patients, referrals, and feedback in an integrated platform.

## Features

### 🏥 **Dashboard Overview**

- Personalized dashboard showing all current tasks and activities
- Quick access to key healthcare management features
- Real-time overview of pending tasks, patient status, and referrals
- Recommended actions based on current workload

### 📋 **Task Management System**

- **Task Filtering**: Filter by status (Not Assigned, Pending, Assigned, In Progress, Completed)
- **CRUD Operations**: Create, Read, Update, Delete tasks assigned to self
- **Priority Management**: Set and manage task priorities (Low, Medium, High)
- **Status Tracking**: Real-time status updates and progress tracking
- **Search & Filter**: Advanced search and filtering capabilities

### 👥 **Patient Management**

- **Patient List Access**: View and browse through assigned patients
- **Patient History Access**: View patient's referral chain and previous assignments
- **Patient Details**: Comprehensive patient information including medical history
- **Status Tracking**: Monitor patient status (Active, Inactive, Discharged)
- **Department Assignment**: Track patient assignments across departments

### 🔄 **Referral Management**

- **Referral Creation**: Create referrals between departments with contextual information
- **Status Tracking**: Monitor referral status (Pending, Accepted, Completed, Rejected)
- **Department Communication**: Seamless communication between healthcare departments
- **Priority Assignment**: Set referral priorities for urgent cases
- **Feedback Integration**: Add contextual feedback for inter-department communication

### 💬 **Feedback Module**

- **Centralized Feedback**: Add and view notes/feedback per task, patient, or referral
- **Tagging System**: Organize feedback with custom tags
- **Privacy Controls**: Create private notes visible only to the author
- **Search & Filter**: Find specific feedback using search and filtering
- **Cross-Reference**: Link feedback to specific tasks, patients, or referrals

## Technology Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Icons**: Lucide React
- **State Management**: React Hooks (useState, useEffect)
- **Routing**: Next.js App Router

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd allied-health-hms
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
client/
├── app/
│   ├── user/
│   │   ├── dashboard/          # Main dashboard
│   │   ├── tasks/             # Task management
│   │   ├── patients/          # Patient management
│   │   ├── referrals/         # Referral management
│   │   ├── feedback/          # Feedback module
│   │   └── ...                # Other user features
│   ├── (auth)/                # Authentication pages
│   └── admin/                 # Admin features
├── components/
│   ├── ui/                    # Reusable UI components
│   ├── sidebar/               # Navigation sidebar
├── hooks/                     # Custom React hooks
├── lib/                       # Utility functions
└── middleware.ts              # Next.js middleware
```

## Key Features Walkthrough

### 1. Task Management (`/tasks`)

The task management system allows healthcare professionals to:

- **View All Tasks**: See a comprehensive list of all assigned tasks
- **Filter Tasks**: Filter by status, priority, or search terms
- **Create Tasks**: Add new tasks with patient information and due dates
- **Update Status**: Change task status as work progresses
- **Add Feedback**: Include notes and feedback for each task
- **Delete Tasks**: Remove completed or cancelled tasks

**Key Components:**

- Task overview cards showing counts by status
- Advanced filtering and search capabilities
- Task detail views with full information
- Quick status updates via dropdown

### 2. Patient Management (`/patients`)

The patient management system provides:

- **Patient List**: Browse all assigned patients
- **Patient Details**: View comprehensive patient information
- **Medical History**: Access patient's referral chain and medical history
- **Status Tracking**: Monitor patient status and appointments
- **Quick Actions**: Fast access to patient-related tasks and referrals

**Key Components:**

- Patient overview cards with status counts
- Detailed patient history views
- Referral history tracking
- Current task integration

### 3. Referral Management (`/referrals`)

The referral system enables:

- **Create Referrals**: Generate referrals between departments
- **Track Status**: Monitor referral progress through the system
- **Add Context**: Include detailed reasons and notes for referrals
- **Manage Priorities**: Set appropriate priority levels
- **Feedback Loop**: Add feedback throughout the referral process

**Key Components:**

- Referral creation forms with department selection
- Status tracking with visual indicators
- Priority management
- Feedback integration

### 4. Feedback Module (`/feedback`)

The feedback system offers:

- **Centralized Notes**: All feedback in one location
- **Type Categorization**: Organize feedback by type (Task, Patient, Referral)
- **Tagging System**: Use custom tags for easy organization
- **Privacy Controls**: Create private notes when needed
- **Search & Filter**: Find specific feedback quickly

**Key Components:**

- Feedback creation with type selection
- Tag management system
- Privacy controls
- Advanced search capabilities

## Usage Examples

### Creating a New Task

1. Navigate to `/tasks`
2. Click "Create Task"
3. Fill in the required information:
   - Task title and description
   - Patient ID and name
   - Due date and department
   - Priority level
4. Click "Create Task"

### Managing Patient Referrals

1. Go to `/referrals`
2. Click "Create Referral"
3. Select the patient and departments
4. Add the reason for referral
5. Set priority and assign to appropriate staff
6. Add any additional notes
7. Submit the referral

### Adding Feedback

1. Navigate to `/feedback`
2. Click "Add Feedback"
3. Select the type (Task, Patient, or Referral)
4. Enter the related ID and title
5. Write your feedback content
6. Add relevant tags
7. Set privacy if needed
8. Submit the feedback

## Data Structure

### Task Interface

```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  status: "not-assigned" | "pending" | "assigned" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  assignedTo: string;
  patientId: string;
  patientName: string;
  dueDate: string;
  createdAt: string;
  department: string;
  feedback: string[];
}
```

### Patient Interface

```typescript
interface Patient {
  id: string;
  name: string;
  age: number;
  gender: "male" | "female" | "other";
  phone: string;
  email: string;
  address: string;
  primaryCondition: string;
  assignedTo: string;
  lastVisit: string;
  nextAppointment: string;
  status: "active" | "inactive" | "discharged";
  department: string;
  referralHistory: Referral[];
  tasks: Task[];
}
```

### Referral Interface

```typescript
interface Referral {
  id: string;
  patientId: string;
  patientName: string;
  fromDepartment: string;
  toDepartment: string;
  reason: string;
  date: string;
  status: "pending" | "accepted" | "completed" | "rejected";
  notes: string;
  assignedTo: string;
  priority: "low" | "medium" | "high";
  feedback: string[];
}
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please contact the development team or create an issue in the repository.

---

**Note**: This is a demonstration system with mock data. In a production environment, you would need to integrate with a backend API and database for persistent data storage.
