import React from 'react';
import './Footer.css';
import { FaGithub } from "react-icons/fa";

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
                <div style={{cursor: 'pointer'}} onClick={() => window.open("https://github.com/50104/CrystalRose-back", "_blank")}>
                    <FaGithub color="gray" size={30} style={{ marginRight: "10" }} />
                </div>
                <div style={{cursor: 'pointer'}} onClick={() => window.open("https://github.com/50104/CrystalRose-front", "_blank")}>
                    <FaGithub color="gray" size={30} />
                </div>
            </div>
        </div>
    </div>
  );
}

export default Footer;