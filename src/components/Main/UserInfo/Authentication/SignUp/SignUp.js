import React, { useRef, useState } from 'react';
import './SignUp.css';
import InputBox from '../../InputBox/InputBox';
import ResponseCode from '../../types/enums/ResponseCode';
import { useNavigate } from 'react-router-dom';
import { SNS_SIGN_IN_URL, checkCertificationRequest, userEmailCertificationRequest, userIdCheckRequest, signUpRequest } from '../index';

// ts 변환
function SignUp() {

    // 레퍼런스 객체
    const userIdRef = useRef(null);
    const userPwdRef = useRef(null);
    const userPwdCheckRef = useRef(null);
    const userEmailRef = useRef(null);
    const certificationNumberRef = useRef(null);

    // 상태값
    const [userId, setUserId] = useState('');
    const [userPwd, setUserPwd] = useState('');
    const [userPwdCheck, setUserPwdCheck] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [certificationNumber, setCertificationNumber] = useState('');

    // 에러 상태 값
    const [isUserIdError, setUserIdError] = useState(false);
    const [isUserPwdError, setUserPwdError] = useState(false);
    const [isUserPwdCheckError, setUserPwdCheckError] = useState(false);
    const [isUserEmailError, setUserEmailError] = useState(false);
    const [isCertificationNumberError, setCertificationNumberError] = useState(false);

    // 메세지 상태 값
    const [userIdMessage, setUserIdMessage] = useState('');
    const [userPwdMessage, setUserPwdMessage] = useState('');
    const [userPwdCheckMessage, setUserPwdCheckMessage] = useState('');
    const [userEmailMessage, setUserEmailMessage] = useState('');
    const [certificationNumberMessage, setCertificationNumberMessage] = useState('');
    const [isUserIdCheck, setUserIdCheck] = useState(false);
    const [isCertificationCheck, setCertificationCheck] = useState(false);

    // 회원가입 버튼
    const signUpButtonClass = userId && userPwd && userPwdCheck && userEmail && certificationNumber ?
        'primary-button-lg' : 'disable-button-lg';

    // 이메일 패턴
    const userEmailPattern = /^[a-zA-Z0-9]*@([-.]?[a-zA-Z0-9]*\.[a-zA-Z]{2,4})$/;
    // 비밀번호 패턴
    const userPwdPattern = /^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]{8,13}$/;
    // navigate 
    const navigate = useNavigate();

    // 아이디 중복 response
    const userIdCheckResponse = (responseBody) => {
        if (!responseBody)
            return;
        const { code } = responseBody;
        if (code === ResponseCode.VALIDATION_FAIL)
            alert('아이디를 입력하세요.');
        if (code === ResponseCode.DUPLICATION_ID) {
            setUserIdError(true);
            setUserIdMessage('이미 사용중인 아이디입니다.');
            setUserIdCheck(false);
        }
        if (code === ResponseCode.DATABASE_ERROR)
            alert('데이터베이스 오류입니다.');
        if (code !== ResponseCode.SUCCESS)
            return;
        setUserIdError(false);
        setUserIdMessage('사용 가능한 아이디입니다.');
        setUserIdCheck(true);
    };

    const userEmailCertificationResponse = (responseBody) => {
        if (!responseBody)
            return;
        const { code } = responseBody;
        if (code === ResponseCode.VALIDATION_FAIL)
            alert('아이디와 이메일을 모두 입력하세요.');
        if (code === ResponseCode.DUPLICATION_ID) {
            setUserIdError(true);
            setUserIdMessage('이미 사용중인 아이디입니다.');
            setUserIdCheck(false);
        }
        if (code === ResponseCode.MAIL_FAIL)
            alert('이메일 전송에 실패했습니다.');
        if (code === ResponseCode.DATABASE_ERROR)
            alert('데이터베이스 오류입니다.');
        if (code !== ResponseCode.SUCCESS)
            return;
        setUserEmailError(false);
        setUserEmailMessage('인증번호가 전송되었습니다.');
    };

    const checkCertificationResponse = (responseBody) => {
        if (!responseBody)
            return;
        const { code } = responseBody;
        if (code === ResponseCode.VALIDATION_FAIL)
            alert('아이디, 이메일, 인증번호를 모두 입력하세요.');
        if (code === ResponseCode.CERTIFICATION_FAIL) {
            setCertificationNumberError(true);
            setCertificationNumberMessage('인증번호가 일치하지않습니다.');
            setCertificationCheck(false);
        }
        if (code === ResponseCode.DATABASE_ERROR)
            alert('데이터베이스 오류입니다.');
        if (code !== ResponseCode.SUCCESS)
            return;
        setCertificationNumberError(false);
        setCertificationNumberMessage('인증번호가 확인되었습니다.');
        setCertificationCheck(true);
    };

    const signUpResponse = (responseBody) => {
        if (!responseBody)
            return;
        const { code } = responseBody;
        if (code === ResponseCode.VALIDATION_FAIL)
            alert('모든 값을 입력하세요.');
        if (code === ResponseCode.DUPLICATION_ID) {
            setUserIdError(true);
            setUserIdMessage('이미 사용중인 아이디입니다.');
            setUserIdCheck(false);
        }
        if (code === ResponseCode.CERTIFICATION_FAIL) {
            setCertificationNumberError(true);
            setCertificationNumberMessage('인증번호가 일치하지않습니다.');
            setCertificationCheck(false);
        }
        if (code === ResponseCode.DATABASE_ERROR)
            alert('데이터베이스 오류입니다.');
        if (code !== ResponseCode.SUCCESS)
            return;
        navigate('/auth/sign-in');
    };

    // onChange
    const onUserIdChangeHandler = (event) => {
        const { value } = event.target;
        setUserId(value);
        setUserIdMessage('');
        setUserIdCheck(false);
    };
    const onUserPwdChangeHandler = (event) => {
        const { value } = event.target;
        setUserPwd(value);
        setUserPwdMessage('');
    };
    const onUserPwdCheckChangeHandler = (event) => {
        const { value } = event.target;
        setUserPwdCheck(value);
        setUserPwdCheckMessage('');
    };
    const onUserEmailChangeHandler = (event) => {
        const { value } = event.target;
        setUserEmail(value);
        setUserEmailMessage('');
    };
    const onCertificationNumberChangeHandler = (event) => {
        const { value } = event.target;
        setCertificationNumber(value);
        setCertificationNumberMessage('');
        setCertificationCheck(false);
    };

    // button handler
    const onUserIdButtonClickHandler = () => {
        if (!userId)
            return;
        const requestBody = { userId };
        userIdCheckRequest(requestBody).then(userIdCheckResponse);
    };
    const onUserEmailButtonClickHandler = () => {
        if (!userId || !userEmail)
            return;
        const checkedUserEmail = userEmailPattern.test(userEmail);
        if (!checkedUserEmail) {
            setUserEmailError(true);
            setUserEmailMessage('이메일 형식이 아닙니다.');
            return;
        }
        const requestBody = { userId, userEmail };
        userEmailCertificationRequest(requestBody).then(userEmailCertificationResponse);
        setUserEmailError(false);
        setUserEmailMessage('이메일 전송 중...');
    };
    const onCertificationNumberButtonClickHandler = () => {
        if (!userId || !userEmail || !certificationNumber)
            return;
        const requestBody = { userId, userEmail, certificationNumber };
        checkCertificationRequest(requestBody).then(checkCertificationResponse);
    };
    const onSignUpButtonClickHandler = () => {
        if (!userId || !userPwd || !userPwdCheck || !userEmail || !certificationNumber)
            return;
        if (!isUserIdCheck) {
            alert('중복 확인은 필수입니다.');
            return;
        }
        const checkedPassword = userPwdPattern.test(userPwd);
        if (!checkedPassword) {
            setUserPwdError(true);
            setUserPwdMessage('영문, 숫자를 혼용하여 8~13자 입력해주세요.');
            return;
        }
        if (userPwd !== userPwdCheck) {
            setUserPwdCheckError(true);
            setUserPwdCheckMessage('비밀번호가 일치하지않습니다.');
            return;
        }
        if (!isCertificationCheck) {
            alert('이메일 인증이 필수입니다.');
            return;
        }
        const requestBody = { userId, userPwd, userEmail, certificationNumber };
        signUpRequest(requestBody).then(signUpResponse);
    };
    const onSignInButtonClickHandler = () => {
        navigate('/auth/sign-in');
    };

    // OAuth 로그인 //
    const onSnsSignInButtonClickHandler = (type) => {
        window.location.href = SNS_SIGN_IN_URL(type);
    };

    // key down
    const onUserIdKeyDownHandler = (event) => {
        if (event.key !== 'Enter')
            return;
        onUserIdButtonClickHandler();
    };
    const onUserPwdKeyDownHandler = (event) => {
        if (event.key !== 'Enter')
            return;
        if (!userPwdCheckRef.current)
            return;
        userPwdCheckRef.current.focus();
    };
    const onUserPwdCheckKeyDownHandler = (event) => {
        if (event.key !== 'Enter')
            return;
        if (!userEmailRef.current)
            return;
        userEmailRef.current.focus();
    };
    const onUserEmailKeyDownHandler = (event) => {
        if (event.key !== 'Enter')
            return;
        onUserEmailButtonClickHandler();
    };
    const onCertificationNumberKeyDownHandler = (event) => {
        if (event.key !== 'Enter')
            return;
        onCertificationNumberButtonClickHandler();
    };

    return (
    
    <div id='sign-up-wrapper'>
        <div className='sign-up-image'></div>
            <div className='sign-up-container'>
                <div className='sign-up-box'>
                <div className='sign-up-title'>{'빛나는 크리스퇄'}</div>
                <div className='sign-up-content-box'>
                    <div className='sign-up-content-sns-sign-in-box'>
                    <div className='sign-up-content-sns-sign-in-title'>{'SNS 회원가입'}</div>
                    <div className='sign-up-content-sns-sign-in-button-box'>
                        <div className='google-sign-in-button' onClick={() => onSnsSignInButtonClickHandler('google')}></div>
                        <div className='kakao-sign-in-button' onClick={() => onSnsSignInButtonClickHandler('kakao')}></div>
                        <div className='naver-sign-in-button' onClick={() => onSnsSignInButtonClickHandler('naver')}></div>
                    </div>
                    </div>
                    <div className='sign-up-content-divider'></div>
                    <div className='sign-up-content-input-box'>
                        <InputBox ref={userIdRef} title='아이디' placeholder='아이디를 입력해주세요.' type='text' value={userId} onChange={onUserIdChangeHandler} isErrorMessage={isUserIdError} message={userIdMessage} buttonTitle='중복 확인' onButtonClick={onUserIdButtonClickHandler} onKeyDown={onUserIdKeyDownHandler}/>

                        <InputBox ref={userPwdRef} title='비밀번호' placeholder='비밀번호를 입력해주세요.' type='password' value={userPwd} onChange={onUserPwdChangeHandler} isErrorMessage={isUserPwdError} message={userPwdMessage} onKeyDown={onUserPwdKeyDownHandler}/>

                        <InputBox ref={userPwdCheckRef} title='비밀번호 확인' placeholder='비밀번호를 입력해주세요.' type='password' value={userPwdCheck} onChange={onUserPwdCheckChangeHandler} isErrorMessage={isUserPwdCheckError} message={userPwdCheckMessage} onKeyDown={onUserPwdCheckKeyDownHandler}/>

                        <InputBox ref={userEmailRef} title='이메일' placeholder='이메일 주소를 입력해주세요.' type='text' value={userEmail} onChange={onUserEmailChangeHandler} isErrorMessage={isUserEmailError} message={userEmailMessage} buttonTitle='이메일 인증' onButtonClick={onUserEmailButtonClickHandler} onKeyDown={onUserEmailKeyDownHandler}/>
                        
                        <InputBox ref={certificationNumberRef} title='인증번호' placeholder='인증번호 4자리를 입력해주세요.' type='text' value={certificationNumber} onChange={onCertificationNumberChangeHandler} isErrorMessage={isCertificationNumberError} message={certificationNumberMessage} buttonTitle='인증 확인' onButtonClick={onCertificationNumberButtonClickHandler} onKeyDown={onCertificationNumberKeyDownHandler}/>
                    </div>
                    <div className='sign-up-content-button-box'>
                    <div className={`${signUpButtonClass} full-width`} onClick={onSignUpButtonClickHandler}>{'회원가입'}</div>
                    <div className='text-link-lg full-width' onClick={onSignInButtonClickHandler}>{'로그인'}</div>
                </div>
            </div>
            </div>
        </div>
    </div>
    );
}

export default SignUp;