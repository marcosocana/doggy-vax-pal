export interface Dog {
  id: string;
  name: string;
  birth_date: string | null;
  password: string;
  photo_url: string | null;
  created_at: string;
}

export interface DogFormData {
  name: string;
  birth_date: string | null;
  password: string;
  photo_url?: string | null;
}
