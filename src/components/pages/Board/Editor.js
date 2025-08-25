import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUserData } from '@utils/api/user';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { safeConvertToWebP } from '../../../utils/imageUtils';
import { uploadImage } from '../../../utils/imageUploadUtils';
import { axiosInstance } from '@utils/axios';
import styles from './CKEditor.module.css';
import './Editor.css';

function CustomUploadAdapterPlugin(editor, tag) {
  editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
    return new CustomUploadAdapter(loader, tag);
  };
}

class CustomUploadAdapter {
  constructor(loader, tag) {
    this.loader = loader;
    this.tag = tag;
  }

  async upload() {
    const file = await this.loader.file;
    const finalFile = await safeConvertToWebP(file);

    try {
      const result = await uploadImage(finalFile, true, { 
        domainType: 'BOARD', 
        folderName: 'boards',
        multipartEndpoint: '/api/v1/board/image/upload',
        multipartData: { boardTag: this.tag }
      });
      
      if (result.success) {
        return { default: result.fileUrl };
      } else {
        console.error('이미지 업로드 실패:', result.error);
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('업로드 오류:', error);
      throw error;
    }
  }

  abort() {
  }
}

function Editor() {
  const { userData, loading, isLogin } = useUserData();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const isAdmin = userData?.userRole?.toUpperCase() === 'ROLE_ADMIN';
  const [tagOptions, setTagOptions] = useState(['질문', '일상']);
  const [tag, setTag] = useState(() => {
    return isAdmin ? '공지' : '일상';
  });
  const [isFormValid, setIsFormValid] = useState(false);
  const navigate = useNavigate();
  const { boardNo } = useParams();

  useEffect(() => {
    if (userData) {
      const role = userData.userRole?.toUpperCase();
      if (role === 'ROLE_ADMIN') {
        setTagOptions(['공지', '질문', '일상']);
        setTag(prev => (prev === '일상' || prev === '질문' ? '공지' : prev));
      } else {
        setTagOptions(['질문', '일상']);
        setTag(prev => (prev === '공지' ? '일상' : prev));
      }
    }
  }, [userData]);

  useEffect(() => {
    if (boardNo) {
      const fetchContent = async () => {
        try {
          const response = await axiosInstance.get(`/api/v1/board/editor/${boardNo}`);
          const data = response.data.data;
          setTitle(data.boardTitle || '');
          setContent(data.boardContent || '');
          setTag(data.boardTag || '');
        } catch (error) {
          console.error('게시글 불러오기 오류:', error);
        }
      };
      fetchContent();
    }
  }, [boardNo]);

  useEffect(() => {
    setIsFormValid(title.trim() !== '' && content.trim() !== '');
  }, [title, content]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const confirmationMessage = boardNo ? '수정하시겠습니까?' : '작성하시겠습니까?';
    if (!window.confirm(confirmationMessage)) return;

    const formData = new FormData();
    formData.append('boardTitle', title);
    formData.append('boardContent', content);
    formData.append('boardTag', tag);

    if (userData?.userId) {
      formData.append('userId', userData.userId);
    } else {
      console.error('사용자 정보 없음');
      return;
    }

    try {
      const url = boardNo
        ? `/api/v1/board/save/${boardNo}`
        : `/api/v1/board/save`;

      const response = await axiosInstance.post(url, formData, {
          headers: {'Content-Type': undefined}
      });
      const savedBoardNo = response.data.data.boardNo;
      navigate(`/content/${savedBoardNo}`);
    } catch (error) {
      if (error.response?.data?.message === '공지 작성 권한이 없습니다.') {
        alert('공지 작성은 관리자만 가능합니다.');
      } else {
        console.error(error);
        alert('게시글 저장 중 오류가 발생했습니다.');
      }
    }
  };

  if (loading) return <div>불러오는 중</div>;
  if (!isLogin) return <div>로그인이 필요합니다.</div>;

  return (
    <div className={`${styles.content} custom-editor`}>
      <form onSubmit={handleSubmit}>
        <div className="titleRow">
          <select value={tag} onChange={(e) => setTag(e.target.value)} className='inputTag'>
            {tagOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>

          <input
            className='inputTitle'
            name="boardTitle"
            type="text"
            placeholder="제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          /><br />
        </div>

        <CKEditor
          editor={ClassicEditor}
          data={content}
          config={{
            extraPlugins: [CustomUploadAdapterPlugin],
            height: 450,
            extraAllowedContent: 'div(custom-editor-height)',
            codeBlock: {
              languages: [
                { language: 'plaintext', label: 'PlainText' },
                { language: 'c', label: 'C' },
                { language: 'cpp', label: 'C++' },
                { language: 'java', label: 'Java' },
                { language: 'python', label: 'Python' },
                { language: 'xml', label: 'XML' },
                { language: 'json', label: 'JSON' },
                { language: 'html', label: 'HTML' },
                { language: 'css', label: 'CSS' },
                { language: 'gradle', label: 'Gradle' }
              ]
            }
          }}
          onChange={(event, editor) => setContent(editor.getData())}
        />

        <div className='uploadButtonBox'>
          <button
            type="button"
            className="cancelButton"
            onClick={() => navigate('/list')}
          >
            취소
          </button>
          <input
            className={isFormValid ? 'uploadButton' : 'uploadButton-disable'}
            type="submit"
            value={boardNo ? "수정" : "등록"}
            disabled={!isFormValid}
          />
        </div>
      </form>
    </div>
  );
}

export default Editor;
