import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './AppRoutes.css';
import Home from '@components/pages/Home/Home';
import NotFound from '@components/pages/Error/NotFound';
import SignUp from '@components/pages/Auth/SignUp';
import SignIn from '@components/pages/Auth/SignIn';
import { OAuthCallback } from '@components/pages/Auth/OAuthCallback';
import MyPage from '@components/pages/MyPage/MyPage';
import FindId from '@components/pages/Auth/FindId';
import FindPwd from '@components/pages/Auth/FindPwd';
import CheckUserPwd from '@components/pages/MyPage/CheckUserPwd';
import UserUpdate from '@components/pages/MyPage/UserUpdate';
import Content from '@components/pages/Board/Content';
import List from '@components/pages/Board/List';
import Editor from '@components/pages/Board/Editor';
// import MemberList from '@components/pages/Chat/MemberList';
import StompChatPage from '@components/pages/Chat/StompChatPage';
import GroupChattingList from '@components/pages/Chat/GroupCattingList';
import MyChatPage from '@components/pages/Chat/MyChatPage';
import WikiApprove from '../components/pages/admin/WikiApproval';
import WikiRegister from '../components/pages/wiki/WikiRegister';
import WikiList from '../components/pages/wiki/WikiList';
import WikiDetail from '../components/pages/wiki/WikiDetail';
import MyBlockList from '../components/pages/report/MyBlockList';
import AdminReport from '../components/pages/admin/AdminReport';
import AdminCommentReport from '../components/pages/admin/AdminCommentReport';
import RoseRegister from '../components/pages/rose/RoseRegister';
import DiaryRegister from '../components/pages/rose/DiaryRegister';
import RoseListPage from '../components/pages/rose/RoseListPage';
import DiaryList from '../components/pages/rose/DiaryList';
import TimelinePage from '../components/pages/rose/TimelinePage';
import TimelapsePage from '../components/pages/rose/TimelapsePage';
import AdminPage from '../components/pages/admin/AdminPage';
import WikiApprovalEntriesPage from '../components/pages/admin/WikiApprovalEntriesPage';
import WikiApprovalModificationsPage from '../components/pages/admin/WikiApprovalModificationsPage';
import CalendarMain from '../components/pages/calendar_care/CalendarMain';
import CareLogRegister from '../components/pages/calendar_care/CareLogRegister';
import MyRejectedModificationsPage from '../components/pages/MyPage/MyRejectedModificationsPage';
import MyRejectedWikisList from '../components/pages/MyPage/MyRejectedWikisList';
import MyRejectedWiki from '../components/pages/MyPage/MyRejectedWiki';

function AppRoutes() {
  return (
    <div className="main_div">
      <Routes>
        {/* 메인 */}
        <Route path="/" element={<Home />} />

        {/* 마이페이지 */}
        <Route path="/myPage" element={<MyPage />} />
        <Route path="/checkUserPwd" element={<CheckUserPwd />} />
        <Route path="/modifyUser" element={<UserUpdate />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/mypage/wiki/list" element={<MyRejectedWiki />} />
        <Route path="/mypage/wiki/rejected" element={<MyRejectedWikisList />} />
        <Route path="/mypage/wiki/rejected/modification" element={<MyRejectedModificationsPage />} />

        {/* 로그인,회원가입 */}
        <Route path="/login" element={<SignIn />} />
        <Route path="/join" element={<SignUp />} />
        <Route path="/getAccess" element={<OAuthCallback />} />
        <Route path="/findId" element={<FindId />} />
        <Route path="/findPwd" element={<FindPwd />} />

        {/* 장미 커뮤니티 */}
        <Route path="/content" element={<Content />} />
        <Route path="/content/:boardNo" element={<Content />} />
        <Route path="/list" element={<List />} />
        <Route path="/editor" element={<Editor />} />
        <Route path="/editor/:boardNo" element={<Editor />} />

        {/* 장미 위키 */}
        <Route path="/wiki/register" element={<WikiRegister />} />
        <Route path="/wiki/edit/:id" element={<WikiRegister />} />
        <Route path="/wiki/resubmit/:id" element={<WikiRegister />} />
        <Route path="/wiki/list" element={<WikiList />} />
        <Route path="/wiki/detail/:wikiId" element={<WikiDetail />} />

        {/* 나의 장미 */}
        <Route path="/rose/register" element={<RoseRegister />} />
        <Route path="/roses/list" element={<RoseListPage />} />

        {/* 성장 기록 */}
        <Route path="/diaries/register" element={<DiaryRegister />} />
        <Route path="/diaries/register/:roseId" element={<DiaryRegister />} />
        <Route path="/diaries/edit/:diaryId" element={<DiaryRegister mode="edit" />} />
        <Route path="/diaries/list" element={<DiaryList />} />
        <Route path="/diaries/:roseId/timeline" element={<TimelinePage />} />
        <Route path="/diaries/:roseId/timelapse" element={<TimelapsePage />} />

        {/* 관리 기록 등록 */}
        <Route path="/carelogs/register" element={<CareLogRegister />} />

        {/* 전체 달력 */}
        <Route path="/carelogs/calendar" element={<CalendarMain />} />

        {/* 채팅 관련 */}
        {/* <Route path="/memberList" element={<MemberList />} /> */}
        <Route path="/chatpage/:roomId" element={<StompChatPage />} />
        <Route path="/groupChatting/list" element={<GroupChattingList />} />
        <Route path="/my/chat/page" element={<MyChatPage />} />

        {/* 신고 차단 */}
        <Route path="/mypage/blocks" element={<MyBlockList />} />
        <Route path="/admin/reports" element={<AdminReport />} />
        <Route path="/admin/comment-reports" element={<AdminCommentReport />} />

        {/* 장미 관리 */}
        <Route path="/admin/wiki" element={<WikiApprove />} />
        <Route path="/admin/wiki/entries" element={<WikiApprovalEntriesPage />} />
        <Route path="/admin/wiki/modifications" element={<WikiApprovalModificationsPage />} />

        {/* 404 페이지 */}
        <Route path="/*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default AppRoutes;