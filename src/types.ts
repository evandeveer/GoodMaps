// src/types.ts
export interface Activity {
  id: string;
  name: string;
  description: string;
  lat: number;
  lng: number;
  opening_hours?: string;
  booking_link?: string;
  phone_number?: string;
  distanceKm?: number;
  category?: 'nature' | 'museum' | 'library' | 'sport' | 'culture' | 'other';
}

export interface ApiResponse {
  activities: Activity[];
}