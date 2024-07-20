import React from 'react';
import { Routes, Route } from 'react-router-dom';
import '../styles/Main/Main.css';
import Home from '../components/Main/Home/Home';
import Search from '../components/Main/Search/Search';
import Community from '../components/Main/Community/Community';
import Recommend from '../components/Main/Recommend/Recommend';
import NotFound from '../components/Main/NotFound';
import ReviewWrite from '../components/Main/Review/ReviewWrite';
import RoseInfo from '../components/Main/Review/RoseInfo';
import SignUp from '../components/Main/UserInfo/SignUp';
import SignIn from '../components/Main/UserInfo/SignIn';
import MyPage from '../components/Main/MyPage/MyPage';
import FindId from '../components/Main/UserInfo/FindId';
import FindPwd from '../components/Main/UserInfo/FindPwd';
import GetAccess from '../components/Main/MyPage/api/getAccess';
import CheckUserPwd from '../components/Main/MyPage/CheckUserPwd';
import UserUpdate from '../components/Main/MyPage/UserUpdate';


function Main() {
  return (
    <div className="main_div">
      <Routes>

        {/* <Login/> */}
        {/* <Test /> */}

        {/* 메인 */}
        <Route path="/" element={<Home />} />

        {/* 마이페이지 */}
        <Route path="/myPage" element={<MyPage />} />
        <Route path="/checkUserPwd" element={<CheckUserPwd />} />
        <Route path="/modifyUser" element={<UserUpdate />} />

        {/* 로그인,회원가입 */}
        <Route path="/login" element={<SignIn />} />
        <Route path="/join" element={<SignUp />} />
        <Route path="/getAccess" element={<GetAccess />} />
        <Route path="/findId" element={<FindId />} />
        <Route path="/findPwd" element={<FindPwd />} />

        {/* 장미 검색 */}
        <Route path="/search" element={<Search />} />

        {/* 사용자 영화 추천 */}
        <Route path="/recommend" element={<Recommend />} />

        {/* 장미 커뮤니티 */}
        <Route path="/community" element={<Community />} />

        {/* 장미정보 및 리뷰 */}
        <Route path="/review/:roseId" element={<RoseInfo />} />
        <Route path="/review/write/:roseId" element={<ReviewWrite />} />

        {/* 404 페이지 */}
        <Route path="/*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default Main;