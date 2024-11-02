import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, X, QrCode, AlertCircle } from "lucide-react";
import { endpoint } from "../services/endpoint";

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

  // Calculate totals
  const subtotal = Object.entries(cart).reduce(
    (sum, [_, item]) => sum + item.quantity * item.unit_price,
    0
  );
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  // Simulate card tap for demo
  const handleCardTap = async () => {
    try {
      // In demo mode, simulate successful card read with sample data
      const sampleCard = {
        card_id: "123456789",
        expiry: "12/24",
        cvv: "123",
      };
      setCardDetails(sampleCard);
      setStage("pin");
      setError("");
    } catch (error) {
      setError("Error reading card. Please try again.");
      handleAttemptFailed();
    }
  };

  //   const handlePinSubmit = async () => {
  //     if (pin.length !== 4) {
  //       setError("PIN must be 4 digits");
  //       return;
  //     }

  //     try {
  //       // In demo mode, simulate PIN verification
  //       if (pin === "1234") {
  //         try {
  //           // Generate purchase ID
  //           const purchaseId = Date.now().toString();
  //           console.log("Generating QR code for purchase:", purchaseId);

  //           // Prepare cart data for the receipt
  //           const cartData = {
  //             items: Object.entries(cart).map(([name, item]) => ({
  //               name,
  //               price: item.unit_price,
  //               quantity: item.quantity,
  //               image_path: item.image_path,
  //             })),
  //             subtotal,
  //             tax,
  //             total,
  //           };

  //           // Make request to generate QR code
  //           const response = await fetch(
  //             `${BACKEND_URL}/generate_qr/${purchaseId}`,
  //             {
  //               method: "POST",
  //               headers: {
  //                 "Content-Type": "application/json",
  //               },
  //               body: JSON.stringify(cartData),
  //             }
  //           );

  //           if (!response.ok) {
  //             const errorData = await response.json();
  //             console.error("QR code generation error:", errorData);
  //             throw new Error(errorData.error || "Failed to generate QR code");
  //           }

  //           // Convert response to blob
  //           const blob = await response.blob();
  //           const qrCodeUrl = URL.createObjectURL(blob);

  //           console.log("QR code generated successfully");
  //           setQrCode(qrCodeUrl);
  //           setStage("receipt");

  //           // Auto-close after 10 seconds
  //           setTimeout(() => {
  //             onSuccess();
  //           }, 10000);
  //         } catch (error) {
  //           console.error("Error generating QR code:", error);
  //           setError("Failed to generate receipt. Please try again.");
  //         }
  //       } else {
  //         setError("Invalid PIN");
  //         setPin("");
  //         handleAttemptFailed();
  //       }
  //     } catch (error) {
  //       console.error("Payment processing error:", error);
  //       setError("Error processing payment. Please try again.");
  //       handleAttemptFailed();
  //     }
  //   };

  const handlePinSubmit = async () => {
    if (pin.length !== 4) {
      setError("PIN must be 4 digits");
      return;
    }

    try {
      // In demo mode, simulate PIN verification
      if (pin === "1234") {
        try {
          // Generate purchase ID
          const purchaseId = Date.now().toString();

          // Prepare receipt data
          const receiptData = {
            items: Object.entries(cart).map(([name, item]) => ({
              name,
              price: item.unit_price,
              quantity: item.quantity,
              image_path: item.image_path,
            })),
            subtotal,
            tax,
            total,
            timestamp: new Date().toISOString(),
          };

          // Store receipt data in localStorage
          localStorage.setItem(
            `receipt_${purchaseId}`,
            JSON.stringify(receiptData)
          );

          // Generate receipt URL
          const receiptUrl = `${window.location.origin}/receipt/${purchaseId}`;

          // Generate QR code
          const QRCode = require("qrcode");
          const qrDataUrl = await QRCode.toDataURL(receiptUrl);

          setQrCode(qrDataUrl);
          setStage("receipt");

          // Auto-close after 10 seconds
          setTimeout(() => {
            onSuccess();
          }, 10000);
        } catch (error) {
          console.error("Error generating QR code:", error);
          setError("Failed to generate receipt. Please try again.");
        }
      } else {
        setError("Invalid PIN");
        setPin("");
        handleAttemptFailed();
      }
    } catch (error) {
      console.error("Payment processing error:", error);
      setError("Error processing payment. Please try again.");
      handleAttemptFailed();
    }
  };

  // Add cleanup for QR code URL when component unmounts
  useEffect(() => {
    return () => {
      if (qrCode) {
        URL.revokeObjectURL(qrCode);
      }
    };
  }, [qrCode]);

  const handleAttemptFailed = () => {
    setAttempts((prev) => {
      const newAttempts = prev + 1;
      if (newAttempts >= MAX_ATTEMPTS) {
        setShowHelpModal(true);
      }
      return newAttempts;
    });
  };

  const ReceiptView = () => (
    <div className="text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <QrCode className="w-16 h-16 text-green-500 mx-auto mb-4" />
        {qrCode && (
          <div className="relative">
            <img
              src={qrCode}
              alt="QR Code for receipt"
              className="mx-auto max-w-[200px] mb-4 rounded-lg shadow-lg"
            />
            <p className="text-sm text-gray-500 mt-2">
              Scan to view your receipt
            </p>
          </div>
        )}
      </motion.div>

      <div className="relative mt-8 mb-4 h-1 bg-gray-200 rounded">
        <motion.div
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: 10, ease: "linear" }}
          className="absolute top-0 left-0 h-full bg-blue-500 rounded"
        />
      </div>

      <p className="text-sm text-gray-600">
        This screen will close automatically in 10 seconds
      </p>
    </div>
  );

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
              {/* Demo button */}
              <button
                onClick={handleCardTap}
                className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Simulate Card Tap
              </button>
              <p className="text-sm text-gray-500 mt-2">
                Demo: Click to simulate tapping a card
              </p>
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
                transition={{ duration: 10, ease: "linear" }}
                className="h-1 bg-blue-500 mt-4"
              />
              <p className="text-sm text-gray-500 mt-2">
                This screen will close automatically in 10 seconds
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
              onClick={onCancel}
              className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentFlow;
