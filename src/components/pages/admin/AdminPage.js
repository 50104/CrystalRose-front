import React from 'react';
import MyPage from '../MyPage/MyPage.js';
import './AdminPage.css';

function AdminPage() {
  return (
    <div className="admin-page">
      <MyPage />
      
      <div className="admin-menu">
        <h2 className="admin-menu-title">관리자 메뉴</h2>
        <a href="/memberList" className="admin-menu-item">회원 리스트</a>
        <a href="/admin/wiki" className="admin-menu-item">도감 승인</a>
        <a href="/mypage/blocks" className="admin-menu-item">차단 목록</a>
        <a href="/admin/reports" className="admin-menu-item">신고 목록</a>
        <a href="/admin/comment-reports" className="admin-menu-item">댓글 신고 목록</a>
      </div>
    </div>
  );
}

export default AdminPage;