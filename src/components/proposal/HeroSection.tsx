import React from 'react';

const HeroSection = ({ title, subtitle, imageUrl, designTokens }) => {
  const heroStyle = {
    backgroundImage: `url(${imageUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    color: designTokens?.colors?.heroText || '#fff',
    padding: designTokens?.spacing?.heroPadding || '4rem 2rem',
    textAlign: 'center',
    borderRadius: designTokens?.radius?.lg || '12px',
    marginBottom: designTokens?.spacing?.sectionGap || '2.5rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    minHeight: '300px',
    position: 'relative',
    overflow: 'hidden',
  };

  const overlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: designTokens?.colors?.heroOverlay || 'rgba(0, 0, 0, 0.5)',
    borderRadius: designTokens?.radius?.lg || '12px',
  };

  const contentStyle = {
    position: 'relative',
    zIndex: 1,
  };

  const h1Style = {
    fontSize: designTokens?.typography?.heroH1 || '3.5rem',
    fontWeight: designTokens?.typography?.heroH1Weight || '700',
    marginBottom: designTokens?.spacing?.md || '1rem',
    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
  };

  const pStyle = {
    fontSize: designTokens?.typography?.heroP || '1.5rem',
    fontWeight: designTokens?.typography?.heroPWeight || '400',
    maxWidth: '800px',
    margin: '0 auto',
    textShadow: '1px 1px 3px rgba(0,0,0,0.3)',
  };

  return (
    <div style={heroStyle}>
      <div style={overlayStyle}></div>
      <div style={contentStyle}>
        {title && <h1 style={h1Style}>{title}</h1>}
        {subtitle && <p style={pStyle}>{subtitle}</p>}
      </div>
    </div>
  );
};

export default HeroSection;
