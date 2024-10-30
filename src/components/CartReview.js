import React, { useState } from "react";
import { MinusCircle, PlusCircle, HelpCircle, AlertCircle } from "lucide-react";

const PRICE_REDUCTION_LIMIT = 5.0;

const CartReview = ({ confirmedObjects, onUpdateQuantity, onRequestHelp }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});
  const [originalQuantities, setOriginalQuantities] = useState({});

  const handleEditToggle = () => {
    if (!isEditing) {
      const originals = {};
      Object.entries(confirmedObjects).forEach(([itemName, item]) => {
        originals[itemName] = item.quantity;
      });
      setOriginalQuantities(originals);
    }
    setIsEditing(!isEditing);
  };

  const calculatePriceChange = (itemName, newQuantity) => {
    const item = confirmedObjects[itemName];
    const quantityDiff = newQuantity - item.quantity;
    return quantityDiff * item.unit_price;
  };

  const handleQuantityChange = (itemName, newQuantity) => {
    const item = confirmedObjects[itemName];
    const priceChange = calculatePriceChange(itemName, newQuantity);
    const isReduction = newQuantity < item.quantity;
    const isAboveBaseline = newQuantity > originalQuantities[itemName];

    if (isReduction) {
      if (isAboveBaseline || Math.abs(priceChange) <= PRICE_REDUCTION_LIMIT) {
        setAlertConfig({
          title: "Confirm Quantity Reduction",
          description:
            "Please note that this scanning session will be recorded to ensure process integrity. Make sure to return any removed items to their proper location.",
          action: () => {
            onUpdateQuantity(itemName, newQuantity);
            setShowAlert(false);
          },
        });
      } else {
        setAlertConfig({
          title: "Assistance Required",
          description:
            "The requested reduction exceeds our self-service limit. An assistant will be called to help you.",
          showHelp: true,
          action: () => {
            onRequestHelp();
            setShowAlert(false);
          },
        });
      }
      setShowAlert(true);
    } else {
      onUpdateQuantity(itemName, newQuantity);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Review Your Cart</h2>
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

      <div className="space-y-4">
        {Object.entries(confirmedObjects).map(([itemName, item]) => (
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
