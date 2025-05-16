import React from 'react';
import './Footer.css';
import { FaGithub } from "react-icons/fa";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <div className="footer_div">
      <div className="footer_info">
            <div>
                <div className="footer_info_title"></div>
                <p></p>
                <p></p>
            </div>
            <div>
                <Link to={"https://github.com/50104/CristalRose-back"}>
                    <FaGithub color="gray" size={30} style={{ marginRight: "10" }} />
                </Link>
                <Link to={"https://github.com/50104/CristalRose-front"}>
                    <FaGithub color="gray" size={30} />
                </Link>
            </div>
        </div>
    </div>
  );
}

export default Footer;