import React from "react";

const PortfolioWidget = () => (
  <div style={{ width: "100%", height: "90vh", marginTop: "2rem" }}>
    <iframe
      title="Client Portfolio Analytics"
      width="100%"
      height="100%"
      style={{ border: "none", minHeight: "700px" }}
      src="https://lookerstudio.google.com/embed/reporting/88a9a43b-8816-4bc1-bf48-f58232e6e61c/page/kB2TF"
      allowFullScreen
    ></iframe>
  </div>
);

export default PortfolioWidget;
