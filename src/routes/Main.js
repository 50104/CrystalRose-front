import React from 'react';
import { Routes, Route } from 'react-router-dom';
import '../styles/Main/Main.css';
import Home from '../components/Main/Home/Home';
import Search from '../components/Main/Search/Search';
import Community from '../components/Main/Board/Community';
import Recommend from '../components/Main/Recommend/Recommend';
import NotFound from '../components/Main/NotFound';
import ReviewWrite from '../components/Main/Review/ReviewWrite';
import RoseInfo from '../components/Main/Review/RoseInfo';
import SignUp from '../components/Main/UserInfo/SignUp';
import SignIn from '../components/Main/UserInfo/SignIn';
import MyPage from '../components/Main/MyPage/MyPage';
import FindId from '../components/Main/UserInfo/FindId';
import FindPwd from '../components/Main/UserInfo/FindPwd';
import CheckUserPwd from '../components/Main/MyPage/CheckUserPwd';
import UserUpdate from '../components/Main/MyPage/UserUpdate';
import GetAccess from '../utils/userInfo/api/getAccess';
import Board from '../components/Main/Board/Board';
import Content from '../components/Main/Board/Content';
import List from '../components/Main/Board/List';
import Editor from '../components/Main/Board/Editor';
import MemberList from '../components/Main/Chat/MemberList';
import StompChatPage from '../components/Main/Chat/StompChatPage';
import GroupChattingList from '../components/Main/Chat/GroupCattingList';


function Main() {
  return (
    <div className="main_div">
      <Routes>
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
        <Route path="/board" element={<Board />} />
        <Route path="/content" element={<Content />} />
        <Route path="/content/:boardNo" element={<Content />} />
        <Route path="/list" element={<List />} />
        <Route path="/editor" element={<Editor />} />
        <Route path="/editor/:boardNo" element={<Editor />} />

        {/* 장미정보 및 리뷰 */}
        <Route path="/review/:roseId" element={<RoseInfo />} />
        <Route path="/review/write/:roseId" element={<ReviewWrite />} />

        {/* 채팅 관련 */}
        <Route path="/memberList" element={<MemberList />} />
        <Route path="/chatpage/:roomId" element={<StompChatPage />} />
        <Route path="/groupChatting/list" element={<GroupChattingList />} />
        <Route path="/my/chat/page" element={<MyChatPage />} />
        {/* <Route path="/simple/chat" element={<SimpleWebsocket />} /> */}

        {/* 404 페이지 */}
        <Route path="/*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default Main;