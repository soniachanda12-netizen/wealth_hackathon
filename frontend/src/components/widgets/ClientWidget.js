
import React from 'react';

const ClientWidget = () => {
  return (
    <div style={{ width: '100%', height: '600px', border: 'none', padding: 0 }}>
      <iframe
        title="Client Portfolio Looker Studio"
        width="100%"
        height="600"
        style={{ border: 'none' }}
        src="https://lookerstudio.google.com/embed/reporting/88a9a43b-8816-4bc1-bf48-f58232e6e61c/page/kB2TF"
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default ClientWidget;
