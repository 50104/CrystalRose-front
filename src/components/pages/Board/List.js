import React, { useEffect, useState } from 'react';
import Pagination from './Pagination';
import { noAuthAxios } from '@utils/axios';
import { format, parseISO } from 'date-fns';
import './List.css';

function formatDate(date) {
  return date ? format(parseISO(date), 'yy/MM/dd HH:mm') : '-';
}

function List() {
  const [contents, setContents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);

  useEffect(() => {
    noAuthAxios.get(`/api/v1/board/list?page=${currentPage}`)
      .then(res => {
        setContents(Array.isArray(res.data.content) ? res.data.content : []);
        setTotalPage(res.data.totalPage ?? 1);
      })
      .catch(err => console.error(err));
  }, [currentPage]);

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
          {contents.map(c => (
            <a key={c.boardNo} href={`/content/${c.boardNo}`} className="table-row">
              <div className="col-category desktop-only">
                <span className="category-tag">{c.boardTag}</span>
              </div>

              <div className="col-title">
                <span className="category-tag mobile-only">{c.boardTag}</span>
                <span className="title-text">{c.boardTitle}</span>
                {c.commentCount > 0 && <span className="comment-count">[{c.commentCount}]</span>}

                <div className="title-meta mobile-only">
                  <span className="col-author">{c.writerStatus === 'DELETED' ? '탈퇴한 사용자' : c.writerNick}</span>
                  <span className="col-date">{formatDate(c.createdDate)}</span>
                </div>
              </div>

              <div className="col-author desktop-only">
                {c.writerStatus === 'DELETED' ? '탈퇴한 사용자' : c.writerNick}
              </div>
              <div className="col-date desktop-only">{formatDate(c.createdDate)}</div>
              <div className="col-views desktop-only">{c.viewCount || 0}</div>
              <div className="col-likes desktop-only">{c.recommendCount || 0}</div>
            </a>
          ))}
        </div>
      </div>

      <Pagination currentPage={currentPage} totalPage={totalPage} onPageChange={setCurrentPage} />
    </div>
  );
}

export default List;
