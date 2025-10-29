import React, { useEffect, useState } from "react";
import { licenseAPI } from "../../api/api";

export default function StaffVerificationContainer() {
  const [licenses, setLicenses] = useState([]);

  useEffect(() => {
    loadPendingLicenses();
  }, []);

  const loadPendingLicenses = async () => {
    const data = await licenseAPI.getAll();
    setLicenses(data.filter((l) => l.status === "pending"));
  };

  const handleApprove = async (id) => {
    await licenseAPI.updateStatus(id, "approved");
    loadPendingLicenses();
  };

  const handleReject = async (id) => {
    const reason = prompt("Lý do từ chối:");
    await licenseAPI.updateStatus(id, "rejected", reason);
    loadPendingLicenses();
  };

  return (
    <div>
      <h2> Danh sách giấy phép chờ duyệt</h2>
      {licenses.length === 0 && <p>Không có giấy phép nào chờ duyệt.</p>}
      {licenses.map((l) => (
        <div key={l.id} className="border p-4 mb-2">
          <img src={l.license_url} alt="License" width={200} />
          <p>Người thuê: {l.renter_id}</p>
          <p>Gửi lúc: {new Date(l.submitted_at).toLocaleString()}</p>
          <button
            onClick={() => handleApprove(l.id)}
            className="btn btn-success"
          >
             Duyệt
          </button>
          <button onClick={() => handleReject(l.id)} className="btn btn-danger">
             Từ chối
          </button>
        </div>
      ))}
    </div>
  );
}