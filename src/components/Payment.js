import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, X, QrCode, AlertCircle } from "lucide-react";
import { endpoint } from "../services/endpoint";
import HelpRequestModal from "./HelpRequestModal";
import VirtualKeyboard from "./VirtualKeyboard";
import { speak, messages } from "../utils/voiceAssistant";

const BACKEND_URL = endpoint;
const MAX_ATTEMPTS = 5;
const TAX_RATE = 0.13;

const PaymentFlow = ({ cart, onSuccess, onCancel }) => {
  const [stage, setStage] = useState("tap"); // tap, pin, receipt
  const [attempts, setAttempts] = useState(0);
  const [cardDetails, setCardDetails] = useState(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [qrCode, setQrCode] = useState(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);

  // Calculate totals
  const subtotal = Object.entries(cart).reduce(
    (sum, [_, item]) => sum + item.quantity * item.unit_price,
    0
  );
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  // Simulate card tap for demo
  // const handleCardTap = async () => {
  //   try {
  //     // In demo mode, simulate successful card read with sample data
  //     const sampleCard = {
  //       card_id: "123456789",
  //       expiry: "12/24",
  //       cvv: "123",
  //     };
  //     setCardDetails(sampleCard);
  //     setStage("pin");
  //     setError("");
  //   } catch (error) {
  //     setError("Error reading card. Please try again.");
  //     handleAttemptFailed();
  //   }
  // };

  useEffect(() => {
    setError(""); // Clear error when stage changes
  }, [stage]);

  useEffect(() => {
    if (stage === "tap") {
      speak(messages.tapCard);
    }
    return () => window.speechSynthesis.cancel();
  }, [stage]);

  // In the stage === "pin" section:
  useEffect(() => {
    if (stage === "pin") {
      speak(messages.enterPin);
    }
  }, [stage]);

  // In the stage === "receipt" section:
  useEffect(() => {
    if (stage === "receipt") {
      speak(messages.scanQRCode);
    }
  }, [stage]);

  const handleCardTap = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/tap_card`);
      const data = await response.json();

      if (response.ok) {
        // Card found in database
        setCardDetails(data);
        setStage("pin");
        setError(""); // Clear any existing error
      } else {
        // Card not found or other error
        setError(data.message || "Invalid card. Please try again.");
        handleAttemptFailed();
      }
    } catch (error) {
      console.error("Error reading card:", error);
      setError("Error reading card. Please try again.");
      handleAttemptFailed();
    }
  };

  // const handlePinSubmit = async () => {
  //   if (pin.length !== 4) {
  //     setError("PIN must be 4 digits");
  //     return;
  //   }

  //   try {
  //     // In demo mode, simulate PIN verification
  //     if (pin === "1234") {
  //       try {
  //         // Generate purchase ID
  //         const purchaseId = Date.now().toString();

  //         // Prepare receipt data
  //         const receiptData = {
  //           items: Object.entries(cart).map(([name, item]) => ({
  //             name,
  //             price: item.unit_price,
  //             quantity: item.quantity,
  //           })),
  //           subtotal,
  //           tax,
  //           total,
  //           timestamp: new Date().toISOString(),
  //         };

  //         // Encode receipt data for URL
  //         const encodedData = btoa(JSON.stringify(receiptData));

  //         // Generate receipt URL with encoded data
  //         const receiptUrl = `${window.location.origin}/receipt/${purchaseId}?data=${encodedData}`;

  //         // Generate QR code
  //         const QRCode = require("qrcode");
  //         const qrDataUrl = await QRCode.toDataURL(receiptUrl);

  //         setQrCode(qrDataUrl);
  //         setStage("receipt");

  //         // Auto-close after 10 seconds
  //         setTimeout(() => {
  //           onSuccess();
  //         }, 10000);
  //       } catch (error) {
  //         console.error("Error generating QR code:", error);
  //         setError("Failed to generate receipt. Please try again.");
  //       }
  //     } else {
  //       setError("Invalid PIN");
  //       setPin("");
  //       handleAttemptFailed();
  //     }
  //   } catch (error) {
  //     console.error("Payment processing error:", error);
  //     setError("Error processing payment. Please try again.");
  //     handleAttemptFailed();
  //   }
  // };

  const handlePinSubmit = async () => {
    if (pin.length !== 4) {
      setError("PIN must be 4 digits");
      return;
    }

    try {
      // Verify PIN with backend
      const response = await fetch(`${BACKEND_URL}/verify_pin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          card_id: cardDetails.card_id,
          pin: pin,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Clear error and proceed to receipt
        setError("");

        try {
          // Generate purchase ID
          const purchaseId = Date.now().toString();

          // Prepare receipt data
          const receiptData = {
            items: Object.entries(cart).map(([name, item]) => ({
              name,
              price: Number(item.unit_price) || 0,
              quantity: item.quantity,
            })),
            subtotal,
            tax,
            total,
            timestamp: new Date().toISOString(),
          };

          // Encode receipt data for URL
          const encodedData = btoa(JSON.stringify(receiptData));

          // Generate receipt URL with encoded data
          const receiptUrl = `${window.location.origin}/receipt/${purchaseId}?data=${encodedData}`;

          // Generate QR code
          const QRCode = require("qrcode");
          const qrDataUrl = await QRCode.toDataURL(receiptUrl);

          setQrCode(qrDataUrl);
          setStage("receipt");

          // Auto-close after 10 seconds
          setTimeout(() => {
            onSuccess();
          }, 20000);
        } catch (error) {
          console.error("Error generating QR code:", error);
          setError("Failed to generate receipt. Please try again.");
        }
      } else {
        setError(data.message || "Invalid PIN");
        setPin("");
        handleAttemptFailed();
      }
    } catch (error) {
      console.error("Error verifying PIN:", error);
      setError("Error verifying PIN. Please try again.");
      handleAttemptFailed();
    }
  };

  // Add cleanup for QR code URL when component unmounts
  useEffect(() => {
    let pollInterval;

    if (stage === "tap") {
      pollInterval = setInterval(async () => {
        try {
          await handleCardTap();
        } catch (error) {
          console.error("Card polling error:", error);
          // Don't set error here as handleCardTap already handles it
        }
      }, 2000);
    }

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [stage]);

  const handleAttemptFailed = () => {
    setAttempts((prev) => {
      const newAttempts = prev + 1;
      if (newAttempts >= MAX_ATTEMPTS) {
        setShowHelpModal(true);
      }
      return newAttempts;
    });
  };

  useEffect(() => {
    let pollInterval;

    if (stage === "tap") {
      // Poll for card taps every second
      pollInterval = setInterval(handleCardTap, 2000);
    }

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [stage]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg p-6 max-w-md w-full m-4"
      >
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <h2 className="text-2xl font-bold mb-4">Complete Payment</h2>

        {/* Order Summary */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Order Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (13%):</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Payment Stages */}
        <div className="mt-6">
          {stage === "tap" && (
            <div className="text-center">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="mb-6"
              >
                <CreditCard className="w-16 h-16 text-blue-500 mx-auto" />
              </motion.div>
              <p className="text-gray-600 mb-4">
                Please tap your card on the reader
              </p>
              {/* Real-time card reading status */}
              <p className="text-sm text-gray-500 mt-2">Waiting for card...</p>
            </div>
          )}

          {stage === "pin" && (
            <div className="text-center">
              <h3 className="font-semibold mb-4">Enter PIN</h3>
              <input
                type="password"
                maxLength="4"
                value={pin}
                onChange={(e) =>
                  setPin(e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                readOnly
                onClick={() => setShowKeyboard(true)}
                className="w-full text-center text-2xl tracking-widest mb-4 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="••••"
                autoFocus
              />
              <p className="text-sm text-gray-500 mb-4">
                Demo: Use PIN "1234" for successful payment
              </p>
              <button
                onClick={handlePinSubmit}
                className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Submit
              </button>
              <p className="text-sm text-gray-500 mt-2">
                Attempts remaining: {MAX_ATTEMPTS - attempts}
              </p>
            </div>
          )}

          {stage === "receipt" && (
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <QrCode className="w-16 h-16 text-green-500 mx-auto mb-4" />
                {qrCode && (
                  <img
                    src={qrCode}
                    alt="QR Code"
                    className="mx-auto max-w-[200px] mb-4"
                  />
                )}
              </motion.div>
              <p className="text-gray-600">
                Scan the QR code to view your receipt
              </p>
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 20, ease: "linear" }}
                className="h-1 bg-blue-500 mt-4"
              />
              <p className="text-sm text-gray-500 mt-2">
                This screen will close automatically in 20 seconds
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full m-4">
            <h3 className="text-xl font-bold mb-4">Assistance Required</h3>
            <p className="text-gray-600 mb-6">
              Maximum attempts reached. A staff member will be with you shortly
              to assist.
            </p>
            <button
              onClick={() => {
                // Send help request
                fetch(`${BACKEND_URL}/send-help`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    phoneNumber: "+16478650247", // Your staff notification number
                  }),
                });
                onCancel();
              }}
              className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              OK
            </button>
          </div>
        </div>
      )}

      <VirtualKeyboard
        show={showKeyboard}
        type="numeric"
        maxLength={4}
        initialValue=""
        fieldType="password"
        onInput={(value) => setPin(value)}
        onClose={() => {
          setShowKeyboard(false);
        }}
        onSubmit={(value) => {
          setPin(value);
          setShowKeyboard(false);
          handlePinSubmit();
        }}
      />
    </div>
  );
};

export default PaymentFlow;
