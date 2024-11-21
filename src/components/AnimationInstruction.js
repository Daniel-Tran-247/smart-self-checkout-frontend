import { motion } from "framer-motion";
import React from "react";

const AnimationInstruction = ({ onProceed }) => {
  return (
    <div className="h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden"
      >
        <div className="p-2 bg-blue-500 text-white text-center">
          <h1 className="text-3xl font-bold">Smart Checkout Instructions</h1>
        </div>

        <div className="p-8">
          <video
            src="Automatic item recognition.mp4"
            autoPlay
            loop
            controls
            className="w-full rounded-lg"
          />

          <motion.button
            onClick={onProceed}
            className="mt-6 w-full py-3 text-white font-bold rounded-lg transition-all duration-300 bg-green-500 hover:bg-green-600 active:bg-green-700"
          >
            Start Scanning
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default AnimationInstruction;
