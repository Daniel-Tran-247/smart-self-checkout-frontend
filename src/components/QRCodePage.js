import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { endpoint } from "../services/endpoint";

const BACKEND_URL = endpoint;

const QRCodePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const qrCodeUrl = location.state?.qrCodeUrl;
  const [showHelpMessage, setShowHelpMessage] = useState(false);

  const handleHelpClick = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/send-help`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber: "+16475335485" }), // Replace with store associate's number
      });

      const result = await response.json();
      if (result.success) {
        setShowHelpMessage(true);
      } else {
        alert("Error sending help request.");
      }
    } catch (error) {
      alert("Network error.");
    }
  };

  const handleCloseClick = () => {
    setShowHelpMessage(false);
  };

  return (
    <div className="qr-code-page">
      {!showHelpMessage ? (
        <>
          <p>Scan the QR code to get your receipt:</p>
          {qrCodeUrl ? (
            <img src={qrCodeUrl} alt="QR Code" />
          ) : (
            <p>No QR Code available</p>
          )}

          <button onClick={() => navigate(-1)} className="back-button">
            Back
          </button>

          <button onClick={handleHelpClick} className="help-button">
            Help
          </button>
        </>
      ) : (
        <div className="help-message">
          <p>A MEMBER OF THE STAFF IS COMING</p>
          <div className="help-icon">
            <img src="help.png" alt="Walking Icon" />{" "}
            {/* Replace with your walking icon file */}
          </div>
          <button onClick={handleCloseClick} className="close-button">
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default QRCodePage;
