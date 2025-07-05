
export interface Pharmacy {
  nom: string;
  localisation: string;
  contact1: string;
  contact2: string;
  latitude?: number | null;
  longitude?: number | null;
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
  likes: number;
  publish_at: string | null;
}

export interface HealthPostComment {
    id: number;
    post_id: number;
    content: string;
    created_at: string;
}
