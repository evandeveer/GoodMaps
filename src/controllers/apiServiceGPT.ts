import { Activity } from '../types';
import activitiesData from '../data/activities.json';

interface UserInfo {
  ability: string;
  activityPreferences: string;
}

interface RawActivity {
  city: string;
  ability: string;
  name: string;
  description: string;
  lat: number;
  lng: number;
  opening_hours?: string;
  booking_link?: string;
  phone_number?: string | null;
}

export const detectCategory = (name: string, description: string): Activity['category'] => {
  const text = `${name} ${description}`.toLowerCase();
  if (text.includes('parc') || text.includes('jardin') || text.includes('nature') || text.includes('ferme') || text.includes('lac') || text.includes('prés') || text.includes('zoo')) {
    return 'nature';
  }
  if (text.includes('musée') || text.includes('palais') || text.includes('art ') || text.includes('villa') || text.includes('galerie') || text.includes('hospice') || text.includes('lam')) {
    return 'museum';
  }
  if (text.includes('médiathèque') || text.includes('bibliothèque') || text.includes('livre')) {
    return 'library';
  }
  if (text.includes('sport') || text.includes('piscine') || text.includes('vélo') || text.includes('bowling') || text.includes('stade') || text.includes('b\'twin') || text.includes('loisir')) {
    return 'sport';
  }
  if (text.includes('théâtre') || text.includes('opéra') || text.includes('concert') || text.includes('orchestre') || text.includes('cinéma') || text.includes('beffroi') || text.includes('cathédrale') || text.includes('bourse') || text.includes('culture') || text.includes('folie')) {
    return 'culture';
  }
  return 'other';
};

// Calcule la distance en km entre deux coordonnées GPS (formule Haversine)
const getDistanceKm = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const fetchActivities = async (
  latitude: number,
  longitude: number,
  _bounds?: { north: number; south: number; east: number; west: number },
  userInfo?: UserInfo
): Promise<Activity[] | null> => {
  try {
    const ability = userInfo?.ability ?? 'valide';
    const preferences = userInfo?.activityPreferences?.toLowerCase() ?? '';

    const RAYON_KM = 80; // Rayon de recherche en km autour de l'utilisateur

    // Filtrer par catégorie ET par distance
    let results = (activitiesData as RawActivity[]).filter((a) => {
      const matchAbility = a.ability === ability;
      const distance = getDistanceKm(latitude, longitude, a.lat, a.lng);
      return matchAbility && distance <= RAYON_KM;
    });

    // Filtrage optionnel par préférences textuelles
    if (preferences.trim() !== '') {
      const keywords = preferences.split(/[,\s]+/).filter(Boolean);
      const filtered = results.filter((a) => {
        const searchable = `${a.name} ${a.description}`.toLowerCase();
        return keywords.some((kw) => searchable.includes(kw));
      });
      // Si filtre trop restrictif, on garde tous les résultats de la catégorie/zone
      if (filtered.length > 0) results = filtered;
    }

    // Trier par distance croissante
    results.sort(
      (a, b) =>
        getDistanceKm(latitude, longitude, a.lat, a.lng) -
        getDistanceKm(latitude, longitude, b.lat, b.lng)
    );

    const enriched = results.map((a) => {
      const dist = getDistanceKm(latitude, longitude, a.lat, a.lng);
      return {
        ...a,
        distanceKm: Math.round(dist * 10) / 10,
        category: detectCategory(a.name, a.description),
      };
    });

    return enriched as unknown as Activity[];
  } catch (error) {
    console.error('Erreur lors de la récupération des activités : ', error);
    return null;
  }
};
