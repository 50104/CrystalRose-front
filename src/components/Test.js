function Test() {


  return (
    <div style={{ padding: '10px' }}>
      <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}> {/* 기본 ul 스타일 제거 */}
        <li style={{ marginBottom: '18px' }}>
          <a href="/wiki/list" style={{ fontSize: '16px', textDecoration: 'none', color: '#333' }}>도감 목록</a>
        </li>
        <li style={{ marginBottom: '18px' }}>
          <a href="/admin/wiki" style={{ fontSize: '16px', textDecoration: 'none', color: '#333' }}>도감 승인</a>
        </li>
        <li style={{ marginBottom: '18px' }}>
          <a href="/wiki/register" style={{ fontSize: '16px', textDecoration: 'none', color: '#333' }}>도감 요청</a>
        </li>
        <li style={{ marginBottom: '18px' }}>
          <a href="/mypage/blocks" style={{ fontSize: '16px', textDecoration: 'none', color: '#333' }}>차단 목록</a>
        </li>
        <li style={{ marginBottom: '18px' }}>
          <a href="/admin/reports" style={{ fontSize: '16px', textDecoration: 'none', color: '#333' }}>신고 목록</a>
        </li>
        <li style={{ marginBottom: '18px' }}>
          <a href="/admin/comment-reports" style={{ fontSize: '16px', textDecoration: 'none', color: '#333' }}>댓글 신고 목록</a>
        </li>
        <li style={{ marginBottom: '18px' }}>
          <a href="/rose/register" style={{ fontSize: '16px', textDecoration: 'none', color: '#333' }}>장미 등록</a>
        </li>

        <li style={{ marginBottom: '18px' }}>
          <a href="/roses/list" style={{ fontSize: '16px', textDecoration: 'none', color: '#333' }}>장미 목록</a>
        </li>
        <li style={{ marginBottom: '18px' }}>
          <a href="/diaries/register" style={{ fontSize: '16px', textDecoration: 'none', color: '#333' }}>다이어리 등록</a>
        </li>
        <li style={{ marginBottom: '18px' }}>
          <a href="/diaries/list" style={{ fontSize: '16px', textDecoration: 'none', color: '#333' }}>다이어리 목록</a>
        </li>
      </ul>
    </div>
  );
}

export default Test;