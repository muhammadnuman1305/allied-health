// Specialty data models

export interface Specialty {
	 id: string;
	 name: string;
	 code: string;
	 description?: string;
	 status: "A" | "X"; // A=Active, X=Inactive
	 hidden: boolean;
	 notes?: string;
	 createdAt: string;
	 lastUpdated: string;
}

export interface SpecialtyFormData {
	 id?: string | null;
	 name: string;
	 code?: string;
	 description?: string;
	 status?: "A" | "X";
	 notes?: string;
}

export interface SpecialtySummary {
	 totalSpecialties: number;
	 activeSpecialties: number;
}

export interface SpecialtyOption {
	 id: string;
	 name: string;
}


