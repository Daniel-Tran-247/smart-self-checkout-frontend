import React, { useState } from "react";

const QuantityAdjuster = ({
  itemName,
  currentQuantity,
  unitPrice,
  onQuantityChange,
  originalQuantity,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newQuantity, setNewQuantity] = useState(currentQuantity);
  const [action, setAction] = useState(null);

  const handleQuantityChange = (delta) => {
    const proposedQuantity = currentQuantity + delta;

    // Check if reducing below original quantity
    if (delta < 0) {
      const reducedQuantity = originalQuantity - proposedQuantity;
      const priceDifference = reducedQuantity * unitPrice;

      if (proposedQuantity < 0) {
        return; // Prevent negative quantities
      }

      if (priceDifference > 5) {
        alert(
          "Please wait for assistance. An associate will help you with this quantity reduction."
        );
        return;
      }
    }

    setNewQuantity(proposedQuantity);
    setAction(delta < 0 ? "reduce" : "increase");
    setIsDialogOpen(true);
  };

  const confirmChange = () => {
    onQuantityChange(itemName, newQuantity);
    setIsDialogOpen(false);
  };

  return (
    <div className="relative">
      <div className="flex items-center space-x-2">
        <button
          className={`p-1 w-8 h-8 rounded border border-gray-300 flex items-center justify-center
            ${
              currentQuantity <= 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white hover:bg-gray-50 active:bg-gray-100"
            }`}
          onClick={() => handleQuantityChange(-1)}
          disabled={currentQuantity <= 0}
        >
          <span className="text-lg font-bold">-</span>
        </button>

        <span className="min-w-[3ch] text-center">{currentQuantity}</span>

        <button
          className="p-1 w-8 h-8 rounded border border-gray-300 bg-white hover:bg-gray-50 active:bg-gray-100 flex items-center justify-center"
          onClick={() => handleQuantityChange(1)}
        >
          <span className="text-lg font-bold">+</span>
        </button>
      </div>

      {/* Modal Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">
                Quantity Adjustment Confirmation
              </h3>
              <div className="space-y-4">
                {action === "reduce" ? (
                  <>
                    <p>
                      You're reducing the quantity of {itemName} from{" "}
                      {currentQuantity} to {newQuantity}.
                    </p>
                    <p className="text-yellow-600 font-medium">
                      Please ensure you have returned the item(s) to the shelf.
                      This action will be recorded and may be subject to random
                      audit.
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      You're increasing the quantity of {itemName} from{" "}
                      {currentQuantity} to {newQuantity}.
                    </p>
                    <p>
                      Please ensure all items are visible to the scanner for
                      verification.
                    </p>
                  </>
                )}
                <p className="text-sm text-gray-500">
                  Note: This scanning session will be recorded to ensure process
                  integrity.
                </p>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                onClick={confirmChange}
              >
                Confirm Change
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuantityAdjuster;
