import React from "react";
import MermaidChart from "../components/MermaidChart";

const ClassicTemplate = ({ proposal, designTokens }) => {
  if (!proposal) return <div>Loading proposal...</div>;

  const tokens = {
    fonts: {
      heading: designTokens?.fonts?.heading || "'Poppins', sans-serif",
      body: designTokens?.fonts?.body || "'Inter', sans-serif",
    },
    colors: {
      primary: designTokens?.colors?.primary || "#2563eb",
      secondary: designTokens?.colors?.secondary || "#1e293b",
      text: designTokens?.colors?.textPrimary || "#334155",
      background: designTokens?.colors?.background || "#f9fafb",
      surface: designTokens?.colors?.surface || "#ffffff",
      border: designTokens?.colors?.border || "#e2e8f0",
      accent: designTokens?.colors?.accent || "#38bdf8",
    },
    layout: {
      maxWidth: "1000px",
    },
  };

  const styles = `
    body {
      background: ${tokens.colors.background};
    }

    .classic-container {
      font-family: ${tokens.fonts.body};
      color: ${tokens.colors.text};
      background: ${tokens.colors.background};
      min-height: 100vh;
      display: flex;
      justify-content: center;
      padding: 3rem 1rem;
    }

    .classic-inner {
      width: 100%;
      max-width: ${tokens.layout.maxWidth};
      background: ${tokens.colors.surface};
      border-radius: 16px;
      box-shadow: 0 4px 30px rgba(0,0,0,0.05);
      padding: 2.5rem 3rem;
      animation: fadeIn 0.4s ease-in-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* HEADER */
    .classic-header {
      text-align: center;
      margin-bottom: 2.5rem;
      border-bottom: 2px solid ${tokens.colors.border};
      padding-bottom: 1.5rem;
    }

    .classic-header img {
      max-height: 70px;
      margin-bottom: 0.75rem;
    }

    .classic-h1 {
      font-family: ${tokens.fonts.heading};
      font-size: 2.2rem;
      color: ${tokens.colors.primary};
      font-weight: 700;
      margin: 0.5rem 0;
    }

    .classic-subtitle {
      font-size: 1rem;
      color: ${tokens.colors.secondary};
      opacity: 0.8;
    }

    /* SECTION */
    .classic-section {
      margin-bottom: 2rem;
      padding: 2rem 2rem;
      border: 1px solid ${tokens.colors.border};
      border-radius: 14px;
      background: ${tokens.colors.surface};
      transition: all 0.3s ease;
    }

    .classic-section:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0,0,0,0.05);
    }

    .classic-h2 {
      font-family: ${tokens.fonts.heading};
      font-size: 1.6rem;
      color: ${tokens.colors.secondary};
      border-left: 4px solid ${tokens.colors.primary};
      padding-left: 0.75rem;
      margin-bottom: 1rem;
      font-weight: 600;
    }

    .classic-content {
      font-size: 1.05rem;
      line-height: 1.7;
      color: ${tokens.colors.text};
    }

    .classic-content p { margin-bottom: 1rem; }

    .classic-content img {
      width: 100%;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      margin: 1.25rem 0;
    }

    /* TABLE STYLING */
    .classic-content table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.25rem 0;
      font-size: 0.95rem;
      text-align: left;
    }

    .classic-content th, .classic-content td {
      border: 1px solid ${tokens.colors.border};
      padding: 0.75rem 1rem;
    }

    .classic-content th {
      background: ${tokens.colors.primary};
      color: white;
      font-weight: 600;
    }

    .classic-content tr:nth-child(even) {
      background: #f8fafc;
    }

    /* MERMAID */
    .mermaid-chart-section {
      margin: 2.5rem 0;
      text-align: center;
    }

    .mermaid-chart-section h2 {
      font-family: ${tokens.fonts.heading};
      font-size: 1.6rem;
      color: ${tokens.colors.primary};
      margin-bottom: 1rem;
    }

    .mermaid-chart-container-template {
      background: ${tokens.colors.surface};
      border: 1px solid ${tokens.colors.border};
      border-radius: 12px;
      padding: 1.25rem;
      overflow-x: auto;
      box-shadow: 0 4px 14px rgba(0,0,0,0.04);
    }

    /* TECH LOGOS */
    .tech-logos-wrapper {
      margin-top: 2rem;
      padding: 1.25rem;
      background: ${tokens.colors.surface};
      border-radius: 10px;
      border: 1px solid ${tokens.colors.border};
      text-align: center;
    }

    .tech-logos-title {
      font-family: ${tokens.fonts.heading};
      font-size: 1.3rem;
      color: ${tokens.colors.secondary};
      margin-bottom: 1rem;
      font-weight: 600;
    }

    .tech-logos {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      justify-content: center;
    }

    .tech-logos img {
      height: 40px;
      transition: all 0.25s ease;
    }

    .tech-logos img:hover {
      filter: none;
      transform: scale(1.05);
    }

    /* FOOTER */
    .proposal-footer {
      text-align: center;
      border-top: 1px solid ${tokens.colors.border};
      padding-top: 1.5rem;
      font-size: 0.9rem;
      color: ${tokens.colors.secondary};
      opacity: 0.8;
      margin-top: 2.5rem;
    }
  `;

  return (
    <div className="classic-container">
      <style>{styles}</style>
      <div className="classic-inner">
        {/* HEADER */}
        <header className="classic-header">
          {proposal.companyLogoUrl && (
            <img src={proposal.companyLogoUrl} alt="Company Logo" />
          )}
          <h1 className="classic-h1">{proposal.clientName}</h1>
          <div className="classic-subtitle">{proposal.companyName}</div>
        </header>

        {/* MAIN CONTENT */}
        <main>
          {proposal.sections
            ?.sort((a, b) => b.order - a.order)
            .map((section) => (
              <React.Fragment key={`section-${section.id}`}>
                {!section.mermaid_chart && (
                  <section className="classic-section">
                    <h2 className="classic-h2">{section.title}</h2>
                    <div className="classic-content">
                      {section.image_placement === "full-width-top" &&
                        Array.isArray(section.images) &&
                        section.images.map((image) => (
                          <img key={`img-${section.id}-${image.id || image.url}`} src={image.url} alt={image.alt || "Section Image"} />
                        ))}

                      <div
                        dangerouslySetInnerHTML={{ __html: section.contentHtml }}
                      />

                      {section.image_placement === "full-width-bottom" &&
                        Array.isArray(section.images) &&
                        section.images.map((image) => (
                          <img key={`img-bottom-${section.id}-${image.id || image.url}`} src={image.url} alt={image.alt || "Section Image"} />
                        ))}

                      {typeof section.title === "string" &&
                        section.title.toLowerCase().includes("technology stack") &&
                        Array.isArray(section.tech_logos) &&
                        section.tech_logos.length > 0 && (
                          <div className="tech-logos-wrapper">
                            <h3 className="tech-logos-title">
                              Technologies We Use
                            </h3>
                            <div className="tech-logos">
                              {section.tech_logos.map((logo: any, index: number) => (
                                <div
                                  key={`tech-${section.id}-${logo.logo_url || logo.name}-${index}`}
                                  style={{ textAlign: "center" }}
                                >
                                  {logo.logo_url && (
                                    <img
                                      src={logo.logo_url}
                                      alt={logo.name}
                                      title={logo.name}
                                    />
                                  )}
                                  {logo.description && (
                                    <p
                                      style={{
                                        fontSize: "0.8rem",
                                        marginTop: "0.4rem",
                                      }}
                                    >
                                      {/* {logo.description} */}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  </section>
                )}

                {section.mermaid_chart && (
                  <div className="mermaid-chart-section">
                    <h2>{section.title || "Project Timeline"}</h2>
                    <div className="mermaid-chart-container-template">
                      <MermaidChart chart={section.mermaid_chart} />
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
        </main>

        {/* FOOTER */}
        <footer className="proposal-footer">
          © {new Date().getFullYear()} {proposal.companyName} ·{" "}
          {proposal.companyContact}
        </footer>
      </div>
    </div>
  );
};

export default ClassicTemplate;
