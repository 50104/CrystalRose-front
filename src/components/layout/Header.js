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
            <a href="/favoriteList"><div>즐겨찾기</div></a>
            <a href="/join"><div>회원가입</div></a>
            <a href="/login"><div>로그인</div></a>
          </>
        ) : (
          <>
            <a href="/memberList"><div>회원 리스트</div></a>
            {userRole === 'ROLE_ADMIN' && (
              <a href="/admin"><div>{userNick}님 관리자 페이지</div></a>
            )}
            {userRole !== 'ROLE_ADMIN' && userRole !== 'ROLE_WRITER' && (
              <a href="/mypage"><div>{userNick}님 마이페이지</div></a>
            )}
            <a href="/favoriteList"><div>즐겨찾기</div></a>
            <div onClick={logoutFunction}>로그아웃</div>
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
            <li><a href="/wiki/list">도감</a></li>
            <li><a href="/roses/list">내 장미</a></li>
            <li><a href="/list">리스트</a></li>
            <li><a href="/groupchatting/list">그룹채팅</a></li>
            <li><a href="/my/chat/page">내 채팅</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Header;
