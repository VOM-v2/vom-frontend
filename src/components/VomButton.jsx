import React from 'react';
import './VomButton.css';

const VomButton = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary', // primary | secondary
  fullWidth = false,
  disabled = false,
  className = '',
}) => {
  const classes = [
    'vomBtn',
    `vomBtn--${variant}`,
    fullWidth ? 'isFullWidth' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} onClick={onClick} className={classes} disabled={disabled}>
      <span className="vomBtn__label">{children}</span>
    </button>
  );
};

export default VomButton;

