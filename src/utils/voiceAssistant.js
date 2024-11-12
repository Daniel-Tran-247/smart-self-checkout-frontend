// src/utils/voiceAssistant.js

export const speak = (text, options = {}) => {
  if ("speechSynthesis" in window) {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Default options
    utterance.rate = options.rate || 0.9;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;
    utterance.lang = options.lang || "en-US";

    window.speechSynthesis.speak(utterance);

    return new Promise((resolve) => {
      utterance.onend = resolve;
    });
  }
  return Promise.resolve();
};

// Predefined messages for consistency
export const messages = {
  reviewInstructions:
    "Once you proceed to review your cart, you'll need to complete this transaction. Make sure you've scanned all you items before conitnuing.",
  tapCard: "Please tap your card on the reader",
  scanQRCode: "Please scan the QR code from your phone to get the receipt",
  thankYou:
    "Thank you for shopping with us! Don't forget to take your items and receipt.",
  enterPin: "Please enter your PIN",
  processingPayment: "Processing payment, please wait",
  paymentSuccess: "Payment successful",
};
