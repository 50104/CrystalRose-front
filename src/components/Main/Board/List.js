import React, { useState, useEffect } from 'react';
import axios from 'axios';

function List() {
    const [contents, setContents] = useState([]);

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_URL}/board/list`)
            .then(response => {
                setContents(response.data.ContentList);
            })
            .catch(error => {
                console.error('불러오기 오류', error);
            });
    }, []);

    return (
        <div>
            <h1>글목록</h1>
            {contents.map(content => (
                <div key={content.boardNo}>
                    <a href={`/content/${content.boardNo}`}>{content.boardTitle}</a><br/>
                </div>
            ))}
        </div>
    );
}

export default List;
