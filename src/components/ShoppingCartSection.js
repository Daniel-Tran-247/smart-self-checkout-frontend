import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import QuantityAdjuster from "./QuantityAdjuster";

const ShoppingCartSection = ({
  confirmedObjects,
  undeterminedObjects,
  totalPrice,
  BACKEND_URL,
  onQuantityChange,
  handleCheckout,
}) => {
  return (
    <div className="w-1/2 p-4 flex flex-col">
      <h2 className="text-2xl font-bold mb-4">Shopping Cart</h2>
      <div className="flex-grow overflow-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2">Image</th>
              <th className="p-2">Item Name</th>
              <th className="p-2">Quantity</th>
              <th className="p-2">Unit Price</th>
              <th className="p-2">Total Price</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {Object.entries(confirmedObjects).map(([itemName, item]) => (
                <motion.tr
                  key={itemName}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}
                  className="border-b"
                >
                  <td className="p-2">
                    <img
                      src={`${BACKEND_URL}/Assets/${item.image_path
                        .split("/")
                        .pop()}`}
                      alt={itemName}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  </td>
                  <td className="p-2 font-medium">{itemName}</td>
                  <td className="p-2 text-center">
                    <QuantityAdjuster
                      itemName={itemName}
                      currentQuantity={item.quantity}
                      unitPrice={item.unit_price}
                      onQuantityChange={onQuantityChange}
                    />
                  </td>
                  <td className="p-2 text-right">
                    ${item.unit_price?.toFixed(2) || "N/A"}
                  </td>
                  <td className="p-2 text-right font-medium">
                    ${(item.quantity * (item.unit_price || 0)).toFixed(2)}
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
      <div className="mt-4 p-4 bg-white rounded-lg shadow-sm">
        <div className="text-xl font-bold text-right">
          Total: ${totalPrice.toFixed(2)}
        </div>
        <button
          onClick={handleCheckout}
          disabled={undeterminedObjects.length > 0}
          className={`mt-4 w-full p-3 text-white font-bold rounded-lg transition-all duration-200 
            ${
              undeterminedObjects.length > 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 active:bg-blue-700"
            }`}
        >
          {undeterminedObjects.length > 0
            ? "Please wait for all items to be confirmed"
            : "Proceed to Checkout"}
        </button>
      </div>
    </div>
  );
};

export default ShoppingCartSection;
