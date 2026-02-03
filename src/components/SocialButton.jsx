import React from 'react';
import './SocialButton.css';

const SocialButton = ({
  icon,
  iconAlt,
  label,
  onClick,
  showArrow = true,
  className = '',
}) => {
  return (
    <button type="button" className={`vomSocialBtn ${className}`.trim()} onClick={onClick}>
      <span className="vomSocialBtn__icon">
        <img src={icon} alt={iconAlt} />
      </span>
      <span className="vomSocialBtn__label">{label}</span>
      {showArrow ? (
        <span className="vomSocialBtn__arrow" aria-hidden="true">
          <svg width="8" height="13" viewBox="0 0 8 13" fill="none">
            <path
              d="M1.5 2L6 6.5L1.5 11"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      ) : (
        <span className="vomSocialBtn__arrow" />
      )}
    </button>
  );
};

export default SocialButton;

