import React from 'react';
import './MyRejectedModificationsPage.css';

export default function MyRejectedWikisList({ rejectedList, pendingList, loading, formatDate }) {
  if (loading) {
    return (
      <div className="rejected-modification-container">
        <p>도감 목록을 불러오는 중</p>
      </div>
    );
  }

  return (
    <div className="my-modifications-container">
      {/* 거절된 도감 목록 */}
      <section className="modification-section">
        <h2 className="pending-title">거절된 도감 목록</h2>
        {rejectedList.length === 0 ? (
          <div className="no-entries">거절된 도감이 없습니다.</div>
        ) : (
          <div className="entries-list">
            {rejectedList.map((item) => (
              <div key={item.id} className="entry-card">
                <div className="entry-header">
                  <div className="entry-info">
                    <h3 className="entry-name">{item.name}</h3>
                    <span className="entry-date">{formatDate(item.createdDate)}</span>
                  </div>
                </div>
                <div className="entry-details">
                  <div className="modification-details">
                    <p>거절 사유</p>
                    <div className="reason-text">{item.description || '사유가 제공되지 않았습니다.'}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 제출된 도감 목록 */}
      <section className="modification-section">
        <h2 className="pending-title">제출된 도감 목록</h2>
        {pendingList && pendingList.length === 0 ? (
          <div className="no-entries">제출된 도감이 없습니다.</div>
        ) : (
          <div className="entries-list">
            {pendingList && pendingList.map((item) => (
              <div key={item.id} className="entry-card">
                <div className="entry-header">
                  <div className="entry-info">
                    <h3 className="entry-name">{item.name}</h3>
                    <span className="entry-date">{formatDate(item.createdDate)}</span>
                  </div>
                </div>
                <div className="entry-details">
                  <div className="modification-details">
                    <p>제출 사유</p>
                    <div className="reason-text">{item.description || '사유가 제공되지 않았습니다.'}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
