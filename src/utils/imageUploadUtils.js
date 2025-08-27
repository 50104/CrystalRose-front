// src/utils/imageUploadUtils.js
import { axiosInstance } from './axios';

export async function uploadImageWithPreSignedUrl(file, domainType, folderName = null) {
  try {
    const params = {
      fileName: file.name,
      contentType: file.type,
      domainType
    };
    if (folderName) params.folderName = folderName;

    const presignRes = await axiosInstance.post('/api/v1/s3/presigned-url', null, { params });

    if (presignRes.status !== 200) {
      console.error('Pre-signed URL 요청 실패:', presignRes.status, presignRes.data);
      throw new Error(`Pre-signed URL 요청 실패: ${presignRes.status}`);
    }
    const { uploadUrl, accessUrl, key } = presignRes.data;

    const uploadResponse = await axiosInstance.put(uploadUrl, file, {
      headers: {
        'Content-Type': file.type
      },
      skipAuth: true,
      timeout: 0,
      maxBodyLength: Infinity,
      maxContentLength: Infinity
    });

    if (!(uploadResponse.status >= 200 && uploadResponse.status < 300)) {
      console.error('S3 업로드 비정상 상태:', uploadResponse.status, uploadResponse.data);
      throw new Error(`S3 업로드 실패: ${uploadResponse.status}`);
    }

    try {
      await axiosInstance.post('/api/v1/s3/upload-complete', {
        key: key,
        accessUrl: accessUrl,
        domainType: domainType
      });
    } catch (notifyError) {
      console.error('업로드 실패:', notifyError);
    }

    return { success: true, fileUrl: accessUrl, key };

  } catch (error) {
    console.error('Pre-signed URL 업로드 실패:', error?.message || String(error));
    return { success: false, error: error?.message || String(error) };
  }
}

export async function uploadImageWithMultipart(file, uploadEndpoint, extraData = {}) {
  try { // 멀티파트
    const formData = new FormData();
    formData.append('file', file);
    
    Object.keys(extraData).forEach(key => {
      if (extraData[key] !== undefined && extraData[key] !== null && extraData[key] !== '') {
        formData.append(key, extraData[key]);
      }
    });

    const res = await axiosInstance.post(uploadEndpoint, formData, {});

    if (res?.data && res.data.url) {
      return { success: true, fileUrl: res.data.url };
    } else {
      console.error('멀티파트 업로드 응답 이상:', res?.data);
      throw new Error(res?.data?.message || '업로드 실패');
    }
  } catch (error) {
    console.error('멀티파트 업로드 실패:', error);
    return { success: false, error: error?.message || String(error) };
  }
}

export async function uploadImage(file, usePreSignedUrl = true, opts = {}) {
  // 필수 파라미터 검증
  const domainType = opts.domainType ? opts.domainType.toString().toUpperCase() : null;
  if (usePreSignedUrl && !domainType) {
    return { success: false, error: 'Pre-signed URL 방식에는 domainType이 필요합니다.' };
  }

  const folderName = opts.folderName || null;
  const multipartData = opts.multipartData || {}; // 멀티파트용 추가 데이터
  const multipartEndpoint = opts.multipartEndpoint;

  // 파일 유효성 검증
  if (!file) return { success: false, error: '파일이 선택되지 않았습니다.' };

  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) return { success: false, error: '지원하지 않는 파일 형식입니다.' };

  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) return { success: false, error: '파일 크기가 너무 큽니다. (최대 10MB)' };

  if (usePreSignedUrl) {
    const preSignedResult = await uploadImageWithPreSignedUrl(file, domainType, folderName);
    
    if (!preSignedResult.success && multipartEndpoint) {
      console.warn('⚠️ Pre-signed URL 실패, 멀티파트 방식으로 fallback:', preSignedResult.error);
      return await uploadImageWithMultipart(file, multipartEndpoint, multipartData);
    }
    
    return preSignedResult;
  } else {
    if (!multipartEndpoint) {
      return { success: false, error: '멀티파트 방식에는 업로드 엔드포인트가 필요합니다.' };
    }
    return await uploadImageWithMultipart(file, multipartEndpoint, multipartData);
  }
}

export async function deleteImage(imageKey) {
  try {
    await axiosInstance.delete(`/api/v1/s3/${encodeURIComponent(imageKey)}`);
    return { success: true };
  } catch (error) {
    console.error('이미지 삭제 실패:', error);
    return { success: false, error: error?.message || String(error) };
  }
}
