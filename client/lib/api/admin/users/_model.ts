interface UserFormData {
    id: string | null;
    username: string | null;
    firstName: string;
    lastName: string;
    email: string;
    password: string | null;
    role: number;
    isAdmin: boolean;
}

// Interface matching backend GetUserDTO
interface User {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    role: number;
    isAdmin: boolean;
    hidden: boolean;
}

// Interface for user summary statistics
interface UserSummary {
    totalUsers: number;
    totalProfessionals: number;
    totalAssistants: number;
    totalAdmins: number;
}

export type { UserFormData, User, UserSummary };