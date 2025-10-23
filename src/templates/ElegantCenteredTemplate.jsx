import React from "react";
import MermaidChart from "../components/MermaidChart";
import HeroSection from "../components/proposal/HeroSection"; // Import HeroSection

const ElegantCenteredTemplate = ({ proposal, designTokens }) => {
  if (!proposal) return <div>Loading proposal...</div>;

  const tokens = {
    fonts: {
      heading: designTokens?.fonts?.heading || "'Space Mono', monospace",
      body: designTokens?.fonts?.body || "'Inter', sans-serif",
      heroH1: designTokens?.fonts?.heroH1 || "'Space Mono', monospace",
      heroP: designTokens?.fonts?.heroP || "'Inter', sans-serif",
    },
    colors: {
      primary: designTokens?.colors?.primary || "#111827", // dark gray
      secondary: designTokens?.colors?.secondary || "#2563eb", // blue accent
      textPrimary: designTokens?.colors?.textPrimary || "#1e293b",
      textSecondary: designTokens?.colors?.textSecondary || "#475569",
      background: designTokens?.colors?.background || "#ffffff",
      surface: designTokens?.colors?.surface || "#f8fafc",
      border: designTokens?.colors?.border || "#e2e8f0",
      heroText: designTokens?.colors?.heroText || "#ffffff",
      heroOverlay: designTokens?.colors?.heroOverlay || "rgba(0, 0, 0, 0.6)",
      tableHeaderBackground: designTokens?.colors?.tableHeaderBackground || "#f1f5f9",
      tableHeaderText: designTokens?.colors?.tableHeaderText || "#111827",
      tableRowEvenBackground: designTokens?.colors?.tableRowEvenBackground || "#f8fafc",
    },
    layout: {
      maxWidth: designTokens?.layout?.proposalMaxWidth || "1000px",
    },
    spacing: {
      sm: designTokens?.spacing?.sm || "0.5rem",
      md: designTokens?.spacing?.md || "1rem",
      lg: designTokens?.spacing?.lg || "1.5rem",
      sectionGap: designTokens?.spacing?.sectionGap || "4rem",
      sectionPadding: designTokens?.spacing?.sectionPadding || "2rem",
      containerPadding: designTokens?.spacing?.containerPadding || "2rem",
      heroPadding: designTokens?.spacing?.heroPadding || "5rem 2rem",
    },
    typography: {
      h1: designTokens?.typography?.h1 || "2.75rem",
      h1Weight: designTokens?.typography?.h1Weight || "700",
      h2: designTokens?.typography?.h2 || "1.8rem",
      h2Weight: designTokens?.typography?.h2Weight || "600",
      bodyLineHeight: designTokens?.typography?.bodyLineHeight || "1.9",
      bodyFontSize: designTokens?.typography?.bodyFontSize || "1.1rem",
      tableFontSize: designTokens?.typography?.tableFontSize || "1rem",
      tableHeaderWeight: designTokens?.typography?.tableHeaderWeight || "700",
      heroH1: designTokens?.typography?.heroH1 || "3.5rem",
      heroH1Weight: designTokens?.typography?.heroH1Weight || "700",
      heroP: designTokens?.typography?.heroP || "1.5rem",
      heroPWeight: designTokens?.typography?.heroPWeight || "400",
    },
    radius: {
      md: designTokens?.radius?.md || "8px",
      lg: designTokens?.radius?.lg || "12px",
    },
    shadows: {
      sm: designTokens?.shadows?.sm || "0 4px 6px rgba(0,0,0,0.05)",
      md: designTokens?.shadows?.md || "0 10px 15px rgba(0,0,0,0.1)",
    },
  };

  const styles = `
    .elegant-container {
      background: ${tokens.colors.background};
      color: ${tokens.colors.textPrimary};
      font-family: ${tokens.fonts.body};
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0;
      min-height: 100vh;
    }

    .elegant-inner {
      max-width: ${tokens.layout.maxWidth};
      width: 100%;
      line-height: ${tokens.typography.bodyLineHeight};
      letter-spacing: 0.2px;
      animation: fadeIn 1s ease-out;
      background-color: ${tokens.colors.surface};
      box-shadow: ${tokens.shadows.md};
      border-radius: ${tokens.radius.lg};
      overflow: hidden;
      margin-bottom: ${tokens.spacing.sectionGap};
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .elegant-section {
      margin-bottom: ${tokens.spacing.sectionGap};
      padding: ${tokens.spacing.sectionPadding};
      border-bottom: 1px solid ${tokens.colors.border};
      text-align: left;
    }

    .elegant-section:last-child {
      border-bottom: none;
    }

    .elegant-section h2 {
      font-family: ${tokens.fonts.heading};
      font-size: ${tokens.typography.h2};
      color: ${tokens.colors.primary};
      letter-spacing: 0.5px;
      text-transform: uppercase;
      margin-bottom: ${tokens.spacing.md};
      font-weight: ${tokens.typography.h2Weight};
      text-align: center;
    }

    .elegant-content {
      font-size: ${tokens.typography.bodyFontSize};
      color: ${tokens.colors.textPrimary};
      line-height: ${tokens.typography.bodyLineHeight};
      max-width: 700px;
      margin: 0 auto;
      text-align: center;
    }

    .elegant-content p {
      margin-bottom: ${tokens.spacing.md};
    }

    .elegant-content ul {
      list-style: disc;
      padding-left: ${tokens.spacing.lg};
      margin: ${tokens.spacing.md} 0;
      text-align: left;
      display: inline-block;
    }

    .elegant-content li {
      margin-bottom: ${tokens.spacing.sm};
      font-size: 1rem;
    }

    .elegant-content table {
      margin: ${tokens.spacing.lg} auto;
      border-collapse: collapse;
      width: 90%;
      text-align: left;
      font-size: ${tokens.typography.tableFontSize};
      border: 1px solid ${tokens.colors.border};
    }

    .elegant-content th, .elegant-content td {
      border: 1px solid ${tokens.colors.border};
      padding: ${tokens.spacing.sm};
    }

    .elegant-content th {
      font-family: ${tokens.fonts.heading};
      color: ${tokens.colors.tableHeaderText};
      background-color: ${tokens.colors.tableHeaderBackground};
      font-weight: ${tokens.typography.tableHeaderWeight};
    }

    .elegant-content tr:nth-child(even) {
      background-color: ${tokens.colors.tableRowEvenBackground};
    }

    .elegant-image {
      margin: ${tokens.spacing.md} auto;
      width: 100%;
      border-radius: ${tokens.radius.md};
      overflow: hidden;
      box-shadow: ${tokens.shadows.sm};
    }

    .elegant-image img {
      width: 100%;
      height: auto;
      display: block;
    }

    .elegant-footer {
      margin-top: ${tokens.spacing.sectionGap};
      padding: ${tokens.spacing.sectionPadding};
      font-size: 0.95rem;
      color: ${tokens.colors.textSecondary};
      border-top: 1px solid ${tokens.colors.border};
      text-align: center;
      width: 100%;
    }

    /* TECH LOGOS */
    .tech-logos-wrapper {
      margin-top: ${tokens.spacing.sectionGap};
      padding: ${tokens.spacing.sectionPadding};
      background-color: ${tokens.colors.surface};
      border-radius: ${tokens.radius.lg};
      box-shadow: ${tokens.shadows.md};
      text-align: center;
    }

    .tech-logos-title {
      font-family: ${tokens.fonts.heading};
      font-size: ${tokens.typography.h2};
      color: ${tokens.colors.primary};
      margin-bottom: ${tokens.spacing.md};
      font-weight: ${tokens.typography.h2Weight};
    }

    .tech-logos {
      display: flex;
      flex-wrap: wrap;
      gap: ${tokens.spacing.lg};
      justify-content: center;
      align-items: center;
    }

    .tech-logos img {
      height: 60px; /* Larger logos for elegance */
      filter: grayscale(80%);
      opacity: 0.8;
      transition: all 0.3s ease-in-out;
    }

    .tech-logos img:hover {
      filter: grayscale(0%);
      opacity: 1;
      transform: scale(1.1);
    }
  `;

  return (
    <div className="elegant-container">
      <style>{styles}</style>
      <div className="elegant-inner">
        {proposal.hero && (
          <HeroSection
            title={proposal.hero.title}
            subtitle={proposal.hero.subtitle}
            imageUrl={proposal.hero.imageUrl}
            designTokens={designTokens}
          />
        )}
        {/* Sections */}
        <main style={{ padding: `0 ${tokens.spacing.containerPadding}` }}>
          {proposal.sections?.sort((a, b) => a.order - b.order).map((section) => (
            <section key={section.id} className="elegant-section">
              <h2>{section.title}</h2>
              <div className="elegant-content">
                {(section.image_urls || []).map((url, index) => (
                  <div key={index} className="elegant-image">
                    <img src={url} alt="Section visual" />
                  </div>
                ))}
                <div dangerouslySetInnerHTML={{ __html: section.contentHtml }} />
                {section.mermaid_chart && (
                  <MermaidChart chart={section.mermaid_chart} />
                )}
                
                {/* Render Tech Logos for Technology Stack section */}
                {section.title.toLowerCase().includes('technology stack') && section.tech_logos && section.tech_logos.length > 0 && (
                  <div className="tech-logos-wrapper">
                    <h3 className="tech-logos-title">Core Technologies</h3>
                    <div className="tech-logos">
                      {section.tech_logos.map((logo, index) => (
                        <img key={index} src={logo.logo_url} alt={logo.name} title={logo.name} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          ))}
        </main>



        {/* Footer */}
        <footer className="elegant-footer">
          © {new Date().getFullYear()} {proposal.companyName} • {proposal.companyContact}
        </footer>
      </div>
    </div>
  );
};

export default ElegantCenteredTemplate;
