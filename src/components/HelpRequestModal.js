import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserRound, X, AlertCircle } from "lucide-react";
import { endpoint } from "../services/endpoint";

const HelpRequestModal = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for exit animation
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const handleSendHelpRequest = async () => {
    try {
      const response = await fetch(`${endpoint}/send-help`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: "+16478650247",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send help request");
      }
    } catch (err) {
      setError("Unable to contact staff. Please try again.");
      setTimeout(() => setError(null), 3000);
    }
  };

  useEffect(() => {
    handleSendHelpRequest();
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative shadow-xl"
          >
            {/* Close button */}
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
              }}
              className="absolute right-4 top-4 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Content */}
            <div className="text-center pt-4">
              {/* Animated helper icon */}
              <motion.div
                animate={{
                  x: [-20, 20, -20],
                  transition: {
                    repeat: Infinity,
                    duration: 2,
                    ease: "linear",
                  },
                }}
                className="mb-6 flex justify-center"
              >
                <div className="relative">
                  <UserRound className="w-16 h-16 text-blue-500" />
                  {/* Walking animation dots */}
                  <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1">
                    <motion.div
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{
                        repeat: Infinity,
                        duration: 1,
                        delay: 0,
                      }}
                      className="w-2 h-2 bg-blue-500 rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{
                        repeat: Infinity,
                        duration: 1,
                        delay: 0.3,
                      }}
                      className="w-2 h-2 bg-blue-500 rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{
                        repeat: Infinity,
                        duration: 1,
                        delay: 0.6,
                      }}
                      className="w-2 h-2 bg-blue-500 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Message */}
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Help is on the way!
              </h3>
              <p className="text-gray-600 mb-4">
                A staff member will be with you shortly.
              </p>

              {/* Error message */}
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 text-left">
                    <h4 className="text-sm font-semibold text-red-800">
                      Error
                    </h4>
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HelpRequestModal;
