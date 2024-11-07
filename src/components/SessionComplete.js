import React from "react";
import { motion } from "framer-motion";
import { ShoppingBag, CheckCircle2 } from "lucide-react";

const SessionComplete = ({ onStartNew }) => {
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
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStartNew}
          className="px-8 py-4 bg-blue-500 text-white rounded-lg text-lg font-medium
                   hover:bg-blue-600 transition-colors shadow-lg"
        >
          Start New Session
        </motion.button>
      </motion.div>
    </div>
  );
};

export default SessionComplete;
