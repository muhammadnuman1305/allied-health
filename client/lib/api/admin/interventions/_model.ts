// Intervention data models

export interface Intervention {
	 id: string;
	 name: string;
	 code?: string;
	 description?: string;
	 specialtyId?: string;
	 specialtyName?: string;
	 specialty?: string;
	 status: "A" | "X";
	 hidden: boolean;
	 notes?: string;
	 createdAt?: string;
	 lastUpdated?: string | null;
}

export interface InterventionFormData {
	 id?: string | null;
	 name: string;
	 code?: string;
	 description?: string;
	 specialtyId?: string;
	 status?: "A" | "X";
	 notes?: string;
}

export interface InterventionSummary {
	 totalInterventions: number;
	 activeInterventions: number;
}


