import React, { forwardRef } from 'react';
import './style.css'

const InputBox = forwardRef((props, ref) => {
    
    const { title, placeholder, type, value, message, isErrorMessage, 
    buttonTitle, onChange, onKeyDown, onButtonClick } = props;
  
    const buttonClass = value === ''?'input-box-button-disable':'input-box-button';
    const messageClass = isErrorMessage ? 'input-box-message-error':'input-box-message';
  
    return (
        <div className='input-box'>
            <div className='input-box-title'>{title}</div>
            <div className='input-box-content'>
                <div className='input-box-body'>
                    <input ref={ref} className='input-box-input' placeholder={placeholder} type={type} value={value} onChange={onChange} onKeyDown={onKeyDown}/>
                    {buttonTitle !== undefined && onButtonClick !== undefined && <div className={buttonClass} onClick={onButtonClick}>{buttonTitle}</div>}
                </div>
                {message !== undefined && <div className={messageClass}>{message}</div>}
                {/* <div className='input-box-message-error'>{'사용 불가능한 아이디 입니다'}</div> */}
            </div>
        </div>
    );
});

export default InputBox ;