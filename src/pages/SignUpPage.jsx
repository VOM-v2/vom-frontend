import React from 'react';
import { useNavigate } from 'react-router-dom';
import VomButton from '../components/VomButton';
import './SignUpPage.css';

const SignUpPage = () => {
  const navigate = useNavigate();

  return (
    <div className="vom-page">
      <div className="vom-card">
        <div className="vom-sticker" />

        <header className="vom-header">
          <div className="vom-logo" aria-hidden="true">
            <span className="vom-logo__text">V</span>
          </div>
          <h1 className="vom-title">Sign Up</h1>
          <p className="vom-subtitle">회원가입은 다음 단계에서 연결할게요</p>
        </header>

        <div className="vomSignUp__body">
          <p className="vomSignUp__hint">
            지금은 로그인 페이지 요구사항에 맞춰 UI/라우팅만 구성한 상태예요.
            <br />
            백엔드 회원가입 API가 준비되면 이 페이지를 실제 폼으로 확장하면 됩니다.
          </p>

          <VomButton variant="secondary" fullWidth onClick={() => navigate('/signin')}>
            sign-in 으로 돌아가기
          </VomButton>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
