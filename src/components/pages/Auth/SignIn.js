import React, { useState } from 'react';
import './SignIn.css';
import '../../common/InputBox.css';
import InputBox from '@components/common/InputBox';
import { noAuthAxios } from '@utils/axios';

function SignIn() {

    const [userId, setUserId] = useState('');
    const [userPwd, setUserPwd] = useState('');

    const [userIdMessage, setUserIdMessage] = useState('');
    const [userPwdMessage, setUserPwdMessage] = useState('');

    const [isUserIdError, setUserIdError] = useState(false);
    const [isUserPwdError, setUserPwdError] = useState(false);

    const userPwdPattern = /^(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z!@#$%^&*]{8,13}$/; // '!@#$%^&*'
    const userIdPattern = /^(?=.*[a-zA-Z])[-a-zA-Z0-9_.]{5,10}$/;

    // 아이디 입력 시 상태 업데이트 핸들러
    const handleUserId = (e) => {
        const { value } = e.target;
        setUserId(value);
        setUserIdMessage('');
        if (!userIdPattern.test(value)) {
            setUserIdError(true);
            setUserIdMessage('문자, 숫자 포함 5~10자리로 입력해주세요.');
        } else {
            setUserIdError(false);
            setUserIdMessage('');
        }
    };

    // 비밀번호 입력 시 상태 업데이트 핸들러
    const handleUserPwd = (e) => {
        const { value } = e.target;
        setUserPwd(value);
        setUserPwdMessage('');
        if(!userPwdPattern.test(value)) {
            setUserPwdError(true);
            setUserPwdMessage('영문, 숫자 포함 8자 이상으로 입력해주세요.');
        } else{
            setUserPwdError(false);
        }
    };

    // key down
    const onKeyDownHandler = (event) => {
        if(event.key !== 'Enter') return;
        onSignInButtonClickHandler(event);
    };

    // OAuth
    const onSnsSignInButtonClickHandler = (type) => {
        const redirectUri = window.location.origin;
        window.location.href = `${process.env.REACT_APP_API_URL}/api/v1/auth/oauth2/${type}?redirect_uri=${redirectUri}`;
    };

    // 로그인 버튼
    const signInButtonClass = userId && userPwd ? 'primary-button-lg' : 'disable-button-lg';

    const onSignInButtonClickHandler = async (e) => {
        e.preventDefault();
        if (!userId || !userPwd) {
            alert('아이디와 비밀번호 모두 입력해주세요.');
            return;
        }
        try {
            let formData = new FormData();
            formData.append('userId', userId);
            formData.append('userPwd', userPwd);

            const response = await noAuthAxios.post(`/api/v1/auth/login`, formData);

            const authorizationHeader = response.headers['authorization'];
            const accessToken = authorizationHeader?.split(' ')[1];

            const withdrawalHeader = response.headers['withdrawal'];
            const isWithdrawal = withdrawalHeader === 'true';

            if (!accessToken) {
                alert("access 토큰을 받아오지 못했습니다.");
                return;
            }

            localStorage.setItem('access', accessToken);

            if (isWithdrawal) {
                const confirmUndo = window.confirm("탈퇴 요청된 계정입니다. 철회하시겠습니까?");
                if (confirmUndo) {
                    try {
                        const cancelResponse = await noAuthAxios.put(
                            `/api/v1/auth/withdraw/cancel`
                        );
                        alert(cancelResponse.data);
                        localStorage.removeItem("access");
                        window.location.reload();
                        return;
                    } catch (e) {
                        alert("탈퇴 철회 중 오류 발생");
                        console.error(e);
                        return;
                    }
                } else { // 철회 안 하고 나가는 경우
                    localStorage.removeItem("access");
                    return;
                }
            }

            window.location.href = '/';
        } catch (error) {
            if (error.response?.status === 401) {
                alert('아이디 혹은 비밀번호가 틀렸습니다.');
            } else if (error.response?.status === 403 && error.response?.data === "삭제된 계정입니다.") {
                alert('삭제된 계정입니다. 로그인할 수 없습니다.');
            } else {
                alert('서버 오류');
            }
            console.error('로그인 오류:', error.response ? error.response.data : error.message);
        }
    };

    return (
        <div id='sign-in-wrapper'>
        <div className='sign-in-image'></div>
        <div className='sign-in-container'>
            <div className='sign-in-box'>
            <div className='sign-in-title'>{'빛나는 크리스퇄 로그인'}</div>
            <div className='sign-in-content-box'>
                <div className='sign-in-content-input-box'>
                <InputBox title='아이디' id="userId" name="userId" autoComplete="userId" required placeholder='아이디를 입력해주세요.' type='text' value={userId} isErrorMessage={isUserIdError} message={userIdMessage} onChange={handleUserId} />
                <InputBox title='비밀번호' id="userPwd" name="userPwd" autoComplete="userPwd" required placeholder='비밀번호를 입력해주세요.' type='password' value={userPwd} onChange={handleUserPwd} onKeyDown={onKeyDownHandler} isErrorMessage={isUserPwdError} message={userPwdMessage} />       
                </div>
                <div className='sign-in-content-button-box'>
                <div className={`${signInButtonClass} full-width`}  onClick={onSignInButtonClickHandler}>로그인</div>
                <div className="link-container">
                    <div className='text-link-lg'><a href="/findId">아이디 찾기</a></div>
                    <div className='text-link-lg'><a href="/findPwd">비밀번호 찾기</a></div>
                    <div className='text-link-lg'><a href="/join">회원가입</a></div>
                </div>
                </div>
                <div className='sign-in-content-divider'></div>
                <div className='sign-in-content-sns-sign-in-box'>
                <div className='sign-in-content-sns-sign-in-title'>{'SNS 로그인'}</div>
                <div className='sign-in-content-sns-sign-in-button-box'>
                    <div className='google-sign-in-button' onClick={() => onSnsSignInButtonClickHandler('google')}></div>
                    <div className='kakao-sign-in-button' onClick={() => onSnsSignInButtonClickHandler('kakao')} ></div>
                    <div className='naver-sign-in-button' onClick={() => onSnsSignInButtonClickHandler('naver')} ></div>
                </div>
                </div>
            </div>
            </div>
        </div>
        </div>
    )
}

export default SignIn;
