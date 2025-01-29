import React from 'react';
import '../../styles/Header/Nav.css';
import { FaSearch } from 'react-icons/fa';
import { IoChatbubbleEllipses } from 'react-icons/io5';
import { AiFillLike } from 'react-icons/ai';
import { FaUser } from 'react-icons/fa';
import logo from '../../assets/images/50104.png';

function Nav() {
  return (
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
        <ul><a href="/board">보드</a></ul>
      </div>
    </div>
  );
}

export default Nav;