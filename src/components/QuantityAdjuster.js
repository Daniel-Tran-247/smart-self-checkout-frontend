import React, { useState, useEffect } from "react";

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        {children}
      </div>
    </div>
  );
};

const QuantityAdjuster = ({
  itemName,
  currentQuantity,
  unitPrice,
  onQuantityChange,
  baselineQuantity,
  isScanning,
  disabled,
}) => {
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [newQuantity, setNewQuantity] = useState(currentQuantity);

  useEffect(() => {
    setNewQuantity(currentQuantity);
  }, [currentQuantity]);

  const handleQuantityChange = (change) => {
    const updatedQuantity = newQuantity + change;
    const quantityDiff = baselineQuantity - updatedQuantity;
    const costDifference = quantityDiff * unitPrice;

    // Don't allow reducing below 0
    if (updatedQuantity < 0) return;

    // If reducing quantity
    if (change < 0) {
      // Check if reduction is more than baseline
      if (updatedQuantity < baselineQuantity) {
        // Check if cost difference exceeds $5
        if (costDifference > 5) {
          setShowHelpModal(true);
          return;
        }
        // Show warning modal for reductions
        setShowWarningModal(true);
      }
    }

    setNewQuantity(updatedQuantity);
    onQuantityChange(itemName, updatedQuantity);
  };

  // If disabled, just show the quantity without adjustment buttons
  if (disabled) {
    return (
      <div className="flex items-center justify-center">
        <span className="min-w-[2rem] text-center font-medium">
          {currentQuantity}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      {/* Existing buttons and modals */}
      <button
        onClick={() => handleQuantityChange(-1)}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <svg
          className="w-5 h-5 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>

      <span className="min-w-[2rem] text-center font-medium">
        {newQuantity}
      </span>

      <button
        onClick={() => handleQuantityChange(1)}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <svg
          className="w-5 h-5 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>

      {/* ... rest of the component (modals) ... */}
    </div>
  );
};

export default QuantityAdjuster;
