import React from 'react';
import { FaSearch, FaUser } from 'react-icons/fa';
import { IoChatbubbleEllipses } from 'react-icons/io5';
import { AiFillLike } from 'react-icons/ai';
import logo from '@assets/images/branding/50104.png';
import { logoutFunction } from '@utils/api/token';
import { GetUser } from '@utils/api/user';

import './Header.css';

const Header = () => {
  const { isLogin, userId, userRole, userNick } = GetUser();

  return (
    <div className="header_div">
      {/* UserInfo 영역 */}
      <div className="nav_userInfo">
        {!isLogin ? (
          <>
            <div className="nav_userInfo"><a href="/favoriteList"><ul>즐겨찾기</ul></a></div>
            <div className="nav_userInfo"><a href="/join"><ul>회원가입</ul></a></div>
            <div className="nav_userInfo"><a href="/login"><ul>로그인</ul></a></div>
          </>
        ) : (
          <>
            <div className='nav_userInfo'><a href="/memberList"><ul>회원 리스트</ul></a></div>
            {userRole === 'ROLE_ADMIN' && (
              <div className="nav_userInfo"><a href="/admin"><ul>{userNick}님 관리자 페이지</ul></a></div>
            )}
            {userRole === 'ROLE_WRITER' && (
              <div className="nav_userInfo"><a href="/writer"><ul>{userNick}님 평론가 페이지</ul></a></div>
            )}
            {userRole !== 'ROLE_ADMIN' && userRole !== 'ROLE_WRITER' && (
              <div className="nav_userInfo"><a href="/mypage"><ul>{userNick}님 마이페이지</ul></a></div>
            )}
            <div className="nav_userInfo"><a href="/favoriteList"><ul>즐겨찾기</ul></a></div>
            <div className="nav_userInfo cursor" onClick={logoutFunction}><ul>로그아웃</ul></div>
          </>
        )}
      </div>

      {/* Nav 영역 */}
      <div className="nav_box">
        <div>
          <a href="/">
            <img src={logo} alt="50104" className="nav_log" />
          </a>
        </div>
        <div className="nav_menu">
          <ul>
            <a href="/search">
              {/* <FaSearch size="25" color="black" /> */}
              검색
            </a>
          </ul>
          {/* <ul>
            <a href="/recommend">
              <AiFillLike size="25" color="black" />
              즐겨찾기
            </a>
          </ul> */}
          <ul>
            <a href="/community">
              {/* <IoChatbubbleEllipses size="25" color="black" /> */}
              커뮤니티
            </a>
          </ul>
          <ul>
            <a href="/myPage">
              {/* <FaUser size="25" color="black" /> */}
              마이페이지
            </a>
          </ul>
          <ul><a href="/list">리스트</a></ul>
          <ul><a href="/editor">에디터</a></ul>

          <ul><a href="/groupchatting/list">채팅방목록</a></ul>
          <ul><a href="/my/chat/page">MyChatPage</a></ul>
        </div>
      </div>
    </div>
  );
};

export default Header;
