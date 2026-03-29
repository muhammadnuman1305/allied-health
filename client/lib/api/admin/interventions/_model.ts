// ─── Component types ─────────────────────────────────────────────────────────

export interface ComponentTypeOption {
  id: number;
  name: string;
}

/** A group of values for one component type (returned by GET /api/intervention/:id) */
export interface InterventionComponentGroup {
  type: string;
  values: string[];
}

/** A single flat row used in the create/edit form */
export interface InterventionComponentRow {
  componentType: string;
  value: string;
}

// ─── Intervention ─────────────────────────────────────────────────────────────

export interface Intervention {
  id: string;
  name: string;
  description?: string;
  specialtyId?: string;
  specialtyName?: string;
  specialty?: string;
  hidden: boolean;
  lastUpdated?: string | null;
  /** Grouped components (returned by GET /api/intervention/:id) */
  components?: InterventionComponentGroup[];
}

export interface InterventionFormData {
  id?: string | null;
  name: string;
  description?: string;
  specialtyId?: string;
  /** Flat rows submitted to the API */
  components: InterventionComponentRow[];
}

export interface InterventionSummary {
  totalInterventions: number;
  activeInterventions: number;
}


