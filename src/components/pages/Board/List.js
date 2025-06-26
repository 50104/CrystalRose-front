import React, { useEffect, useState } from 'react';
import Pagination from './Pagination';
import './List.css';
import { axiosInstance } from '@utils/axios';

function List() {
    const [contents, setContents] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);

    useEffect(() => {
        axiosInstance.get(`/board/list?page=${currentPage}`)
            .then(res => {
                setContents(res.data.content);
                setTotalPage(res.data.totalPage);
            })
            .catch(err => console.error(err));
    }, [currentPage]);

    return (
        <div className="list-container">
            <h1 className="list-title">게시글 목록</h1>
            <div className="board-header">
                <div className="board-stats">
                    전체 게시글 {contents.length}개
                </div>
                <a href="/editor" className="write-btn">
                    글쓰기
                </a>
            </div>
            <div className="board-table">
                <div className="table-header">
                    <div className="col-category">말머리</div>
                    <div className="col-title">제목</div>
                    <div className="col-author">작성자</div>
                    <div className="col-date">작성일</div>
                    <div className="col-views">조회수</div>
                    <div className="col-likes">추천순</div>
                </div>
                <div className="table-body">
                    {contents.map(c => (
                        <a key={c.boardNo} href={`/content/${c.boardNo}`} className="table-row">
                            <div className="col-category">
                                <span className="category-tag">{c.category || '일반'}</span>
                            </div>
                            <div className="col-title">
                                <span className="title-text">{c.boardTitle}</span>
                                {c.commentCount > 0 && (
                                    <span className="comment-count">[{c.commentCount}]</span>
                                )}
                            </div>
                            <div className="col-author">
                                {c.writerStatus === 'DELETED' ? '탈퇴한 사용자' : c.writerNick}
                            </div>
                            <div className="col-date">
                                {new Date(c.regDate).toLocaleDateString('ko-KR')}
                            </div>
                            <div className="col-views">{c.viewCount || 0}</div>
                            <div className="col-likes">{c.likeCount || 0}</div>
                        </a>
                    ))}
                </div>
            </div>
            <Pagination currentPage={currentPage} totalPage={totalPage} onPageChange={setCurrentPage} />
        </div>
    );
}

export default List;
