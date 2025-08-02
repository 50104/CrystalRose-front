import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { noAuthAxios, axiosInstance } from '@utils/axios';
import { format, parseISO } from 'date-fns';
import { jwtDecode } from 'jwt-decode';
import Pagination from './Pagination';
import './List.css';

function formatDate(date) {
  return date ? format(parseISO(date), 'yy/MM/dd HH:mm') : '-';
}

function List() {
  const [fixedPosts, setFixedPosts] = useState([]);
  const [contents, setContents] = useState([]);
  const [totalPage, setTotalPage] = useState(1);
  const [isAdmin, setIsAdmin] = useState(false);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    const token = localStorage.getItem('access');
    if (token) {
      const decoded = jwtDecode(token);
      if (decoded.userRole === 'ROLE_ADMIN') {
        setIsAdmin(true);
      }
    }
  }, []);

  const toggleFixedPost = async (id) => {
    try {
      await axiosInstance.put(`/api/v1/admin/board/${id}/fix`);
      const res = await noAuthAxios.get(`/api/v1/board/list?page=${currentPage}`);
      const result = res.data;
      setFixedPosts(result.fixedList || []);
      setContents(Array.isArray(result.content) ? result.content : []);
    } catch (err) {
      console.error('에러 내용:', err.response || err);
      alert(err.response?.data?.message || '고정/해제 실패');
    }
  };

  useEffect(() => {
    noAuthAxios.get(`/api/v1/board/list?page=${currentPage}`)
      .then(res => {
        const data = res.data;
        setFixedPosts(data.fixedList || []);
        setContents(Array.isArray(data.content) ? data.content : []);
        setTotalPage(data.totalPage ?? 1);
      })
      .catch(err => console.error(err));
  }, [currentPage]);

  const handlePageChange = (page) => {
    navigate(`/list?page=${page}`);
  };

  const renderRow = (c, isFixed = false) => (
    <a key={c.boardNo} href={`/content/${c.boardNo}?page=${currentPage}`} className="table-row">
      <div className="col-category desktop-only">
        <span className="category-tag">{c.boardTag}</span>
      </div>
      <div className="col-title">
        <span className="category-tag mobile-only">{c.boardTag}</span>
        <span className="title-text">{c.boardTitle}</span>
        {isFixed && <span className="pin-icon">📌</span>}
        {c.commentCount > 0 && <span className="comment-count">[{c.commentCount}]</span>}
        {isAdmin && (
          <button
            className="pin-toggle-btn desktop-only"
            onClick={(e) => {
              e.preventDefault();
              toggleFixedPost(c.boardNo);
            }}
          >
            {isFixed ? '해제' : '고정'}
          </button>
        )}
        <div className="title-meta mobile-only">
          <span className="col-author">
            {c.writerStatus === 'DELETED' ? '탈퇴한 사용자' : c.writerNick}
            {isAdmin && (
              <button
                className="pin-toggle-btn"
                onClick={(e) => {
                  e.preventDefault();
                  toggleFixedPost(c.boardNo);
                }}
              >
                {isFixed ? '해제' : '고정'}
              </button>
            )}
          </span>
          <span className="col-date">{formatDate(c.createdDate)}</span>
        </div>
      </div>
      <div className="col-author desktop-only">{c.writerStatus === 'DELETED' ? '탈퇴한 사용자' : c.writerNick}</div>
      <div className="col-date desktop-only">{formatDate(c.createdDate)}</div>
      <div className="col-views desktop-only">{c.viewCount || 0}</div>
      <div className="col-likes desktop-only">{c.recommendCount || 0}</div>
    </a>
  );

  return (
    <div className="list-container">
      <h1 className="list-title">게시글 목록</h1>

      <div className="board-header">
        <div className="board-stats">
          {/* 전체 게시글 {contents.length}개 */}
        </div>
        <a href="/editor" className="write-btn">글쓰기</a>
      </div>

      <div className="board-table">
        <div className="table-header desktop-only">
          <div className="col-category">말머리</div>
          <div className="col-title">제목</div>
          <div className="col-author">작성자</div>
          <div className="col-date">작성일</div>
          <div className="col-views">조회수</div>
          <div className="col-likes">추천수</div>
        </div>

        <div className="table-body">
          {fixedPosts.map(post => renderRow(post, true))}
          {contents.map(post => renderRow(post))}
        </div>
      </div>

      <Pagination currentPage={currentPage} totalPage={totalPage} onPageChange={handlePageChange} />
    </div>
  );
}

export default List;
