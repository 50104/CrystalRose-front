import React, { useState } from 'react';
import InputBox from './InputBox';
import '../All.css'

function Login() {

  const [id, setId] = useState('');

  const onIdChangeHandler = (event) => {
    const { value } = event.target;
    setId(value);
  }

  const onIdButtonClickHandler = () => {

  }

  return (
    <div>
      <InputBox title='아이디' placeholder='아이디를 입력해주세요' type='text' value={id} onChange={onIdChangeHandler} buttonTitle='중복 확인' onButtonClick={onIdButtonClickHandler} message='사용 가능한 아이디입니다' isErrorMessage={false}/>
      <div className='primary-button-lg full-width'>회원가입</div>
      <div className='test-link-lg full-width'>회원가입</div>
      <div className='kakao-sign-in-button'></div>
      <div className='naver-sign-in-button'></div>
    </div>
  );
}

export default Login;