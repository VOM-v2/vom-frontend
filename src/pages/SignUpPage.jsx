import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VomInput from '../components/VomInput';
import VomButton from '../components/VomButton';
import SocialButton from '../components/SocialButton';
import { buildBackendUrl } from '../config/backend';
import { getXsrfToken } from '../utils/cookies';
import './SignUpPage.css';

const GOOGLE_ICON_DATA_URI =
  "data:image/svg+xml,%3csvg%20width='24'%20height='25'%20viewBox='0%200%2024%2025'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cg%20clip-path='url(%23clip0_2212_15491)'%3e%3cpath%20d='M23.7643%2012.7763C23.7643%2011.9605%2023.6982%2011.1404%2023.5571%2010.3379H12.2383V14.9589H18.72C18.451%2016.4492%2017.5868%2017.7676%2016.3213%2018.6054V21.6037H20.1883C22.4591%2019.5137%2023.7643%2016.4272%2023.7643%2012.7763Z'%20fill='%234285F4'/%3e%3cpath%20d='M12.2391%2024.5013C15.4756%2024.5013%2018.205%2023.4387%2020.1936%2021.6044L16.3266%2018.606C15.2507%2019.338%2013.8618%2019.7525%2012.2435%2019.7525C9.11291%2019.7525%206.45849%2017.6404%205.50607%2014.8008H1.51562V17.8917C3.55274%2021.9439%207.70192%2024.5013%2012.2391%2024.5013Z'%20fill='%2334A853'/%3e%3cpath%20d='M5.50082%2014.8007C4.99816%2013.3103%204.99816%2011.6965%205.50082%2010.2062V7.11523H1.51478C-0.187219%2010.506%20-0.187219%2014.5009%201.51478%2017.8916L5.50082%2014.8007Z'%20fill='%23FBBC04'/%3e%3cpath%20d='M12.2391%205.24966C13.9499%205.2232%2015.6034%205.86697%2016.8425%207.04867L20.2685%203.62262C18.0991%201.5855%2015.2198%200.465534%2012.2391%200.500809C7.70192%200.500809%203.55274%203.05822%201.51562%207.11481L5.50166%2010.2058C6.44967%207.36173%209.1085%205.24966%2012.2391%205.24966Z'%20fill='%23EA4335'/%3e%3c/g%3e%3cdefs%3e%3cclipPath%20id='clip0_2212_15491'%3e%3crect%20width='24'%20height='24'%20fill='white'%20transform='translate(0%200.5)'/%3e%3c/clipPath%3e%3c/defs%3e%3c/svg%3e";

const KAKAO_ICON_DATA_URI =
  "data:image/svg+xml,%3csvg%20width='24'%20height='25'%20viewBox='0%200%2024%2025'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3cg%20clip-path='url(%23clip0_2212_15497)'%3e%3cpath%20d='M0%2012.5C0%205.8726%205.3726%200.5%2012%200.5C18.6274%200.5%2024%205.8726%2024%2012.5C24%2019.1274%2018.6274%2024.5%2012%2024.5C5.3726%2024.5%200%2019.1274%200%2012.5Z'%20fill='%23FFE812'/%3e%3cpath%20d='M12%206C7.5817%206%204%208.8241%204%2012.3077C4%2014.5599%205.4974%2016.5361%207.74985%2017.6521C7.6273%2018.0747%206.9624%2020.3709%206.9359%2020.5513C6.9359%2020.5513%206.92%2020.6868%207.00775%2020.7385C7.09555%2020.7901%207.19875%2020.75%207.19875%2020.75C7.45045%2020.7149%2010.1175%2018.8415%2010.5791%2018.5162C11.0403%2018.5815%2011.5151%2018.6154%2012%2018.6154C16.4183%2018.6154%2020%2015.7914%2020%2012.3077C20%208.8241%2016.4183%206%2012%206Z'%20fill='%23381F1F'/%3e%3cpath%20d='M8.75781%2010.4229C9.00751%2010.4229%209.21094%2010.6259%209.21094%2010.875C9.2108%2011.124%209.00738%2011.3271%208.75781%2011.3271H8.03711V14.0684C8.03711%2014.3114%207.83065%2014.5097%207.57617%2014.5098C7.32162%2014.5098%207.11426%2014.3115%207.11426%2014.0684V11.3271H6.39453C6.14486%2011.3271%205.94154%2011.124%205.94141%2010.875C5.94141%2010.6258%206.14483%2010.4229%206.39453%2010.4229H8.75781ZM10.3066%2010.4229C10.608%2010.4298%2010.8439%2010.6575%2010.9219%2010.8789L12.0254%2013.7832C12.1658%2014.2195%2012.0433%2014.381%2011.916%2014.4395C11.824%2014.4814%2011.7242%2014.503%2011.623%2014.5029C11.4308%2014.5029%2011.2838%2014.4253%2011.2393%2014.2998L11.0107%2013.7012H9.60352L9.37402%2014.2998C9.32974%2014.4252%209.18264%2014.5029%208.99023%2014.5029C8.88909%2014.503%208.78922%2014.4815%208.69727%2014.4395C8.57002%2014.3808%208.44774%2014.2195%208.58789%2013.7842L9.69141%2010.8789C9.76921%2010.6579%2010.006%2010.4297%2010.3066%2010.4229ZM15.332%2010.4229C15.5866%2010.4229%2015.7939%2010.6302%2015.7939%2010.8848V11.876L17.082%2010.5889C17.1482%2010.5227%2017.2391%2010.4863%2017.3379%2010.4863C17.453%2010.4864%2017.5686%2010.5356%2017.6553%2010.6221C17.7361%2010.7029%2017.7844%2010.8071%2017.791%2010.915C17.7977%2011.0238%2017.7617%2011.124%2017.6895%2011.1963L16.6377%2012.2471L17.7734%2013.7529C17.8101%2013.8012%2017.8374%2013.8564%2017.8525%2013.915C17.8677%2013.9736%2017.8709%2014.0348%2017.8623%2014.0947C17.8541%2014.1547%2017.8334%2014.2124%2017.8027%2014.2646C17.772%2014.3169%2017.7311%2014.3621%2017.6826%2014.3984C17.6028%2014.4591%2017.5056%2014.4924%2017.4053%2014.4922C17.3338%2014.4925%2017.2632%2014.4762%2017.1992%2014.4443C17.1352%2014.4125%2017.0799%2014.3658%2017.0371%2014.3086L15.9541%2012.874L15.7939%2013.0342V14.042C15.7937%2014.1643%2015.7456%2014.2817%2015.6592%2014.3682C15.5726%2014.4547%2015.4544%2014.5027%2015.332%2014.5029C15.0777%2014.5027%2014.8712%2014.2963%2014.8711%2014.042V10.8848C14.8711%2010.6304%2015.0777%2010.4231%2015.332%2010.4229ZM12.7969%2010.4229C13.0566%2010.4229%2013.2686%2010.6302%2013.2686%2010.8848V13.5957H14.249C14.4928%2013.5957%2014.6912%2013.7855%2014.6914%2014.0186C14.6914%2014.2518%2014.493%2014.4424%2014.249%2014.4424H12.7686C12.5246%2014.4424%2012.3262%2014.2518%2012.3262%2014.0186V10.8848C12.3262%2010.6303%2012.5372%2010.423%2012.7969%2010.4229ZM9.8457%2012.8838H10.7676L10.3066%2011.5742L9.8457%2012.8838Z'%20fill='%23FFE812'/%3e%3c/g%3e%3cdefs%3e%3cclipPath%20id='clip0_2212_15497'%3e%3crect%20width='24'%20height='24'%20fill='white'%20transform='translate(0%200.5)'/%3e%3c/clipPath%3e%3c/defs%3e%3c/svg%3e";

const SignUpPage = () => {
  const navigate = useNavigate();

  const [signupForm, setSignupForm] = useState({
    signupEmail: '',
    signupNickname: '',
    signupPassword: '',
    signupPasswordConfirm: '',
  });
  const [signupErrors, setSignupErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCsrfToken = async () => {
    try {
      const url = buildBackendUrl('/api/auth/csrf-token');
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        mode: 'cors',
      });
      if (response.ok) {
        return getXsrfToken();
      }
    } catch (error) {
      console.error('[vom] Failed to fetch CSRF token', error);
    }
    return null;
  };

  const isEmailLike = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const PASSWORD_MIN_LEN = 8;

  const isSignupValid = useMemo(() => {
    return (
      signupForm.signupEmail.trim().length > 0 &&
      signupForm.signupPassword.trim().length >= PASSWORD_MIN_LEN &&
      signupForm.signupPassword === signupForm.signupPasswordConfirm &&
      isEmailLike(signupForm.signupEmail)
    );
  }, [signupForm]);

  const onSignupChange = (field) => (e) => {
    const value = e.target.value;
    setSignupForm((prev) => ({ ...prev, [field]: value }));

    setSignupErrors((prev) => {
      const next = { ...prev };
      if (field === 'signupEmail') {
        if (value.trim() === '') next.signupEmail = '아이디(이메일)를 입력해주세요';
        else if (!isEmailLike(value)) next.signupEmail = '유효하지 않은 이메일입니다.';
        else delete next.signupEmail;
      }
      if (field === 'signupNickname') {
        if (value.trim().length > 0 && value.trim().length < 2)
          next.signupNickname = '닉네임은 2자 이상이어야 해요';
        else delete next.signupNickname;
      }
      if (field === 'signupPassword') {
        if (value.trim() === '') next.signupPassword = '비밀번호를 입력해주세요';
        else if (value.length < PASSWORD_MIN_LEN)
          next.signupPassword = `비밀번호는 ${PASSWORD_MIN_LEN}자 이상이어야 해요`;
        else delete next.signupPassword;
        if (signupForm.signupPasswordConfirm && value !== signupForm.signupPasswordConfirm)
          next.signupPasswordConfirm = '비밀번호가 일치하지 않아요';
        else if (value === signupForm.signupPasswordConfirm) delete next.signupPasswordConfirm;
      }
      if (field === 'signupPasswordConfirm') {
        if (value.trim() === '') next.signupPasswordConfirm = '비밀번호 확인을 입력해주세요';
        else if (value !== signupForm.signupPassword)
          next.signupPasswordConfirm = '비밀번호가 일치하지 않아요';
        else delete next.signupPasswordConfirm;
      }
      return next;
    });
  };

  const validateSignup = () => {
    const next = {};
    if (!signupForm.signupEmail.trim()) next.signupEmail = '아이디(이메일)를 입력해주세요';
    else if (!isEmailLike(signupForm.signupEmail))
      next.signupEmail = '유효하지 않은 이메일입니다.';
    if (
      signupForm.signupNickname.trim().length > 0 &&
      signupForm.signupNickname.trim().length < 2
    )
      next.signupNickname = '닉네임은 2자 이상이어야 해요';
    if (!signupForm.signupPassword.trim())
      next.signupPassword = '비밀번호를 입력해주세요';
    else if (signupForm.signupPassword.length < PASSWORD_MIN_LEN)
      next.signupPassword = `비밀번호는 ${PASSWORD_MIN_LEN}자 이상이어야 해요`;
    if (!signupForm.signupPasswordConfirm.trim())
      next.signupPasswordConfirm = '비밀번호 확인을 입력해주세요';
    else if (signupForm.signupPassword !== signupForm.signupPasswordConfirm)
      next.signupPasswordConfirm = '비밀번호가 일치하지 않아요';

    setSignupErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSignupSubmit = async (e) => {
    e.preventDefault();
    if (!validateSignup()) return;

    try {
      setIsSubmitting(true);
      setSignupErrors((prev) => {
        const next = { ...prev };
        delete next.server;
        return next;
      });

      const url = buildBackendUrl('/api/auth/sign-up');

      let xsrfToken = getXsrfToken();
      if (!xsrfToken) {
        xsrfToken = await fetchCsrfToken();
      }

      const body = {
        email: signupForm.signupEmail,
        password: signupForm.signupPassword,
      };
      if (signupForm.signupNickname.trim()) {
        body.nickname = signupForm.signupNickname.trim();
      }

      const headers = {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
      };
      if (xsrfToken) {
        headers['X-XSRF-TOKEN'] = xsrfToken;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        credentials: 'include',
        mode: 'cors',
      });

      if (response.ok) {
        navigate('/sign-in', { replace: true, state: { message: '회원가입이 완료되었어요. 로그인해주세요.' } });
        return;
      }

      let errorMessage = '회원가입에 실패했어요. 잠시 후 다시 시도해주세요.';

      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          errorMessage = data?.message || data?.error || errorMessage;
        } else {
          const text = await response.text();
          if (text) errorMessage = text;
        }
      } catch (parseError) {
        console.error('[vom] failed to parse error response', parseError);
      }

      setSignupErrors((prev) => ({ ...prev, server: errorMessage }));
    } catch (error) {
      console.error('[vom] sign-up error', error);
      let errorMessage = '서버와 통신 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.';
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = '네트워크 연결을 확인해주세요.';
      }
      setSignupErrors((prev) => ({ ...prev, server: errorMessage }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const goOauth = (provider) => {
    window.location.href = buildBackendUrl(`/oauth2/authorization/${provider}`);
  };

  return (
    <div className="vom-page">
      <div className="vom-card">
        <div className="vom-sticker" />

        <header className="vom-header">
          <div className="vom-logo" aria-hidden="true">
            <span className="vom-logo__text">V</span>
          </div>
          <h1 className="vom-title">회원가입</h1>
          <p className="vom-subtitle">레트로 감성 화상채팅 + 미니홈피</p>
        </header>

        <form className="vom-form" onSubmit={onSignupSubmit}>
          <div className="vom-field">
            <VomInput
              label="아이디"
              type="email"
              placeholder="이메일"
              value={signupForm.signupEmail}
              onChange={onSignupChange('signupEmail')}
              error={signupErrors.signupEmail}
              autoComplete="email"
              inputMode="email"
            />
          </div>

          <div className="vom-field">
            <VomInput
              label="닉네임"
              type="text"
              placeholder="미니홈피에 표시될 이름"
              value={signupForm.signupNickname}
              onChange={onSignupChange('signupNickname')}
              error={signupErrors.signupNickname}
              autoComplete="username"
            />
          </div>

          <div className="vom-field">
            <VomInput
              label="비밀번호"
              type="password"
              placeholder="8자 이상 입력해주세요"
              value={signupForm.signupPassword}
              onChange={onSignupChange('signupPassword')}
              error={signupErrors.signupPassword}
              showPasswordToggle
              autoComplete="new-password"
            />
          </div>

          <div className="vom-field">
            <VomInput
              label="비밀번호 확인"
              type="password"
              placeholder="비밀번호를 다시 입력해주세요"
              value={signupForm.signupPasswordConfirm}
              onChange={onSignupChange('signupPasswordConfirm')}
              error={signupErrors.signupPasswordConfirm}
              showPasswordToggle
              autoComplete="new-password"
            />
          </div>

          <VomButton
            type="submit"
            variant="primary"
            fullWidth
            disabled={!isSignupValid || isSubmitting}
          >
            {isSubmitting ? '가입 중...' : '회원가입'}
          </VomButton>
        </form>

        {signupErrors.server ? (
          <p className="vomSignUp__serverError" role="alert">
            {signupErrors.server}
          </p>
        ) : null}

        <div className="vom-divider">
          <span>또는</span>
        </div>

        <div className="vomSocialStack">
          <SocialButton
            icon={GOOGLE_ICON_DATA_URI}
            iconAlt="Google"
            label="구글로 가입하기"
            onClick={() => goOauth('google')}
          />
          <SocialButton
            icon={KAKAO_ICON_DATA_URI}
            iconAlt="Kakao"
            label="카카오로 가입하기"
            onClick={() => goOauth('kakao')}
          />
        </div>

        <footer className="vom-footer">
          <div className="vom-signupRow">
            <span className="vom-muted">이미 계정이 있으신가요?</span>
            <button className="vom-linkBtn" type="button" onClick={() => navigate('/sign-in')}>
              로그인
            </button>
          </div>

          <div className="vom-doodles" aria-hidden="true">
            <span>♥</span>
            <span>♪</span>
            <span>✿</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default SignUpPage;
