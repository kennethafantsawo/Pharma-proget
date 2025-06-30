
export interface Pharmacy {
  nom: string;
  localisation: string;
  contact1: string;
  contact2: string;
}

export interface WeekSchedule {
  semaine: string;
  pharmacies: Pharmacy[];
}

export interface HealthPost {
  id: number;
  title: string;
  content: string;
  image_url: string | null;
  created_at: string;
}
