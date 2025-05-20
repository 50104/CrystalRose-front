import React from 'react';
import './Pagination.css';

function Pagination({ currentPage, totalPage, onPageChange }) {
    const blockSize = 5;
    const blockStart = Math.floor((currentPage - 1) / blockSize) * blockSize + 1;
    const blockEnd = Math.min(blockStart + blockSize - 1, totalPage);

    const pages = [];
    for (let i = blockStart; i <= blockEnd; i++) {
        pages.push(i);
    }

    return (
        <div className="pagination">
            {blockStart > 1 && (
                <button onClick={() => onPageChange(blockStart - 1)}>◀ 이전</button>
            )}
            {pages.map(p => (
                <button
                    key={p}
                    onClick={() => onPageChange(p)}
                    className={p === currentPage ? 'active' : ''}
                >
                    {p}
                </button>
            ))}
            {blockEnd < totalPage && (
                <button onClick={() => onPageChange(blockEnd + 1)}>다음 ▶</button>
            )}
        </div>
    );
}

export default Pagination;
