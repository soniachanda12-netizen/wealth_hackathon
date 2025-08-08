import React from 'react';
import './ClientPortfolioPage.css';

const ClientPortfolioPage = () => {
  return (
    <div className="client-portfolio-page">
      <h2>Client Portfolio Overview</h2>
      <div className="client-portfolio-embed">
        <iframe
          title="Client Portfolio Looker Studio"
          width="100%"
          height="600"
          style={{ border: 'none', borderRadius: '12px', minHeight: '400px', maxHeight: '700px' }}
          src="https://lookerstudio.google.com/embed/u/0/reporting/88a9a43b-8816-4bc1-bf48-f58232e6e61c/page/kB2TF"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
};

export default ClientPortfolioPage;
