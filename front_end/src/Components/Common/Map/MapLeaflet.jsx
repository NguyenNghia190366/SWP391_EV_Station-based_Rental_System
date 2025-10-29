import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default icon paths for Leaflet (needed for default markers if any)
import 'leaflet/dist/images/marker-icon.png';
import 'leaflet/dist/images/marker-icon-2x.png';
import 'leaflet/dist/images/marker-shadow.png';

// Create custom station icon with charging symbol
const stationIcon = L.divIcon({
  html: `
    <div style="
      background: #10b981;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 3px solid white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    "></div>
  `,
  className: 'custom-station-icon',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36]
});

// Highlighted station icon (red)
const highlightedIcon = L.divIcon({
  html: `
    <div style="
      background: #ef4444;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      border: 3px solid white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      box-shadow: 0 4px 12px rgba(239,68,68,0.5);
      animation: pulse 2s infinite;
    "></div>
  `,
  className: 'custom-highlighted-icon',
  iconSize: [44, 44],
  iconAnchor: [22, 44],
  popupAnchor: [0, -44]
});

function FlyTo({ position, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (!position) return;
    try {
      map.flyTo(position, zoom ?? map.getZoom(), { duration: 1.0 });
    } catch {
      // ignore if map not ready
    }
  }, [position, zoom, map]);
  return null;
}

const MapLeaflet = ({ stations = [], highlightedStation = null, height = '420px', zoom = 13, center = null, onFindNearest }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStations, setFilteredStations] = useState(stations);
  const [locationInput, setLocationInput] = useState('');
  const [searchMode, setSearchMode] = useState('name'); // 'name' or 'location'
  const [isSearching, setIsSearching] = useState(false);
  
  // Add CSS for pulse animation
  useEffect(() => {
    const styleId = 'map-marker-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        .custom-station-icon, .custom-highlighted-icon {
          background: transparent !important;
          border: none !important;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);
  
  // Debug log
  console.log('️ MapLeaflet - stations:', stations?.length, stations);
  console.log('️ MapLeaflet - filteredStations:', filteredStations?.length, filteredStations);
  
  const defaultCenter = center || (stations.length > 0 ? [stations[0].latitude || stations[0].lat, stations[0].longitude || stations[0].lng] : [10.762622, 106.660172]);
  const highlightedPos = highlightedStation ? [highlightedStation.latitude ?? highlightedStation.lat, highlightedStation.longitude ?? highlightedStation.lng] : null;

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredStations(stations);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = stations.filter(s => {
        const name = (s.station_name || s.name || s.stationName || '').toLowerCase();
        const address = (s.address || '').toLowerCase();
        return name.includes(query) || address.includes(query);
      });
      setFilteredStations(filtered);
    }
  }, [searchQuery, stations]);

  // Handle finding nearest station by current location
  const handleUseMyLocation = async () => {
    if (!onFindNearest) return;
    setIsSearching(true);
    try {
      if (!navigator.geolocation) {
        alert('Trình duyệt không hỗ trợ định vị!');
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocationInput(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          if (onFindNearest) {
            await onFindNearest({ lat: latitude, lng: longitude });
          }
          setIsSearching(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Không thể lấy vị trí của bạn. Vui lòng cho phép truy cập vị trí.');
          setIsSearching(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } catch (err) {
      console.error('Location error:', err);
      setIsSearching(false);
    }
  };

  // Handle finding by manual coordinates
  const handleFindByCoords = async () => {
    if (!locationInput.trim() || !onFindNearest) return;
    
    setIsSearching(true);
    try {
      // Parse input: "lat, lng" or "lat,lng"
      const parts = locationInput.split(',').map(p => parseFloat(p.trim()));
      
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        const [lat, lng] = parts;
        await onFindNearest({ lat, lng });
      } else {
        alert('Vui lòng nhập tọa độ đúng định dạng: "vĩ độ, kinh độ"\nVí dụ: 10.7769, 106.7009');
      }
    } catch (err) {
      console.error('Error finding by coords:', err);
      alert('Có lỗi khi tìm trạm. Vui lòng thử lại.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Search by name bar */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        padding: '8px 12px',
        background: '#fff',
        border: '1px solid #e6e9ef',
        borderRadius: '10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}>
        <span style={{ fontSize: '16px' }}></span>
        <input
          type="text"
          placeholder="Tìm kiếm trạm theo tên hoặc địa chỉ..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            fontSize: '14px',
            padding: '6px 0',
            background: 'transparent'
          }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '18px',
              padding: '0 4px',
              color: '#6b7280'
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Find nearest station controls */}
      {onFindNearest && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          padding: '12px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ 
            color: 'white', 
            fontWeight: '600', 
            fontSize: '14px',
            marginBottom: '4px'
          }}>
             Tìm trạm thuê xe gần nhất
          </div>
          
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {/* Use my location button */}
            <button
              onClick={handleUseMyLocation}
              disabled={isSearching}
              style={{
                flex: '1 1 auto',
                minWidth: '150px',
                padding: '10px 16px',
                background: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#667eea',
                cursor: isSearching ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'all 0.2s',
                opacity: isSearching ? 0.6 : 1
              }}
              onMouseEnter={(e) => !isSearching && (e.target.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => (e.target.style.transform = 'translateY(0)')}
            >
              {isSearching ? '' : ''} {isSearching ? 'Đang tìm...' : 'Dùng vị trí của tôi'}
            </button>
            
            {/* Toggle to manual input */}
            <button
              onClick={() => setSearchMode(searchMode === 'name' ? 'location' : 'name')}
              style={{
                padding: '10px 16px',
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '8px',
                fontSize: '14px',
                color: 'white',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => (e.target.style.background = 'rgba(255,255,255,0.3)')}
              onMouseLeave={(e) => (e.target.style.background = 'rgba(255,255,255,0.2)')}
            >
              {searchMode === 'name' ? '️ Nhập tọa độ' : ' Tìm theo tên'}
            </button>
          </div>

          {/* Manual coordinate input */}
          {searchMode === 'location' && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <input
                type="text"
                placeholder="Nhập tọa độ (vĩ độ, kinh độ)..."
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <button
                onClick={handleFindByCoords}
                disabled={isSearching || !locationInput.trim()}
                style={{
                  padding: '10px 20px',
                  background: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#667eea',
                  cursor: (!isSearching && locationInput.trim()) ? 'pointer' : 'not-allowed',
                  opacity: (!isSearching && locationInput.trim()) ? 1 : 0.6,
                  transition: 'all 0.2s'
                }}
              >
                 Tìm
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Map container */}
      <div style={{ flex: 1, position: 'relative' }}>
        <MapContainer center={defaultCenter} zoom={zoom} style={{ width: '100%', height }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {filteredStations.map((s, index) => {
            const lat = s.latitude ?? s.lat; 
            const lng = s.longitude ?? s.lng;
            const stationId = s.id || s.station_id || `station_${index}`;
            
            console.log(` Station ${stationId}:`, { lat, lng, name: s.station_name || s.name });
            
            if (lat == null || lng == null) {
              console.warn(` Station ${stationId} missing coordinates!`, s);
              return null;
            }
            
            // Check if this is the highlighted station
            const isHighlighted = highlightedStation && 
              (highlightedStation.id === s.id || 
               highlightedStation.station_id === s.station_id);
            
            return (
              <Marker 
                key={stationId} 
                position={[lat, lng]}
                icon={isHighlighted ? highlightedIcon : stationIcon}
              >
                <Popup>
                  <div style={{ minWidth: 180 }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      marginBottom: '8px'
                    }}>
                      <span style={{ fontSize: '24px' }}></span>
                      <strong style={{ fontSize: '16px' }}>
                        {s.station_name || s.name || s.stationName || 'Unknown Station'}
                      </strong>
                    </div>
                    {s.address && (
                      <div style={{ 
                        fontSize: '13px', 
                        color: '#666',
                        marginBottom: '8px'
                      }}>
                         {s.address}
                      </div>
                    )}
                    {isHighlighted && (
                      <div style={{
                        background: '#fef3c7',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: '#92400e',
                        fontWeight: '500'
                      }}>
                         Trạm gần nhất
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {highlightedPos && (
            <FlyTo position={highlightedPos} zoom={Math.max(zoom, 14)} />
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapLeaflet;
