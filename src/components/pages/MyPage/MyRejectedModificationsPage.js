import React, { useEffect, useState } from 'react';
import { axiosInstance } from '@utils/axios';

export default function MyRejectedModificationsPage() {
  const [rejectedMods, setRejectedMods] = useState([]);

  useEffect(() => {
    axiosInstance.get('/api/v1/wiki/modification/rejected')
      .then(res => setRejectedMods(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="rejected-modifications-page">
      <h2>거절된 수정 요청</h2>
      {rejectedMods.length === 0 ? (
        <p>거절된 수정 요청이 없습니다.</p>
      ) : (
        <ul>
          {rejectedMods.map(mod => (
            <li key={mod.id}>
              <h3>{mod.originalName || mod.name}</h3>
              <p><strong>거절 사유:</strong> {mod.description}</p>
              <p><strong>요청일:</strong> {new Date(mod.createdDate).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
