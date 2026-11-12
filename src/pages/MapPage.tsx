import '../App.css';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import GoogleMapComponent from '../components/GoogleMapComponent';
import { getCategoryColor, getCategoryLabel } from '../utils/categoryUtils';
import { fetchActivities } from '../controllers/apiServiceGPT';
import { Activity } from '../types';
import { v4 as uuidv4 } from 'uuid';
import LoadingOverlay from '../components/LoadingOverlay';
import logo from '../assets/logo-goodmaps.png';

interface UserInfo {
  ability: string;
  activityPreferences: string;
}

const QUICK_FILTERS = [
  { id: 'all', label: 'Tous' },
  { id: 'nature', label: '🌳 Parcs & Nature' },
  { id: 'museum', label: '🏛️ Musées & Art' },
  { id: 'library', label: '📚 Médiathèques' },
  { id: 'sport', label: '⚽ Sport & Loisirs' },
  { id: 'culture', label: '🎭 Culture' },
  { id: 'free', label: '✨ Gratuit' },
];

const MapPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const userInfo = location.state as UserInfo | undefined;

  React.useEffect(() => {
    if (!userInfo) {
      navigate('/');
    }
  }, [userInfo, navigate]);

  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [bounds, setBounds] = useState<{ north: number; south: number; east: number; west: number }>({
    north: 50.7100,
    south: 50.5500,
    east: 3.2000,
    west: 2.9500
  });

  const activityInfoRef = useRef<HTMLDivElement | null>(null);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const hasInitiallySelected = useRef(false);

  const handleBoundsChange = (newBounds: { north: number; south: number; east: number; west: number }) => {
    setBounds(newBounds);
  };

  // Chargement des activités
  const loadActivities = useCallback(async (lat: number, lng: number) => {
    setIsLoading(true);
    const data = await fetchActivities(lat, lng, bounds, userInfo);
    if (data && data.length > 0) {
      const activitiesWithId = data.map((activity) => ({
        ...activity,
        id: activity.id || uuidv4(),
      }));
      setActivities(activitiesWithId);
      if (!hasInitiallySelected.current) {
        setSelectedActivity(activitiesWithId[0]);
        hasInitiallySelected.current = true;
      }
    }
    setIsLoading(false);
  }, [bounds, userInfo]);

  // Chargement automatique au démarrage
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => loadActivities(pos.coords.latitude, pos.coords.longitude),
        () => loadActivities(50.6292, 3.0573) // Coordonnées Lille par défaut
      );
    } else {
      loadActivities(50.6292, 3.0573);
    }
  }, [loadActivities]);

  const handleMarkerClick = (activity: Activity | null) => {
    setSelectedActivity(activity);
    if (activity) {
      // Faire défiler le carrousel vers la carte correspondante
      const cardEl = document.getElementById(`card-${activity.id}`);
      if (cardEl && carouselRef.current) {
        cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  };

  const handleCardClick = (activity: Activity) => {
    setSelectedActivity(activity);
    activityInfoRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Filtrage interactif en direct
  const filteredActivities = activities.filter((act) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'free') {
      const text = `${act.name} ${act.description}`.toLowerCase();
      return text.includes('gratuit') || text.includes('accès libre');
    }
    return act.category === selectedFilter;
  });

  return (
    <>
      <div className="container" style={{ maxWidth: '1140px', margin: '0 auto', padding: '1rem' }}>
        {isLoading && <LoadingOverlay />}

        {/* Barre du haut : retour aux filtres */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <button 
            type="button" 
            onClick={() => navigate('/', { state: userInfo })} 
            className="backButton"
          >
            ← Modifier mes critères
          </button>
          {userInfo && (
            <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
              Profil : <strong>{userInfo.ability}</strong> {userInfo.activityPreferences ? `(${userInfo.activityPreferences})` : ''}
            </span>
          )}
        </div>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <img src={logo} alt="Logo GoodMaps" style={{ maxHeight: '90px', width: 'auto' }} />
        </div>

        {/* Barre de filtres rapides (Chips/Puces) */}
        <div className="filter-chips-container">
          {QUICK_FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              className={`filter-chip ${selectedFilter === filter.id ? 'active' : ''}`}
              onClick={() => setSelectedFilter(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Carte Google Map avec marqueurs visuels et InfoWindow */}
        <GoogleMapComponent 
          activities={filteredActivities}
          selectedActivity={selectedActivity}
          onMarkerClick={handleMarkerClick} 
          onMapLoad={() => {}}
          onMapDragEnd={() => {}}  
          onBoundsChange={handleBoundsChange}
        />

        {/* En-tête de la section liste / carrousel */}
        <div className="activities-section-header">
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#111827' }}>
            Lieux & Activités à proximité
          </h3>
          <span className="activities-count">
            {filteredActivities.length} {filteredActivities.length > 1 ? 'lieux trouvés' : 'lieu trouvé'}
          </span>
        </div>

        {/* Double affichage : Carrousel / Liste de cartes d'activités */}
        <div className="activities-carousel" ref={carouselRef}>
          {filteredActivities.map((act) => {
            const isSelected = selectedActivity?.id === act.id;
            return (
              <div
                key={act.id}
                id={`card-${act.id}`}
                className={`activity-card ${isSelected ? 'selected' : ''}`}
                onClick={() => handleCardClick(act)}
              >
                <div>
                  <div className="activity-card-header">
                    <span
                      className="badge-category"
                      style={{
                        backgroundColor: `${getCategoryColor(act.category)}18`,
                        color: getCategoryColor(act.category),
                      }}
                    >
                      {getCategoryLabel(act.category)}
                    </span>
                    {act.distanceKm !== undefined && (
                      <span className="badge-distance">
                        📍 {act.distanceKm} km
                      </span>
                    )}
                  </div>
                  <h4 className="activity-card-title">{act.name}</h4>
                  <p className="activity-card-desc">{act.description}</p>
                </div>

                <div className="activity-card-footer">
                  <button
                    type="button"
                    className="btn-card-action btn-card-view"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkerClick(act);
                    }}
                  >
                    👁️ Sur la carte
                  </button>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${act.lat},${act.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-card-action btn-card-dir"
                    onClick={(e) => e.stopPropagation()}
                  >
                    📍 Itinéraire
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Fiche de détail de l'activité sélectionnée */}
        {selectedActivity && (
          <div ref={activityInfoRef} className="activity-detail-card">
            <div className="activity-detail-header">
              <div>
                <span
                  className="badge-category"
                  style={{
                    backgroundColor: `${getCategoryColor(selectedActivity.category)}20`,
                    color: getCategoryColor(selectedActivity.category),
                    marginRight: '0.5rem',
                  }}
                >
                  {getCategoryLabel(selectedActivity.category)}
                </span>
                {selectedActivity.distanceKm !== undefined && (
                  <span className="badge-distance">
                    📍 À {selectedActivity.distanceKm} km de votre position
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedActivity.lat},${selectedActivity.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-itinerary-lg"
                >
                  📍 Itinéraire ↗
                </a>
                <button
                  type="button"
                  onClick={() => setSelectedActivity(null)}
                  style={{
                    background: '#f3f4f6',
                    border: '1px solid #d1d5db',
                    color: '#6b7280',
                    borderRadius: '6px',
                    padding: '0.45rem 0.75rem',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                  title="Masquer la description"
                >
                  ✕ Masquer
                </button>
              </div>
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', margin: '0.4rem 0 0.8rem 0' }}>
              {selectedActivity.name}
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#374151', lineHeight: '1.5', marginBottom: '1rem' }}>
              {selectedActivity.description}
            </p>

            {selectedActivity.opening_hours && (
              <p style={{ margin: '0.4rem 0', fontSize: '0.88rem' }}>
                <strong>🕒 Horaires d'ouverture :</strong> {selectedActivity.opening_hours}
              </p>
            )}
            {selectedActivity.booking_link && (
              <p style={{ margin: '0.4rem 0', fontSize: '0.88rem' }}>
                <strong>🌐 Site web / Réservation :</strong>{' '}
                <a href={selectedActivity.booking_link} target="_blank" rel="noopener noreferrer" style={{ color: '#ff5757' }}>
                  {selectedActivity.booking_link}
                </a>
              </p>
            )}
            {selectedActivity.phone_number && (
              <p style={{ margin: '0.4rem 0', fontSize: '0.88rem' }}>
                <strong>📞 Téléphone :</strong>{' '}
                <a href={`tel:${selectedActivity.phone_number}`} style={{ color: '#ff5757' }}>
                  {selectedActivity.phone_number}
                </a>
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default MapPage;
