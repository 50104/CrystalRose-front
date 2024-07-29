import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function Content() {
    const { boardNo } = useParams();
    const [content, setContent] = useState(null);

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_URL}/board/content/${boardNo}`)
            .then(response => {
                setContent(response.data.Content);
            })
            .catch(error => {
                console.error('불러오기 오류', error);
            });
    }, [boardNo]);

    if (!content) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>Content</h1><br />
            {content.boardTitle}<br />
            <hr />
            <br />
            <div dangerouslySetInnerHTML={{ __html: content.boardContent }} /><br />
        </div>
    );
}

export default Content;
