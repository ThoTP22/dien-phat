export interface CreateLeadRequestDTO {
  fullName: string;
  phone: string;
  email?: string;
  intent?: "consultation" | "survey" | "installation" | "general";
  message?: string;
  sourcePage?: string;
}

export interface UpdateLeadStatusRequestDTO {
  status: "new" | "contacted" | "qualified" | "closed" | "spam";
  note?: string;
}

