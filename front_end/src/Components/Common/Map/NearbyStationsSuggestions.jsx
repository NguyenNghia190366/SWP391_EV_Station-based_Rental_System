import React, { useState, useEffect } from 'react';
import './NearbyStationsSuggestions.css';

const NearbyStationsSuggestions = ({ 
  userLocation = null, 
  stations = [], 
  onSelectStation,
  limit = 5 
}) => {
  const [nearbyStations, setNearbyStations] = useState([]);

  // Tính khoảng cách giữa 2 điểm (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  useEffect(() => {
    if (!userLocation || !stations.length) {
      setNearbyStations([]);
      return;
    }

    const userLat = userLocation.lat ?? userLocation.latitude;
    const userLng = userLocation.lng ?? userLocation.longitude;

    if (!userLat || !userLng) {
      setNearbyStations([]);
      return;
    }

    // Tính khoảng cách và sắp xếp
    const stationsWithDistance = stations
      .map(station => {
        const stationLat = station.latitude ?? station.lat;
        const stationLng = station.longitude ?? station.lng;
        
        if (!stationLat || !stationLng) return null;

        const distance = calculateDistance(userLat, userLng, stationLat, stationLng);
        
        return {
          ...station,
          distance: distance
        };
      })
      .filter(s => s !== null)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);

    setNearbyStations(stationsWithDistance);
  }, [userLocation, stations, limit]);

  if (!userLocation) {
    return (
      <div className="nearby-suggestions">
        <div className="suggestions-header">
          <h4> Trạm gần bạn</h4>
          <p className="hint">Vui lòng bật định vị để xem gợi ý</p>
        </div>
        <div className="empty-state">
          <div className="empty-icon">️</div>
          <p>Nhấn "Vị trí của tôi" để tìm các trạm gần nhất</p>
        </div>
      </div>
    );
  }

  if (nearbyStations.length === 0) {
    return (
      <div className="nearby-suggestions">
        <div className="suggestions-header">
          <h4> Trạm gần bạn</h4>
        </div>
        <div className="empty-state">
          <div className="empty-icon"></div>
          <p>Không tìm thấy trạm nào gần bạn</p>
        </div>
      </div>
    );
  }

  return (
    <div className="nearby-suggestions">
      <div className="suggestions-header">
        <h4> {nearbyStations.length} trạm gần bạn</h4>
        <p className="hint">Sắp xếp theo khoảng cách</p>
      </div>
      
      <div className="stations-list">
        {nearbyStations.map((station, index) => (
          <div 
            key={station.id || station.station_id || index}
            className="station-item"
            onClick={() => onSelectStation?.(station)}
          >
            <div className="station-rank">#{index + 1}</div>
            <div className="station-info">
              <div className="station-name">
                {station.station_name || station.name || station.stationName || 'Trạm'}
              </div>
              {station.address && (
                <div className="station-address">
                   {station.address}
                </div>
              )}
              <div className="station-distance">
                 {station.distance.toFixed(2)} km
                <span className="duration">
                  {' • '} ~{Math.ceil(station.distance / 40 * 60)} phút
                </span>
              </div>
            </div>
            <div className="station-action">
              <button className="select-btn">Chọn</button>
            </div>
          </div>
        ))}
      </div>
      
      {nearbyStations.length >= limit && (
        <div className="view-all">
          <button className="view-all-btn">
            Xem tất cả trạm →
          </button>
        </div>
      )}
    </div>
  );
};

export default NearbyStationsSuggestions;
