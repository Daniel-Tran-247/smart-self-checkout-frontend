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

  return (
    <div className="flex items-center space-x-2">
      {/* Minus Button */}
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

      {/* Quantity Display */}
      <span className="min-w-[2rem] text-center font-medium">
        {newQuantity}
      </span>

      {/* Plus Button */}
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

      {/* Scanning Indicator */}
      {isScanning && (
        <span className="text-xs text-gray-500 italic ml-2">
          Scanning in progress...
        </span>
      )}

      {/* Warning Modal */}
      <Modal
        isOpen={showWarningModal}
        onClose={() => setShowWarningModal(false)}
      >
        <div className="flex items-start mb-4">
          <svg
            className="w-6 h-6 text-yellow-500 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div>
            <h3 className="text-lg font-semibold">
              Quantity Reduction Warning
            </h3>
            <p className="text-gray-600 mt-2">
              You are reducing the quantity of {itemName}. Please ensure you
              have returned the item(s) to the shelf. This action will be
              recorded and may be subject to random audit.
            </p>
          </div>
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setShowWarningModal(false)}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              setShowWarningModal(false);
              onQuantityChange(itemName, newQuantity);
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Confirm Reduction
          </button>
        </div>
      </Modal>

      {/* Help Modal */}
      <Modal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)}>
        <div className="flex items-start mb-4">
          <svg
            className="w-6 h-6 text-blue-500 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h3 className="text-lg font-semibold">Assistance Required</h3>
            <p className="text-gray-600 mt-2">
              The quantity reduction you're requesting exceeds our self-service
              limit ($5.00). An assistant will be notified to help you with this
              adjustment.
            </p>
          </div>
        </div>
        <div className="flex justify-end">
          <button
            onClick={() => setShowHelpModal(false)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Okay
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default QuantityAdjuster;
