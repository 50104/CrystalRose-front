import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useUserData } from '@utils/api/user';
import { logoutFunction } from '@utils/api/token';
import './MyPage.css';
import { getAccessToken } from '@utils/api/token';
import { useNavigate } from 'react-router-dom';
import { FaGear } from "react-icons/fa6";
import { axiosInstance } from '../../../utils/axios';
import { uploadImage } from '../../../utils/imageUploadUtils';

function MyPage() {
  const { userData, loading } = useUserData();
  const inputRef = useRef(null);
  const [currentProfileImage, setCurrentProfileImage] = useState("https://i.pinimg.com/564x/d9/7b/bb/d97bbb08017ac2309307f0822e63d082.jpg");
  const [changeProfileImage, setChangeProfileImage] = useState(null);
  const [isDelete, setIsDelete] = useState(false);
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (userData) {
      setCurrentProfileImage(
        userData.userProfileImg && userData.userProfileImg.startsWith('http')
          ? userData.userProfileImg
          : "https://i.pinimg.com/564x/d9/7b/bb/d97bbb08017ac2309307f0822e63d082.jpg"
      );
    }
  }, [userData]);

  const onUploadImageButtonClick = useCallback(() => {
    if (!inputRef.current) {
      return;
    }
    inputRef.current.click();
  }, []);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      uploadImageToS3(file);
    }
  };

  const uploadImageToS3 = async (file) => {
    setFileName(file.name);
    setUploading(true);
    
    try {
      const result = await uploadImage(file, true, {
        domainType: 'USER',
        folderName: 'profiles'
      });
      
      if (result.success) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
          setChangeProfileImage(reader.result);
          setCurrentProfileImage(result.fileUrl);
          setIsDelete(false);
        };
      } else {
        throw new Error(result.error || '업로드 실패');
      }
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      alert(`이미지 업로드에 실패했습니다: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const deleteButtonClick = () => {
    const result = window.confirm('프로필사진을 초기화하시겠습니까?');
    if (!result) return;
    setCurrentProfileImage("https://i.pinimg.com/564x/d9/7b/bb/d97bbb08017ac2309307f0822e63d082.jpg");
    setChangeProfileImage(null);
    setIsDelete(true);
    setFileName('');
  };

  useEffect(() => {
    if (isDelete) {
      handleModify();
    }
    // eslint-disable-next-line
  }, [isDelete]);

  const handleModify = async () => {
    try {
      const formData = new FormData();
      formData.append('userNick', userData.userNick);
      
      if (!isDelete && currentProfileImage && currentProfileImage !== "https://i.pinimg.com/564x/d9/7b/bb/d97bbb08017ac2309307f0822e63d082.jpg") {
        formData.append('userProfileImg', currentProfileImage);
      }
      formData.append('isDelete', String(isDelete));

      await axiosInstance.post('/api/user/modify', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      window.location.reload();
    } catch (error) {
      if (error.response?.data === 'access token expired') {
        try {
          await getAccessToken();
          handleModify();
        } catch (refreshError) {
          console.error('토큰 갱신 실패:', refreshError);
        }
      } else {
        console.error('사용자 정보 수정 실패:', error);
      }
    }
  };

  const navigate = useNavigate();
  
  const handleUserEdit = () => {
    if (!userData.userPwd) {
      navigate('/modifyUser');
    } else {
      navigate('/checkUserPwd');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className='user-info'>
      {userData ? (
        <>
          <div className='img-modify'>
            <div className="user-img-wrapper">
              <div className='img-wrapper-inner' onClick={onUploadImageButtonClick}>
                <img 
                  className="user-img"
                  alt="profile"
                  src={changeProfileImage ? changeProfileImage : (currentProfileImage ? currentProfileImage : "https://i.pinimg.com/564x/d9/7b/bb/d97bbb08017ac2309307f0822e63d082.jpg")} 
                />
                <div className="user-img-overlay">편집</div>
              </div>
              <div className="modify-button" onClick={handleUserEdit}><FaGear size={32} /></div>
            </div><br/>
            <input 
              ref={inputRef}
              className="hidden"
              type="file"
              accept="image/*"
              onChange={handleImageChange} 
              style={{ display: 'none' }}
              disabled={uploading}
            />
            {fileName && <div>{fileName}</div>}
            {uploading && <div>업로드 중</div>}
            <div className='img-box-body'>
              <div className="img-box" onClick={handleModify} disabled={uploading}>
                저장
              </div>
              <div className="img-box" onClick={deleteButtonClick} disabled={uploading}>
                삭제
              </div>
            </div>
          </div>
          <div className='ect'>
            <a href="/my/chat/page">내 채팅</a>
            <a href="/mypage/blocks" className="admin-menu-item">차단 목록</a>
            <a href="/mypage/wiki/list" className="admin-menu-item">도감 수정 요청 목록</a>
            <div onClick={logoutFunction} className="cursor">로그아웃</div>
          </div>
        </>
      ) : (
        <div className='ect'>
          <a href="/join"><div>회원가입</div></a>
          <a href="/login"><div>로그인</div></a>
        </div>
      )}
    </div>
  );
}

export default MyPage;