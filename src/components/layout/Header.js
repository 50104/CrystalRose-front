import logo from '@assets/images/branding/50104.png';
import { useEffect } from 'react';
import { fetchUser } from '@utils/api/user';
import { logoutFunction } from '@utils/api/token';
import './Header.css';
import { useUser } from '../common/UserContext';

const Header = ({ updateAvailable, reloadPage }) => {
  const { user, setUser } = useUser();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await fetchUser();
        setUser(data);
      } catch (error) {
        console.error('사용자 정보 불러오기 실패:', error);
        setUser(null);
      }
    };
    loadUser();
  }, [setUser]);

  // 버전 업데이트 알림 상태에 따라 body에 클래스 추가/제거
  useEffect(() => {
    if (updateAvailable) {
      document.body.classList.add('update-alert-active');
    } else {
      document.body.classList.remove('update-alert-active');
    }

    return () => {
      document.body.classList.remove('update-alert-active');
    };
  }, [updateAvailable]);

  return (
    <div className="header_div">
      {/* 버전 업데이트 알림 */}
      {updateAvailable && (
        <div className="update-alert">
          새로운 버전이 있습니다. <button onClick={reloadPage}>새로고침</button>
        </div>
      )}

      {/* UserInfo 영역 */}
      <div className="nav_userInfo">
        {!user ? (
          <>
            <a href="/join"><div>회원가입</div></a>
            <a href="/login"><div>로그인</div></a>
          </>
        ) : (
          <>
            {user?.userRole === 'ROLE_ADMIN' && (
              <a href="/admin"><div>{user.userNick}님 관리자 페이지</div></a>
            )}
            {user?.userRole !== 'ROLE_ADMIN' && user?.userRole !== 'ROLE_WRITER' && (
              <a href="/mypage"><div>{user.userNick}님 마이페이지</div></a>
            )}
            <div
              onClick={() => {
                logoutFunction();
                setUser(null); // ✅ 로그아웃 시 Context 비움
              }}
              className="cursor"
            >
              로그아웃
            </div>
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
            <li><a href="/list">게시판</a></li>
            <li><a href="/groupchatting/list">그룹채팅</a></li>
          </ul>
          <ul className="mobile-only">
            <li>
              {user?.userRole === 'ROLE_ADMIN' && (
                <a href="/admin"><div>관리자 페이지</div></a>
              )}
            </li>
            <li>
              {user?.userRole !== 'ROLE_ADMIN' && user?.userRole !== 'ROLE_WRITER' && (
                <a href="/mypage"><div>마이페이지</div></a>
              )}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Header;
