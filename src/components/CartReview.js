import React, { useState } from "react";
import { MinusCircle, PlusCircle, HelpCircle, AlertCircle } from "lucide-react";

const PRICE_REDUCTION_LIMIT = 5.0;

const CartReview = ({
  confirmedObjects,
  onUpdateQuantity,
  onRequestHelp,
  onBack,
  onConfirm,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});
  const [originalQuantities, setOriginalQuantities] = useState({});
  const [modifiedCart, setModifiedCart] = useState(confirmedObjects);

  // Initialize original quantities when component mounts
  React.useEffect(() => {
    const originals = {};
    Object.entries(confirmedObjects).forEach(([itemName, item]) => {
      originals[itemName] = item.quantity;
    });
    setOriginalQuantities(originals);
    setModifiedCart(confirmedObjects);
  }, [confirmedObjects]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const calculatePriceChange = (itemName, newQuantity) => {
    const item = modifiedCart[itemName];
    const quantityDiff = newQuantity - item.quantity;
    return quantityDiff * item.unit_price;
  };

  const calculateTotalReductionValue = (itemName, newQuantity) => {
    const item = modifiedCart[itemName];
    const originalQuantity = originalQuantities[itemName];
    const currentQuantity = item.quantity;

    if (newQuantity >= originalQuantity) return 0;

    const reductionQuantity = currentQuantity - newQuantity;
    return reductionQuantity * item.unit_price;
  };

  const handleQuantityChange = (itemName, newQuantity) => {
    const item = modifiedCart[itemName];
    const isReduction = newQuantity < item.quantity;
    const reductionValue = calculateTotalReductionValue(itemName, newQuantity);

    if (isReduction && reductionValue > PRICE_REDUCTION_LIMIT) {
      setAlertConfig({
        title: "Assistance Required",
        description:
          "The requested reduction exceeds our self-service limit of $5.00. An assistant will be called to help you.",
        showHelp: true,
        action: () => {
          onRequestHelp();
          setShowAlert(false);
        },
      });
      setShowAlert(true);
      return;
    }

    if (isReduction) {
      setAlertConfig({
        title: "Confirm Quantity Reduction",
        description:
          "Please note that this scanning session will be recorded to ensure process integrity. Make sure to return any removed items to their proper location.",
        action: () => {
          updateQuantity(itemName, newQuantity);
          setShowAlert(false);
        },
      });
      setShowAlert(true);
    } else {
      updateQuantity(itemName, newQuantity);
    }
  };

  const updateQuantity = (itemName, newQuantity) => {
    setModifiedCart((prev) => ({
      ...prev,
      [itemName]: {
        ...prev[itemName],
        quantity: newQuantity,
      },
    }));
  };

  const handleConfirm = () => {
    // Apply all modifications to the parent component
    Object.entries(modifiedCart).forEach(([itemName, item]) => {
      onUpdateQuantity(itemName, item.quantity);
    });
    onConfirm();
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Review Your Cart</h2>
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Back to Scanning
          </button>
          <button
            onClick={handleEditToggle}
            className={`px-4 py-2 rounded-lg transition-colors ${
              isEditing
                ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            {isEditing ? "Done" : "Edit Quantities"}
          </button>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {Object.entries(modifiedCart).map(([itemName, item]) => (
          <div
            key={itemName}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <img
                src={`/Assets/${item.image_path.split("/").pop()}`}
                alt={itemName}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div>
                <h3 className="font-medium text-gray-800">{itemName}</h3>
                <p className="text-gray-600">
                  ${item.unit_price.toFixed(2)} each
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              {isEditing ? (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() =>
                      handleQuantityChange(itemName, item.quantity - 1)
                    }
                    disabled={item.quantity <= 0}
                    className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <MinusCircle className="w-6 h-6 text-gray-600" />
                  </button>
                  <span className="w-8 text-center font-medium">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      handleQuantityChange(itemName, item.quantity + 1)
                    }
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <PlusCircle className="w-6 h-6 text-gray-600" />
                  </button>
                </div>
              ) : (
                <span className="font-medium text-gray-700">
                  Qty: {item.quantity}
                </span>
              )}
              <span className="font-medium text-gray-800 w-24 text-right">
                ${(item.quantity * item.unit_price).toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center pt-4 border-t">
        <div className="text-xl font-bold">
          Total: $
          {Object.entries(modifiedCart)
            .reduce(
              (sum, [_, item]) => sum + item.quantity * item.unit_price,
              0
            )
            .toFixed(2)}
        </div>
        <button
          onClick={handleConfirm}
          className="px-6 py-3 rounded-lg bg-green-500 text-white hover:bg-green-600"
        >
          Confirm and Pay
        </button>
      </div>

      {showAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center space-x-2 mb-4">
              {alertConfig.showHelp ? (
                <HelpCircle className="w-6 h-6 text-blue-500" />
              ) : (
                <AlertCircle className="w-6 h-6 text-yellow-500" />
              )}
              <h3 className="text-lg font-semibold">{alertConfig.title}</h3>
            </div>
            <p className="text-gray-600 mb-6">{alertConfig.description}</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowAlert(false)}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={alertConfig.action}
                className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
              >
                {alertConfig.showHelp ? "Request Assistance" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartReview;
