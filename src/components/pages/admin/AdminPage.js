import React from 'react';
import MyPage from '../MyPage/MyPage.js';

function AdminPage() {
  return (
    <div>
      <MyPage />
      
      <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
        <li style={{ marginBottom: '18px' }}>
          <a href="/memberList" style={{ fontSize: '16px', textDecoration: 'none', color: '#333' }}>회원 리스트</a>
        </li>
        <li style={{ marginBottom: '18px' }}>
          <a href="/admin/wiki" style={{ fontSize: '16px', textDecoration: 'none', color: '#333' }}>도감 승인</a>
        </li>
        <li style={{ marginBottom: '18px' }}>
          <a href="/mypage/blocks" style={{ fontSize: '16px', textDecoration: 'none', color: '#333' }}>차단 목록</a>
        </li>
        <li style={{ marginBottom: '18px' }}>
          <a href="/admin/reports" style={{ fontSize: '16px', textDecoration: 'none', color: '#333' }}>신고 목록</a>
        </li>
        <li style={{ marginBottom: '18px' }}>
          <a href="/admin/comment-reports" style={{ fontSize: '16px', textDecoration: 'none', color: '#333' }}>댓글 신고 목록</a>
        </li>
      </ul>
    </div>
  );
}

export default AdminPage;