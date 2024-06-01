import React, { useRef, useState } from 'react';
import './SignIn.css';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import ResponseCode from '../../types/enums/ResponseCode';
import InputBox from '../../InputBox/InputBox';

function SignIn() {
    // 레퍼런스 객체
    const userIdRef = useRef(null);
    const userPwdRef = useRef(null);
    const [cookie, setCookies] = useCookies();
    // 상태값
    const [userId, setUserId] = useState('');
    const [userPwd, setUserPwd] = useState('');
    const [message, setMessage] = useState('');
    // navigate // 
    const navigate = useNavigate();
    const signInResponse = (responseBody) => {
        if (!responseBody)
            return;
        const { code } = responseBody;
        if (code === ResponseCode.VALIDATION_FAIL)
            alert('아이디와 비밀번호를 입력하세요.');
        if (code === ResponseCode.SIGN_IN_FAIL)
            setMessage('로그인 정보가 일치하지 않습니다.');
        if (code === ResponseCode.DATABASE_ERROR)
            alert('데이터베이스 오류입니다.');
        if (code !== ResponseCode.SUCCESS)
            return;
        const { token, expirationTime } = responseBody;
        const now = (new Date().getTime()) * 1000;
        const expires = new Date(now + expirationTime);
        setCookies('accessToken', token, { expires, path: '/' });
        navigate('/');
    };
    // onChange
    const onUserIdChangeHandler = (event) => {
        const { value } = event.target;
        setUserId(value);
        setMessage('');
    };
    const onUserPwdChangeHandler = (event) => {
        const { value } = event.target;
        setUserPwd(value);
        setMessage('');
    };
    const onSignUpButtonClickHandler = () => {
        navigate('/auth/sign-up');
    };
    const onSignInButtonClickHandler = () => {
        if (!userId || !userPwd) {
            alert('아이디와 비밀번호 모두 입력해주세요.');
            return;
        }
        const requestBody = { userId, userPwd };
        // SignInRequestDto(requestBody).then(signInResponse);
    };
    // OAuth 로그인 //
    const onSnsSignInButtonClickHandler = (type) => {
        // window.location.href = SNS_SIGN_IN_URL(type);
    };
    // key down
    const onUserIdKeyDownHandler = (event) => {
        if (event.key !== 'Enter')
            return;
        if (!userPwdRef.current)
            return;
        userPwdRef.current.focus();
    };
    const onUserPwdKeyDownHandler = (event) => {
        if (event.key !== 'Enter')
            return;
        onSignInButtonClickHandler();
    };
    // 로그인 버튼
    const signInButtonClass = userId && userPwd ?
    'primary-button-lg' : 'disable-button-lg';
    
    return (

    <div id='sign-in-wrapper'>
        <div className='sign-in-container'>
            <div className='sign-in-box'>
            <div className='sign-in-title'>{'빛나는 크리스퇄'}</div>
            <div className='sign-in-content-box'>
                <div className='sign-in-content-input-box'>
                <InputBox ref={userIdRef} title='아이디' placeholder='아이디를 입력해주세요.' type='text' value={userId} onChange={onUserIdChangeHandler} onKeyDown={onUserIdKeyDownHandler}/>
                <InputBox ref={userPwdRef} title='비밀번호' placeholder='비밀번호를 입력해주세요.' type='password' value={userPwd} onChange={onUserPwdChangeHandler} isErrorMessage message={message} onKeyDown={onUserPwdKeyDownHandler}/>        
                </div>
                <div className='sign-in-content-button-box'>
                <div className={`${signInButtonClass} full-width`}  onClick={onSignInButtonClickHandler}>로그인</div>
                <div className='text-link-lg full-width' onClick={onSignUpButtonClickHandler}>{'회원가입'}</div>
                </div>
                <div className='sign-in-content-divider'></div>
                <div className='sign-in-content-sns-sign-in-box'>
                <div className='sign-in-content-sns-sign-in-title'>{'SNS 로그인'}</div>
                <div className='sign-in-content-sns-sign-in-button-box'>
                    <div className='google-sign-in-button' onClick={() => onSnsSignInButtonClickHandler('google')}></div>
                    <div className='kakao-sign-in-button' onClick={() => onSnsSignInButtonClickHandler('kakao')}></div>
                    <div className='naver-sign-in-button' onClick={() => onSnsSignInButtonClickHandler('naver')}></div>
                </div>
                </div>
            </div>
            </div>
        </div>
    </div>
    );
}

export default SignIn;
