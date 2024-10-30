import React, { useState, useEffect } from "react";

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
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
  disabled,
}) => {
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showInitialModal, setShowInitialModal] = useState(false);
  const [newQuantity, setNewQuantity] = useState(currentQuantity);
  const [isFirstAdjustment, setIsFirstAdjustment] = useState(true);

  useEffect(() => {
    setNewQuantity(currentQuantity);
  }, [currentQuantity]);

  const handleInitialAdjustment = () => {
    if (isFirstAdjustment && !disabled) {
      setShowInitialModal(true);
      setIsFirstAdjustment(false);
    }
  };

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
        return;
      }
    }

    setNewQuantity(updatedQuantity);
    onQuantityChange(itemName, updatedQuantity);
  };

  if (disabled) {
    return (
      <div className="flex items-center justify-center">
        <span className="text-center font-medium">{currentQuantity}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center space-x-2 group">
      <div
        className="flex items-center bg-gray-50 rounded-lg p-1 transition-all duration-200 hover:bg-gray-100"
        onClick={handleInitialAdjustment}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleQuantityChange(-1);
          }}
          className="p-2 rounded-full hover:bg-gray-200 transition-colors"
          title="Decrease quantity"
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

        <span className="min-w-[3rem] text-center font-medium text-lg">
          {newQuantity}
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleQuantityChange(1);
          }}
          className="p-2 rounded-full hover:bg-gray-200 transition-colors"
          title="Increase quantity"
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
      </div>

      {/* Initial Adjustment Modal */}
      <Modal
        isOpen={showInitialModal}
        onClose={() => setShowInitialModal(false)}
      >
        <div className="flex items-start mb-6">
          <svg
            className="w-6 h-6 text-blue-500 mr-3 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Quantity Adjustment Notice
            </h3>
            <p className="mt-2 text-gray-600">
              You are about to modify the quantity of{" "}
              <span className="font-medium">{itemName}</span>. Please note that
              this adjustment session will be recorded for security purposes.
            </p>
            <div className="mt-4 bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Rules:</span>
                <ul className="list-disc ml-5 mt-1 space-y-1">
                  <li>You can increase quantities without limitation</li>
                  <li>
                    Quantity reductions up to $5.00 total can be self-served
                  </li>
                  <li>Larger reductions require staff assistance</li>
                </ul>
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setShowInitialModal(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => setShowInitialModal(false)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Proceed with Adjustment
          </button>
        </div>
      </Modal>

      {/* Warning Modal */}
      <Modal
        isOpen={showWarningModal}
        onClose={() => setShowWarningModal(false)}
      >
        <div className="flex items-start mb-6">
          <svg
            className="w-6 h-6 text-yellow-500 mr-3 flex-shrink-0"
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
            <h3 className="text-lg font-semibold text-gray-900">
              Confirm Quantity Reduction
            </h3>
            <p className="mt-2 text-gray-600">
              You are reducing the quantity of{" "}
              <span className="font-medium">{itemName}</span> by{" "}
              {baselineQuantity - newQuantity} unit(s). Please ensure you have
              returned the item(s) to the shelf.
            </p>
            <div className="mt-4 bg-yellow-50 p-3 rounded-lg">
              <p className="text-sm text-yellow-800">
                This action will be recorded and may be subject to random audit
                for security purposes.
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setShowWarningModal(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              setShowWarningModal(false);
              onQuantityChange(itemName, newQuantity);
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Confirm Reduction
          </button>
        </div>
      </Modal>

      {/* Help Modal */}
      <Modal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)}>
        <div className="flex items-start mb-6">
          <svg
            className="w-6 h-6 text-blue-500 mr-3 flex-shrink-0"
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
            <h3 className="text-lg font-semibold text-gray-900">
              Assistance Required
            </h3>
            <p className="mt-2 text-gray-600">
              The quantity reduction you're requesting exceeds our self-service
              limit ($5.00). An assistant will be notified to help you with this
              adjustment.
            </p>
            <div className="mt-4 bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                Please wait for a staff member to assist you. They will help you
                complete this adjustment securely.
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowHelpModal(false)}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Okay, I'll Wait
        </button>
      </Modal>
    </div>
  );
};

export default QuantityAdjuster;
