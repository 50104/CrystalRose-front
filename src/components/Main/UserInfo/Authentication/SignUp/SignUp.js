import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import InputBox from '../../InputBox/InputBox';
import ResponseCode from '../../types/enums/ResponseCode';
import './SignUp.css';

function SignUp() {

    const location = useLocation();
    const navigate = useNavigate();

    const [user, setUser] = useState({
        userId:'',
        userEmail: '',
        userPw: '',
        certificationNumber:''
    });

    // 에러메세지
    const [userIdError, setUserIdError] = useState(false); // 이메일 형식
    const [userEmailError, setUserEmailError] = useState(false); // 이메일 형식
    const [userPwdError, setUserPwdError] = useState(false); // 비밀번호 형식
    const [userPwdError2, setUserPwdError2] = useState(false); // 비밀번호 일치 여부

    const [userEmailFilled, setUserEmailFilled] = useState(false); // 이메일 입력값 여부
    const [userPwdFilled, setUserPwdFilled] = useState(false); // 비밀번호 입력값 여부
    const [userPwdFilled2, setUserPwdFilled2] = useState(false); // 비밀번호 확인 입력값 여부

    // 중복 여부 상태 설정
    const [duplicateUserId, setDuplicateUserId] = useState(false); // 아이디 중복 확인
    const [duplicateUserEmail, setDuplicateUserEmail] = useState(false); // 이메일 중복 확인

    //소셜 코드
    const [code, setCode] = useState('');

    useEffect(() => { // ★★★★★★★★★★★★★★★
        const searchParams = new URLSearchParams(location.search);
        const email = searchParams.get('email');
        const code = searchParams.get('code');
    
        if (email) {
            setUser({ ...user, userEmail: email });
        }
    
        if (code) {
            setCode(code);
        }
    }, [location.search]);

    useEffect(() => {
    
        // userId 중복 확인
        const checkDuplicateUserId = async () => {
            try {
            const response = await axios.post('http://localhost:4000/api/user/auth/checkUserId', {
                userId: user.userId,
            });
            setDuplicateUserId(response.data); // 중복된 전화번호 여부 설정
            } catch (error) {
            console.error('전화번호 중복 에러:', error);
            }
        };

        // userEmail 중복 확인
        const checkDuplicateUserEmail = async () => {
            try {
            const response = await axios.post('http://localhost:4000/api/user/auth/checkUserEmail', {
                userEmail: user.userEmail,
            });
            setDuplicateUserEmail(response.data);
            } catch (error) {
            console.error('이메일 중복 에러:', error);
            }
        };
    
        // 값이 입력되면 중복 체크
        if (user.userId.trim() !== '') {
            checkDuplicateUserId();
        }

        if (user.userEmail.trim() !== '') {
            checkDuplicateUserEmail();

        }
    }, [user.userId, user.userEmail]);

    // 인풋 값 변화 핸들링
    const handleChange = (e) => {
        const { userId, value } = e.target;
        setUser({ ...user, [userId]: value });
    
        // 아이디 형식 검사
        if (userId === 'userId') {
            const isValidEmail = /^[^\s@]+$/.test(value);
            setUserEmailError(!isValidEmail);
        }
    
        // 이메일 형식 검사 (@ 포함)
        if (userId === 'userEmail') {
            const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            setUserEmailError(!isValidEmail);
        }
    
        // 비밀번호 형식 검사 (특수문자 포함 8~16자만 가능)
        if (userId === 'userPwd') {
            const isValidUserPwd = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&_])[A-Za-z\d$@$!%*#?&_]{8,16}$/.test(value);
            setUserPwdError(!isValidUserPwd);
        }
    
        // 비밀번호 일치 여부 확인
        if (userId === 'userPw2') {
            setUserPwdError2(value !== user.userPw);
        }
    
        // 입력값이 있는지 확인
        if (userId === 'userEmail') {
            setUserEmailFilled(value.trim() !== '');
        } else if (userId === 'userPw') {
            setUserPwdFilled(value.trim() !== '');
        } else if (userId === 'userPw2') {
            setUserPwdFilled2(value.trim() !== '');
        }
    };

    // 회원가입 제출
    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // 이메일, 전화번호 중복 및 입력값이 없는 경우 리턴
        if (duplicateUserEmail || !userEmailFilled || !userPwdFilled || !userPwdFilled2) {
            return;
        }
    
        try {
            await axios.post('http://localhost:4000/api/user/auth/join', user);
            useNavigate.push('/joinComplete'); // 회원가입 완료 페이지로 이동
        } catch (error) {
            console.error('Error:', error);
        }
    };

    //소셜가입의 경우
    const oauth2Submit = async (e) => {
        e.preventDefault();
        // 전화번호 중복 및 입력값이 없는 경우 리턴
        if (!userPwdFilled || !userPwdFilled2) {
            return;
        }
    
        try {
            await axios.post('http://localhost:4000/api/oauth2/join', user, { params: { code } });
            useNavigate.push('/joinComplete'); // 회원가입 완료 페이지로 이동
        } catch (error) {
            console.error('Error:', error);
        } 
    };






    

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
    // const [isUserIdError, setUserIdError] = useState(false);
    // const [isUserPwdError, setUserPwdError] = useState(false);
    const [isUserPwdCheckError, setUserPwdCheckError] = useState(false);
    // const [isUserEmailError, setUserEmailError] = useState(false);
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
        // userIdCheckRequest(requestBody).then(userIdCheckResponse);
    };
    const onUserEmailButtonClickHandler = () => {
    };
    const onCertificationNumberButtonClickHandler = () => {
    };
    const onSignUpButtonClickHandler = () => {
    };
    const onSignInButtonClickHandler = () => {
        navigate('/auth/sign-in');
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
        <div className='sign-up-container'>
            <div className='sign-up-box'>
            <div className='sign-up-title'>{'빛나는 크리스퇄'}</div>
            
            <form onSubmit={code ? oauth2Submit : handleSubmit}>
            <div className='sign-up-content-box'>
                <div className='sign-up-content-sns-sign-in-box'>
                <div className='sign-up-content-sns-sign-in-title'>{'SNS 회원가입'}</div>
                <div className='sign-up-content-sns-sign-in-button-box'>
                    <div className='google-sign-in-button'></div>
                    <div className='naver-sign-in-button'></div>
                    <div className='kakao-sign-in-button'></div>
                </div>
                </div>
                    <div className='sign-up-content-divider'></div>
                    <div className='sign-up-content-input-box'>
                        {/* <InputBox ref={userIdRef} title='아이디' placeholder='아이디를 입력해주세요.' type='text' id="userId" value={userId} onChange={onUserIdChangeHandler} isErrorMessage={isUserIdError} message={userIdMessage} buttonTitle='중복 확인' onButtonClick={onUserIdButtonClickHandler} onKeyDown={onUserIdKeyDownHandler}/> */}
                        <InputBox type="text" id="userId" ref={userIdRef} title='아이디' placeholder="아이디를 입력해주세요." value={user.userId} onChange={handleChange} disabled={code} />
                        {userIdError && <span className="msg">아이디를 정확히 입력해주세요.</span>}
                        {duplicateUserId && <span className="msg">이미 가입된 아이디입니다.</span>}

                        <InputBox ref={userPwdRef} title='비밀번호' placeholder='비밀번호를 입력해주세요.' type='password' value={userPwd} onChange={onUserPwdChangeHandler} isErrorMessage={userPwdError} message={userPwdMessage} onKeyDown={onUserPwdKeyDownHandler}/>

                        <InputBox ref={userPwdCheckRef} title='비밀번호 확인' placeholder='비밀번호를 입력해주세요.' type='password' value={userPwdCheck} onChange={onUserPwdCheckChangeHandler} isErrorMessage={isUserPwdCheckError} message={userPwdCheckMessage} onKeyDown={onUserPwdCheckKeyDownHandler}/>

                        <InputBox ref={userEmailRef} title='이메일' placeholder='이메일 주소를 입력해주세요.' type='text' value={userEmail} onChange={onUserEmailChangeHandler} isErrorMessage={userEmailError} message={userEmailMessage} buttonTitle='이메일 인증' onButtonClick={onUserEmailButtonClickHandler} onKeyDown={onUserEmailKeyDownHandler}/>

                        <InputBox ref={certificationNumberRef} title='인증번호' placeholder='인증번호를 입력해주세요.' type='text' value={certificationNumber} onChange={onCertificationNumberChangeHandler} isErrorMessage={isCertificationNumberError} message={certificationNumberMessage} buttonTitle='인증 확인' onButtonClick={onCertificationNumberButtonClickHandler} onKeyDown={onCertificationNumberKeyDownHandler}/>
                    </div>
                    <div className='sign-up-content-button-box'>
                        <div className={`${signUpButtonClass} full-width`}  onClick={onSignUpButtonClickHandler}>회원가입</div>
                        <div className='text-link-lg full-width' onClick={onSignInButtonClickHandler}>{'로그인'}</div>
                </div>
            </div>
            </form>
            </div>
        </div>
    </div>
    );
}

export default SignUp;