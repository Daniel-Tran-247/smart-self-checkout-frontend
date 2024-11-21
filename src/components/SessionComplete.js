import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, CheckCircle2 } from "lucide-react";
import { speak, messages } from "../utils/voiceAssistant";
import { endpoint } from "../services/endpoint";

const BACKEND_URL = endpoint;

// SessionComplete.js
const SessionComplete = ({ onStartNew }) => {
  useEffect(() => {
    speak(messages.thankYou);
    return () => window.speechSynthesis.cancel();
  }, []);

  const handleStartNew = async () => {
    try {
      // Show loading state
      const button = document.querySelector("#reset-button");
      if (button) {
        button.disabled = true;
        button.textContent = "Resetting Session...";
      }

      // Call backend to reset session
      const response = await fetch(`${BACKEND_URL}/reset-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Reset failed");
      }

      sessionStorage.setItem('forceInstructionPage', 'true');

      // Wait a moment before triggering frontend reset
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Call the parent handler to reset frontend state
      onStartNew();
    } catch (error) {
      console.error("Error resetting session:", error);
      alert("Error resetting session. Please try again or refresh the page.");

      // Reset button state
      const button = document.querySelector("#reset-button");
      if (button) {
        button.disabled = false;
        button.textContent = "Start New Session";
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center text-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-lg mx-auto"
      >
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", duration: 1.5, bounce: 0.5 }}
          className="mb-8"
        >
          <CheckCircle2 className="w-24 h-24 text-green-500 mx-auto" />
        </motion.div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Thank You for Shopping!
        </h1>

        <p className="text-gray-600 mb-8">
          Your purchase has been completed successfully. Don't forget to take
          your items and receipt.
        </p>

        <div className="flex items-center justify-center gap-3 mb-8">
          <ShoppingBag className="w-6 h-6 text-blue-500" />
          <span className="text-lg text-blue-500 font-medium">
            Smart Checkout
          </span>
        </div>

        <motion.button
          id="reset-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStartNew}
          className="px-8 py-4 bg-blue-500 text-white rounded-lg text-lg font-medium
                   hover:bg-blue-600 transition-colors shadow-lg disabled:opacity-50 
                   disabled:cursor-not-allowed"
        >
          Start New Session
        </motion.button>
      </motion.div>
    </div>
  );
};

export default SessionComplete;
