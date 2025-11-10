import React, { useState } from 'react';

const NearestStationsPanelNew = ({ onFindNearest, nearestStation, nearestSearching }) => {
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUseMyLocation = async () => {
    if (!navigator.geolocation) return alert('Geolocation không khả dụng trên trình duyệt này');
    setLoading(true);
    try {
      const pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true, timeout: 10000 }));
      const latitude = pos.coords.latitude; const longitude = pos.coords.longitude;
      setLat(String(latitude)); setLng(String(longitude));
      await onFindNearest?.({ lat: latitude, lng: longitude });
    } catch (err) {
      console.error(err);
      alert('Không thể lấy vị trí của bạn: ' + (err?.message || err));
    } finally {
      setLoading(false);
    }
  };

  const handleFindByCoords = async (e) => {
    e?.preventDefault?.();
    const parsedLat = parseFloat(lat); const parsedLng = parseFloat(lng);
    if (Number.isNaN(parsedLat) || Number.isNaN(parsedLng)) return alert('Vui lòng nhập toạ độ hợp lệ');
    setLoading(true);
    try {
      await onFindNearest?.({ lat: parsedLat, lng: parsedLng });
    } catch (err) {
      console.error(err);
      alert('Tìm trạm gần nhất thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm bg-white text-gray-900 p-4 border border-gray-200 rounded-xl shadow-lg box-border">
      <h4 className="text-base font-bold text-gray-900 mb-3">️ Tìm trạm thuê xe gần nhất</h4>
      <p className="text-sm text-gray-500 mb-3">
        Nhập tọa độ hoặc sử dụng vị trí hiện tại của bạn
      </p>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <input 
          placeholder="Vĩ độ (Latitude)" 
          value={lat} 
          onChange={(e) => setLat(e.target.value)} 
          className="p-2.5 border border-gray-300 rounded-2xl outline-none text-sm bg-white transition-all focus:border-blue-500 focus:shadow-lg"
        />
        <input 
          placeholder="Kinh độ (Longitude)" 
          value={lng} 
          onChange={(e) => setLng(e.target.value)} 
          className="p-2.5 border border-gray-300 rounded-2xl outline-none text-sm bg-white transition-all focus:border-blue-500 focus:shadow-lg"
        />
      </div>
      <div className="flex gap-2 mb-3">
        <button 
          onClick={handleFindByCoords} 
          disabled={loading || nearestSearching} 
          className="flex-1 px-3.5 py-2.5 bg-blue-600 text-white border border-blue-400 rounded-2xl font-bold text-sm cursor-pointer transition-all hover:translate-y-[-1px] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? '' : ' Tìm theo toạ độ'}
        </button>
        <button 
          onClick={handleUseMyLocation} 
          disabled={loading || nearestSearching} 
          className="flex-1 px-3.5 py-2.5 bg-transparent text-blue-600 border border-blue-400 rounded-2xl font-bold text-sm cursor-pointer transition-all hover:bg-blue-50 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? '' : ' Vị trí của tôi'}
        </button>
      </div>

      {nearestStation ? (
        <div className="mt-2 p-3 rounded-2xl bg-gradient-to-b from-white to-blue-50 border border-gray-100 shadow-sm">
          <strong className="block mb-1.5 text-base">{nearestStation.station?.station_name || nearestStation.station?.name || 'Trạm'}</strong>
          <div className="text-sm text-gray-500 mb-1.5">Khoảng cách: {(nearestStation.distanceKm ?? 0).toFixed ? (nearestStation.distanceKm).toFixed(2) + ' km' : `${nearestStation.distanceKm} km`}</div>
          {nearestStation.station?.address && <div className="text-sm text-gray-500">{nearestStation.station.address}</div>}
        </div>
      ) : (
        <div className="mt-2 text-sm text-gray-500">Chưa có kết quả. Hãy tìm bằng vị trí của bạn hoặc nhập kinh/vĩ.</div>
      )}
    </div>
  );
};

export default NearestStationsPanelNew;
