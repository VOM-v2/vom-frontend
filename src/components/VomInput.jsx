import React, { forwardRef, useId, useMemo, useState } from 'react';
import './VomInput.css';

function EyeIcon({ mode }) {
  // mode: 'show' | 'hide'
  const d = mode === 'show'
    ? 'M12 5C7 5 3.4 8.1 2 12c1.4 3.9 5 7 10 7s8.6-3.1 10-7c-1.4-3.9-5-7-10-7Zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z'
    : 'M3 4.3 4.4 3 21 19.6 19.6 21l-2.1-2.1A11.7 11.7 0 0 1 12 20C7 20 3.4 16.9 2 13c.8-2.2 2.4-4.2 4.6-5.7L3 4.3Zm7.2 7.2a2.8 2.8 0 0 0 3.3 3.3l-3.3-3.3ZM12 6c1.4 0 2.7.3 4 .8l-2.2 2.2a4 4 0 0 0-4.9 4.9L7.1 16A9.4 9.4 0 0 1 4.2 13c1.2-2.7 4-7 7.8-7Z';

  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d={d} fill="currentColor" />
    </svg>
  );
}

const VomInput = forwardRef(
  (
    {
      className = '',
      type = 'text',
      label,
      error,
      showPasswordToggle = false,
      icon,
      id,
      ...rest
    },
    ref
  ) => {
    const autoId = useId();
    const inputId = id ?? `vom-input-${autoId}`;

    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const resolvedType = useMemo(() => {
      if (!showPasswordToggle) return type;
      return isPasswordVisible ? 'text' : 'password';
    }, [type, showPasswordToggle, isPasswordVisible]);

    return (
      <div className={`vomInput ${className}`.trim()}>
        {label ? (
          <label className="vomInput__label" htmlFor={inputId}>
            {label}
          </label>
        ) : null}

        <div className={`vomInput__box ${error ? 'isError' : ''}`}>
          {icon ? <span className="vomInput__icon">{icon}</span> : null}

          <input
            id={inputId}
            ref={ref}
            className="vomInput__native"
            type={resolvedType}
            {...rest}
          />

          {showPasswordToggle ? (
            <button
              type="button"
              className="vomInput__toggle"
              onClick={() => setIsPasswordVisible((v) => !v)}
              aria-label={isPasswordVisible ? '비밀번호 숨기기' : '비밀번호 보기'}
              title={isPasswordVisible ? '비밀번호 숨기기' : '비밀번호 보기'}
            >
              <EyeIcon mode={isPasswordVisible ? 'show' : 'hide'} />
            </button>
          ) : null}
        </div>

        {error ? <p className="vomInput__error">{error}</p> : null}
      </div>
    );
  }
);

VomInput.displayName = 'VomInput';

export default VomInput;

