import {
  AlertCircle,
  HelpCircle,
  MinusCircle,
  Plus,
  PlusCircle,
  Search,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { StaffLoginMenu } from "./StaffLoginButton";
import StaffLogin from "./StaffLogin";
import { endpoint } from "../services/endpoint";
import HelpRequestModal from "./HelpRequestModal";
import PaymentFlow from "./Payment";

const BACKEND_URL = endpoint;
const PRICE_REDUCTION_LIMIT = 5.0;

const ItemSelector = ({ onSelect, onClose, storeItems }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);

  const filteredItems =
    storeItems?.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const handleAdd = () => {
    if (selectedItem) {
      onSelect({ ...selectedItem, quantity });
      setSelectedItem(null);
      setQuantity(1);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Add Store Items</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-3 gap-4 overflow-y-auto mb-4 flex-grow">
          {filteredItems.map((item) => (
            <div
              key={item.name}
              onClick={() => setSelectedItem(item)}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedItem?.name === item.name
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-blue-200"
              }`}
            >
              <img
                src={`${BACKEND_URL}/Assets/${item.image_path
                  .split("/")
                  .pop()}`}
                alt={item.name}
                className="w-full h-32 object-cover rounded-lg mb-2"
              />
              <h4 className="font-medium text-gray-900">{item.name}</h4>
              <p className="text-gray-600">${item.unit_price.toFixed(2)}</p>
            </div>
          ))}
        </div>

        {selectedItem && (
          <div className="border-t pt-4 mt-auto">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{selectedItem.name}</h4>
                <p className="text-gray-600">
                  ${selectedItem.unit_price.toFixed(2)} each
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setQuantity(Math.max(1, quantity - 1));
                  }}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <MinusCircle className="w-6 h-6 text-gray-600" />
                </button>
                <span className="w-8 text-center font-medium">{quantity}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setQuantity(quantity + 1);
                  }}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <PlusCircle className="w-6 h-6 text-gray-600" />
                </button>
              </div>
            </div>
            <button
              onClick={handleAdd}
              className="mt-4 w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Add to Cart
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const CartReview = ({
  confirmedObjects,
  onUpdateQuantity,
  onRequestHelp,
  onConfirm,
  onCancel,
  isStaffMode,
  storeItems,
  onStaffLogin,
  onStaffLogout,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});
  const [originalQuantities, setOriginalQuantities] = useState({});
  const [modifiedCart, setModifiedCart] = useState(confirmedObjects);
  const [showItemSelector, setShowItemSelector] = useState(false);
  const [storeItemsError, setStoreItemsError] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [hasEdits, setHasEdits] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
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

  const calculateTotalReductionValue = (itemName, newQuantity) => {
    const originalQuantity = originalQuantities[itemName];
    const item = modifiedCart[itemName];

    if (newQuantity < originalQuantity) {
      const totalReduction = (originalQuantity - newQuantity) * item.unit_price;
      return totalReduction;
    }
    return 0;
  };

  const handleAddItem = (item) => {
    setModifiedCart((prev) => ({
      ...prev,
      [item.name]: {
        ...item,
        quantity: (prev[item.name]?.quantity || 0) + item.quantity,
      },
    }));
  };

  const handleQuantityChange = (itemName, newQuantity) => {
    const item = modifiedCart[itemName];
    const originalQuantity = originalQuantities[itemName];
    const isReduction = newQuantity < item.quantity;

    // Staff can adjust freely
    if (isStaffMode) {
      updateQuantity(itemName, newQuantity);
      return;
    }

    // Regular users can increase freely or reduce if still above original
    if (!isReduction || newQuantity >= originalQuantity) {
      updateQuantity(itemName, newQuantity);
      return;
    }

    // For reductions below original quantity
    const totalReductionValue = calculateTotalReductionValue(
      itemName,
      newQuantity
    );

    if (totalReductionValue > PRICE_REDUCTION_LIMIT) {
      setAlertConfig({
        title: "Assistance Required",
        description: `The total reduction value of $${totalReductionValue.toFixed(
          2
        )} exceeds our self-service limit of $${PRICE_REDUCTION_LIMIT.toFixed(
          2
        )}. An assistant will be called to help you.`,
        showHelp: true,
        action: () => {
          setShowHelpModal(true);
          setShowAlert(false);
        },
      });
    } else {
      setAlertConfig({
        title: "Confirm Quantity Reduction",
        description:
          "Please note that this scanning session will be recorded to ensure process integrity. Make sure to return any removed items to their proper location.",
        action: () => {
          updateQuantity(itemName, newQuantity);
          setShowAlert(false);
        },
      });
    }
    setShowAlert(true);
  };

  const updateQuantity = (itemName, newQuantity) => {
    if (!hasEdits) {
      setHasEdits(true);
    }
    if (newQuantity === 0) {
      const newCart = { ...modifiedCart };
      delete newCart[itemName];
      setModifiedCart(newCart);
    } else {
      setModifiedCart((prev) => ({
        ...prev,
        [itemName]: {
          ...prev[itemName],
          quantity: newQuantity,
        },
      }));
    }
  };

  const handleShowItemSelector = () => {
    if (!storeItems || storeItems.length === 0) {
      setStoreItemsError(true);
      return;
    }
    setShowItemSelector(true);
  };

  const handleConfirm = () => {
    if (!isEditing) {
      setShowPayment(true);
    }
  };

  const handleLoginClick = () => {
    setShowLoginModal(true);
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    Object.entries(modifiedCart).forEach(([itemName, item]) => {
      onUpdateQuantity(itemName, item.quantity);
    });
    onConfirm();
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Review Your Cart</h2>
        <div className="flex gap-3">
          <StaffLoginMenu
            isStaffMode={isStaffMode}
            onLoginClick={handleLoginClick}
            onLogout={onStaffLogout}
          />
          {isStaffMode && (
            <button
              onClick={handleShowItemSelector}
              className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Items
            </button>
          )}
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
      {storeItemsError && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full m-4">
            <h3 className="text-lg font-semibold text-red-600 mb-4">
              Error Loading Items
            </h3>
            <p className="text-gray-600 mb-6">
              Unable to load store items. Please try again or contact support.
            </p>
            <button
              onClick={() => setStoreItemsError(false)}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
      <div className="space-y-4 mb-6">
        {Object.entries(modifiedCart).map(([itemName, item]) => (
          <div
            key={itemName}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <img
                src={`${BACKEND_URL}/Assets/${item.image_path
                  .split("/")
                  .pop()}`}
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
              {isEditing && (
                <div className="text-sm text-gray-500">
                  Original: {originalQuantities[itemName]}
                </div>
              )}
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
        <div className="flex gap-3">
          {!hasEdits && ( // Only show cancel if no edits made
            <button
              onClick={onCancel}
              className="px-6 py-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Back to Scanning
            </button>
          )}
          <button
            onClick={handleConfirm}
            disabled={isEditing}
            className={`px-6 py-3 rounded-lg ${
              isEditing
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
            } text-white transition-colors`}
          >
            {isEditing ? "Finish editing to continue" : "Confirm and Pay"}
          </button>
        </div>
      </div>

      {/* Alert Dialog */}
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

      {showItemSelector && (
        <ItemSelector
          storeItems={storeItems}
          onSelect={handleAddItem}
          onClose={() => setShowItemSelector(false)}
        />
      )}
      {showLoginModal && (
        <StaffLogin
          onClose={() => setShowLoginModal(false)}
          onLogin={(userData) => {
            onStaffLogin(userData);
            setShowLoginModal(false);
          }}
        />
      )}
      {showHelpModal && (
        <HelpRequestModal onClose={() => setShowHelpModal(false)} />
      )}

      {showPayment && (
        <PaymentFlow
          cart={modifiedCart}
          onSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
        />
      )}
    </div>
  );
};

export default CartReview;
