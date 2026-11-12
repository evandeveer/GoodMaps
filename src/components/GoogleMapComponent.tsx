import React, { useEffect, useState } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from '@react-google-maps/api';
import { Activity } from '../types';
import { getCategoryColor, getCategoryLabel } from '../utils/categoryUtils';

interface GoogleMapComponentProps {
  activities: Activity[];
  selectedActivity?: Activity | null;
  onMarkerClick: (activity: Activity | null) => void;
  onMapLoad: () => void;
  onMapDragEnd: () => void;
  onBoundsChange: (bounds: { north: number; south: number; east: number; west: number }) => void;
}

const getCategoryIconSvg = (category?: string, isSelected: boolean = false): string => {
  const color = getCategoryColor(category);
  const scale = isSelected ? 1.25 : 1.0;
  const width = Math.round(34 * scale);
  const height = Math.round(44 * scale);
  const emoji = category === 'nature' ? '🌳' :
                category === 'museum' ? '🏛️' :
                category === 'library' ? '📚' :
                category === 'sport' ? '⚽' :
                category === 'culture' ? '🎭' : '📍';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 34 44">
    <defs>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.35"/>
      </filter>
    </defs>
    <path d="M17 0 C7.6 0 0 7.6 0 17 C0 29.7 17 44 17 44 C17 44 34 29.7 34 17 C34 7.6 26.4 0 17 0 Z" fill="${color}" filter="url(#shadow)"/>
    <circle cx="17" cy="16" r="11" fill="#ffffff"/>
    <text x="17" y="20.5" font-size="12" text-anchor="middle" dominant-baseline="middle">${emoji}</text>
  </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const GoogleMapComponent: React.FC<GoogleMapComponentProps> = ({
  activities,
  selectedActivity,
  onMarkerClick,
  onMapLoad,
  onMapDragEnd,
  onBoundsChange,
}) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  });

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Erreur de géolocalisation : ", error);
        }
      );
    } else {
      console.log("La géolocalisation n'est pas disponible dans ce navigateur.");
    }
  }, []);

  // Centrer la carte sur l'activité sélectionnée si elle change
  useEffect(() => {
    if (map && selectedActivity) {
      map.panTo({ lat: selectedActivity.lat, lng: selectedActivity.lng });
    }
  }, [map, selectedActivity]);

  const handleBoundsChanged = () => {
    if (map) {
      const bounds = map.getBounds();
      if (bounds) {
        const north = bounds.getNorthEast().lat();
        const east = bounds.getNorthEast().lng();
        const south = bounds.getSouthWest().lat();
        const west = bounds.getSouthWest().lng();
        onBoundsChange({ north, south, east, west });
      }
    }
  };

  if (loadError) {
    return <div className="alert alert-danger">Erreur lors du chargement de la carte.</div>;
  }

  if (!isLoaded) {
    return <div className="p-3 text-muted">Chargement de la carte GoodMaps...</div>;
  }

  return (
    <GoogleMap
      onLoad={(mapInstance) => {
        setMap(mapInstance);
        onMapLoad();
      }}
      onDragEnd={() => {
        onMapDragEnd();
        handleBoundsChanged();
      }}
      onZoomChanged={handleBoundsChanged}
      mapContainerStyle={{ width: '100%', height: '560px', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
      center={userLocation || { lat: 50.6292, lng: 3.0573 }}
      zoom={userLocation ? 13 : 11}
      options={{
        fullscreenControl: false,
        streetViewControl: false,
        mapTypeControl: false,
        clickableIcons: false,
      }}
    >
      {activities.map((activity) => {
        const isSelected = selectedActivity?.id === activity.id;
        return (
          <MarkerF
            key={activity.id}
            position={{ lat: activity.lat, lng: activity.lng }}
            icon={{
              url: getCategoryIconSvg(activity.category, isSelected),
              scaledSize: isSelected ? new window.google.maps.Size(42, 55) : new window.google.maps.Size(34, 44),
              anchor: isSelected ? new window.google.maps.Point(21, 55) : new window.google.maps.Point(17, 44),
            }}
            zIndex={isSelected ? 999 : 1}
            onClick={() => onMarkerClick(activity)}
          />
        );
      })}

      {selectedActivity && (
        <InfoWindowF
          key={selectedActivity.id}
          position={{ lat: selectedActivity.lat, lng: selectedActivity.lng }}
          onCloseClick={() => onMarkerClick(null)}
          options={{
            pixelOffset: new window.google.maps.Size(0, -42),
          }}
        >
          <div style={{ maxWidth: '250px', padding: '4px', textAlign: 'left', color: '#1f2937' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: getCategoryColor(selectedActivity.category), textTransform: 'uppercase' }}>
                {getCategoryLabel(selectedActivity.category)}
              </span>
              {selectedActivity.distanceKm !== undefined && (
                <span style={{ fontSize: '0.72rem', background: '#f3f4f6', padding: '2px 6px', borderRadius: '10px', color: '#4b5563', fontWeight: 600 }}>
                  📍 {selectedActivity.distanceKm} km
                </span>
              )}
            </div>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '0.95rem', fontWeight: 700, color: '#111827' }}>
              {selectedActivity.name}
            </h4>
            <p style={{ margin: '0 0 8px 0', fontSize: '0.8rem', color: '#4b5563', lineHeight: '1.3' }}>
              {selectedActivity.description.length > 110
                ? `${selectedActivity.description.slice(0, 110)}...`
                : selectedActivity.description}
            </p>
            {selectedActivity.opening_hours && (
              <div style={{ fontSize: '0.74rem', color: '#6b7280', marginBottom: '8px' }}>
                🕒 {selectedActivity.opening_hours}
              </div>
            )}
            <div style={{ display: 'flex', gap: '6px' }}>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedActivity.lat},${selectedActivity.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1,
                  textAlign: 'center',
                  background: '#ff5757',
                  color: '#ffffff',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  display: 'inline-block'
                }}
              >
                Itinéraire ↗
              </a>
            </div>
          </div>
        </InfoWindowF>
      )}
    </GoogleMap>
  );
};

export default GoogleMapComponent;
