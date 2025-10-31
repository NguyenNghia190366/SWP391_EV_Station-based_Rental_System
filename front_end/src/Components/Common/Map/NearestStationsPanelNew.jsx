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
    <div className="nearest-panel">
      <h4>️ Tìm trạm thuê xe gần nhất</h4>
      <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>
        Nhập tọa độ hoặc sử dụng vị trí hiện tại của bạn
      </p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <input placeholder="Vĩ độ (Latitude)" value={lat} onChange={(e) => setLat(e.target.value)} style={{ flex: 1 }} />
        <input placeholder="Kinh độ (Longitude)" value={lng} onChange={(e) => setLng(e.target.value)} style={{ flex: 1 }} />
      </div>
      <div className="nearest-controls">
        <button onClick={handleFindByCoords} disabled={loading || nearestSearching} className="btn-primary">{loading ? '' : ' Tìm theo toạ độ'}</button>
        <button onClick={handleUseMyLocation} disabled={loading || nearestSearching} className="btn-ghost">{loading ? '' : ' Vị trí của tôi'}</button>
      </div>

      {nearestStation ? (
        <div className="result">
          <strong>{nearestStation.station?.station_name || nearestStation.station?.name || 'Trạm'}</strong>
          <div className="distance">Khoảng cách: {(nearestStation.distanceKm ?? 0).toFixed ? (nearestStation.distanceKm).toFixed(2) + ' km' : `${nearestStation.distanceKm} km`}</div>
          {nearestStation.station?.address && <div className="address">{nearestStation.station.address}</div>}
        </div>
      ) : (
        <div className="empty">Chưa có kết quả. Hãy tìm bằng vị trí của bạn hoặc nhập kinh/vĩ.</div>
      )}
    </div>
  );
};

export default NearestStationsPanelNew;
