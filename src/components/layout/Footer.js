import React from 'react';
import './Footer.css';
import { FaGithub } from "react-icons/fa";

function Footer() {
  return (
    <div className="footer_div">
      <div className="footer_info">
        <div>
          <div className="footer_info_title">CrystalRose</div>
          <p>© 2025 dodorose</p>
        </div>
        <div className="footer_icons">
          <FaGithub
            color="gray"
            size={30}
            style={{ cursor: 'pointer', marginRight: '10px' }}
            onClick={() =>
              window.open("https://github.com/50104/CrystalRose-back", "_blank")
            }
          />
          <FaGithub
            color="gray"
            size={30}
            style={{ cursor: 'pointer' }}
            onClick={() =>
              window.open("https://github.com/50104/CrystalRose-front", "_blank")
            }
          />
        </div>
      </div>
    </div>
  );
}


export default Footer;