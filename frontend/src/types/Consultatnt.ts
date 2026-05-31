export interface Consultant {
  id?: string;
  _id?: string;
  name: string;
  phone: string;
  email?: string;
  expertise: string; // Main specialization (single crop)
  experience: number;
  state: string;
  district: string;
  language?: string;
  fee?: number;
  rating?: number;
  image?: string;
  profit?: number;
  about?: string;
  cropSpecializations?: string[];
  description?: string; // Legacy fallback
  area?: string; // Legacy fallback
}
