import logo from '@assets/images/branding/50104.png';
import { logoutFunction } from '@utils/api/token';
import { GetUser } from '@utils/api/user';

import './Header.css';

const Header = () => {
  const { isLogin, userRole, userNick } = GetUser();

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
        <div><a href="/"><img src={logo} alt="50104" className="nav_log" /></a></div>
        <div className="nav_menu">
          <ul><a href="/wiki/list">도감</a></ul>
          <ul><a href="/roses/list">내 장미</a></ul>
          <ul><a href="/list">리스트</a></ul>

          <ul><a href="/groupchatting/list">채팅방목록</a></ul>
          <ul><a href="/my/chat/page">MyChatPage</a></ul>
        </div>
      </div>
    </div>
  );
};

export default Header;
