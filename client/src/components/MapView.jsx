import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Circle } from '@react-google-maps/api';
import { MapPin, Briefcase, User, ExternalLink, Navigation } from 'lucide-react';

const containerStyle = {
  width: '100%',
  height: '100%'
};

// Dark Mode Map Styles
const mapStyles = [
  { "elementType": "geometry", "stylers": [{ "color": "#1e293b" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#94a3b8" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#1e293b" }] },
  { "featureType": "administrative", "elementType": "geometry.stroke", "stylers": [{ "color": "#334155" }] },
  { "featureType": "landscape.man_made", "elementType": "geometry.stroke", "stylers": [{ "color": "#334155" }] },
  { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#94a3b8" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#334155" }] },
  { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#1e293b" }] },
  { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#64748b" }] },
  { "featureType": "transit", "elementType": "geometry", "stylers": [{ "color": "#2e3b4e" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#0f172a" }] }
];

const MapView = ({ userLocation, items, type, radius, onSearchArea }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  const [map, setMap] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showSearchBtn, setShowSearchBtn] = useState(false);
  const mapCenterRef = useRef(userLocation);

  const onLoad = useCallback(function callback(map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map) {
    setMap(null);
  }, []);

  const onCenterChanged = () => {
    if (map) {
      const newCenter = map.getCenter();
      const lat = newCenter.lat();
      const lng = newCenter.lng();
      
      // Check if distance from original center is significant
      const distance = calculateDistance(userLocation.lat, userLocation.lng, lat, lng);
      if (distance > 0.5) { // Show button if moved > 500m
        setShowSearchBtn(true);
        mapCenterRef.current = { lat, lng };
      }
    }
  };

  const handleSearchArea = () => {
    onSearchArea(mapCenterRef.current.lat, mapCenterRef.current.lng);
    setShowSearchBtn(false);
  };

  const formatDistance = (dist) => {
    if (dist >= 1) return `${dist.toFixed(1)} km away`;
    return `${(dist * 1000).toFixed(0)} m away`;
  };

  // Helper distance function for "Search This Area" logic
  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  if (!isLoaded) return (
    <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-500 animate-pulse">
      Loading Maps...
    </div>
  );

  return (
    <div className="w-full h-full relative rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={userLocation}
        zoom={13}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onCenterChanged={onCenterChanged}
        options={{
          styles: mapStyles,
          disableDefaultUI: true,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
        {/* User Location Marker */}
        <Marker 
          position={userLocation} 
          icon={{
            path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z",
            fillColor: "#8B5CF6",
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: "#ffffff",
            scale: 1.5,
          }}
        />

        {/* Radius Circle */}
        <Circle
          center={userLocation}
          radius={radius * 1000}
          options={{
            fillColor: "#8B5CF6",
            fillOpacity: 0.05,
            strokeColor: "#8B5CF6",
            strokeOpacity: 0.2,
            strokeWeight: 1,
            clickable: false,
          }}
        />

        {/* Data Markers */}
        {items.map(item => (
          <Marker
            key={item._id}
            position={{ 
              lat: item.location.coordinates[1], 
              lng: item.location.coordinates[0] 
            }}
            onClick={() => setSelectedItem(item)}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: type === 'jobs' ? "#10B981" : "#F43F5E",
              fillOpacity: 0.9,
              strokeWeight: 2,
              strokeColor: "#ffffff",
            }}
          />
        ))}

        {/* InfoWindow */}
        {selectedItem && (
          <InfoWindow
            position={{ 
              lat: selectedItem.location.coordinates[1], 
              lng: selectedItem.location.coordinates[0] 
            }}
            onCloseClick={() => setSelectedItem(null)}
          >
            <div className="p-2 text-slate-900 min-w-[200px]">
              <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-2 py-0.5 rounded">
                  {type === 'jobs' ? selectedItem.category : (selectedItem.skills?.[0] || 'Freelancer')}
                </span>
                <span className="text-[10px] font-bold text-slate-500">{formatDistance(selectedItem.distance)}</span>
              </div>
              <h4 className="font-extrabold text-lg leading-tight mb-1">{type === 'jobs' ? selectedItem.title : selectedItem.name}</h4>
              <p className="text-xs text-slate-500 mb-3 flex items-center gap-1">
                <MapPin size={10} /> {selectedItem.locationName}
              </p>
              {type === 'jobs' && (
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-black text-secondary">₹{selectedItem.budget}</span>
                </div>
              )}
              <button 
                className="w-full py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:opacity-90 flex items-center justify-center gap-1"
              >
                View {type === 'jobs' ? 'Gig' : 'Profile'} <ExternalLink size={10} />
              </button>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Floating Controls */}
      {showSearchBtn && (
        <button 
          onClick={handleSearchArea}
          className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-6 py-2.5 bg-white text-slate-900 rounded-full font-black text-sm shadow-2xl hover:scale-105 transition-all border border-slate-200 animate-in fade-in slide-in-from-top-4 duration-300"
        >
          <Navigation size={16} fill="currentColor" />
          Search This Area
        </button>
      )}
    </div>
  );
};

export default MapView;
