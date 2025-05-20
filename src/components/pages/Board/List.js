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
            <h1 className="list-title">🌹 게시글 목록</h1>
            <div className="card-grid">
                {contents.map(c => (
                    <a key={c.boardNo} href={`/content/${c.boardNo}`} className="card">
                        <h2 className="card-title">{c.boardTitle}</h2>
                        <p className="card-author">작성자: {c.userId}</p>
                    </a>
                ))}
            </div>
            <Pagination currentPage={currentPage} totalPage={totalPage} onPageChange={setCurrentPage} />
        </div>
    );
}

export default List;
