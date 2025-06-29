
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
