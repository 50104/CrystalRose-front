import React from 'react';
import { Routes, Route } from 'react-router-dom';
import '../styles/Main/Main.css';
import Home from '../components/Main/Home/Home';
import Search from '../components/Main/Search/Search';
import Community from '../components/Main/Community/Community';
import Recommend from '../components/Main/Recommend/Recommend';
import MyPage from '../components/Main/MyPage/MyPage';
import NotFound from '../components/Main/NotFound';
import ReviewWrite from '../components/Main/Review/ReviewWrite';
import RoseInfo from '../components/Main/Review/RoseInfo';


// import Login from '../components/Main/UserInfo/Login';
import Login from '../components/Main/UserInfo/InputBox/Login';
import SignUp from '../components/Main/UserInfo/Authentication/SignUp/SignUp';
import SignIn from '../components/Main/UserInfo/Authentication/SignIn/SignIn';

function Main() {
  return (
    <div className="main_div">
      <Routes>

        {/* <Login/> */}
        {/* <Test /> */}


        {/* 메인 */}
        <Route path="/" element={<Home />} />



        {/* 로그인,회원가입 */}
        <Route path="/auth">
          <Route path="sign-up" element={<SignUp />} />
          <Route path="sign-in" element={<SignIn />} />
        </Route>

        {/* <Route path="/login" element={<Login />} /> */}
        <Route path="/login" element={<SignIn />} />
        {/* <Login/> */}
        <Route path="/join" element={<SignUp />} />



        {/* 장미 검색 */}
        <Route path="/search" element={<Search />} />

        {/* 사용자 영화 추천 */}
        <Route path="/recommend" element={<Recommend />} />

        {/* 장미 커뮤니티 */}
        <Route path="/community" element={<Community />} />

        {/* 장미정보 및 리뷰 */}
        <Route path="/review/:roseId" element={<RoseInfo />} />
        <Route path="/review/write/:roseId" element={<ReviewWrite />} />

        {/* 마이페이지 */}
        <Route path="/myPage" element={<MyPage />} />

        {/* 404 페이지 */}
        <Route path="/*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default Main;