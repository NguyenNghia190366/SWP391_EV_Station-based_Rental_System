import React, { useState, useEffect } from 'react';

const NearbyStationsSuggestions = ({ 
  userLocation = null, 
  stations = [], 
  onSelectStation,
  limit = 5 
}) => {
  const [nearbyStations, setNearbyStations] = useState([]);

  // Calculate distance between two points (Haversine formula)
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
      <section className="bg-white rounded-2xl shadow-lg p-6">
        <div className="mb-4">
          <h4 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            📍 Nearby stations
          </h4>
          <p className="text-sm text-gray-600 mt-1">Please enable location services to see suggestions</p>
        </div>
        <div className="text-center py-8">
          <div className="text-6xl mb-4">📍</div>
          <p className="text-gray-600 font-medium">Click "Use my location" to find the nearest stations</p>
        </div>
      </section>
    );
  }

  if (nearbyStations.length === 0) {
    return (
      <section className="bg-white rounded-2xl shadow-lg p-6">
          <div className="mb-4">
          <h4 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            📍 Nearby stations
          </h4>
        </div>
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-gray-600 font-medium">No nearby stations found</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-2xl shadow-lg p-6 h-full max-h-[420px] flex flex-col">
        <div className="mb-4 flex-shrink-0">
        <h4 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          📍 {nearbyStations.length} nearby stations
        </h4>
        <p className="text-sm text-gray-600 mt-1">Sorted by distance</p>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
        {nearbyStations.map((station, index) => (
          <div 
            key={station.id || station.station_id || index}
            className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 hover:from-blue-50 hover:to-indigo-50 rounded-xl border border-gray-200 hover:border-indigo-300 transition-all cursor-pointer"
            onClick={() => onSelectStation?.(station)}
          >
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
              #{index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-gray-900 text-base mb-1 truncate">
                {station.station_name || station.name || station.stationName || 'Station'}
              </div>
              {station.address && (
                <div className="text-gray-600 text-xs mb-2 flex items-start gap-1 line-clamp-2">
                  <span className="flex-shrink-0">📍</span>
                  <span className="truncate">{station.address}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-xs">
                <span className="text-indigo-600 font-semibold">
                  🚗 {station.distance.toFixed(2)} km
                </span>
                <span className="text-gray-500">
                  ⏱️ ~{Math.ceil(station.distance / 40 * 60)} min
                </span> 
              </div>
            </div>
            <div className="flex-shrink-0">
                <button className="px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-semibold rounded-lg shadow-md transition-all">
                Select
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {nearbyStations.length >= limit && (
        <div className="mt-4 text-center flex-shrink-0">
          <button className="text-indigo-600 hover:text-indigo-700 font-bold transition-colors text-sm">
            View all stations →
          </button>
        </div>
      )}
    </section>
  );
};

export default NearbyStationsSuggestions;
