import React, { useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { useNavigate, useParams } from 'react-router-dom';

function OAuth() {
    
    const { token, expirationTime } = useParams();
    const [cookie, setCookies] = useCookies();
    const navigate = useNavigate();
    useEffect(() => {
        // oauth 토큰 전달해주기 //
        if (!token || !expirationTime)
            return;
        const now = (new Date().getTime()) * 1000;
        const expires = new Date(now + Number(expirationTime));
        setCookies('accessToken', token, { expires, path: '/' });
        navigate('/');
    }, [token]);
    return (<></>);
}

export default OAuth;