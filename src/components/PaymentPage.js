// PaymentPage.js
import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { endpoint } from "../services/endpoint";

const BACKEND_URL = endpoint;

const PaymentPage = () => {
  const [loading, setLoading] = useState(false);
  const [showHelpMessage, setShowHelpMessage] = useState(false);
  const navigate = useNavigate();

  const handleGenerateQrCode = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${BACKEND_URL}/generate_qr/example123`,
        {
          responseType: "blob",
        }
      );
      const qrCodeImageUrl = URL.createObjectURL(response.data);
      navigate("/qr-code", {
        state: {
          qrCodeUrl: qrCodeImageUrl,
          receiptUrl: `${BACKEND_URL}/receipts/example123`,
        },
      });
    } catch (error) {
      console.error("Error fetching QR code:", error);
    }
    setLoading(false);
  };

  const handleHelpClick = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/send-help`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber: "+16475335485" }),
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
    <div className="App">
      {!showHelpMessage ? (
        <>
          <h2 className="font-bold">Payment Completed!</h2>
          <button onClick={handleGenerateQrCode}>Get QR Code</button>
          {loading && <p>Generating QR code...</p>}
          <button onClick={handleHelpClick} className="help-button">
            Help
          </button>
        </>
      ) : (
        <div className="help-message">
          <p>A MEMBER OF THE STAFF IS COMING</p>
          <div className="help-icon">
            <img src="help.png" alt="Walking Icon" />
          </div>
          <button onClick={handleCloseClick} className="close-button">
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;
