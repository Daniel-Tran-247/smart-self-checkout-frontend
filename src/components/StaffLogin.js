import { motion } from "framer-motion";
import {
  AlertCircle,
  LogIn,
  MinusCircle,
  Plus,
  PlusCircle,
  X,
} from "lucide-react";
import React, { useState } from "react";

const BACKEND_URL = endpoint;
// Staff Login Modal
const StaffLogin = ({ onClose, onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (data.success) {
        onLogin(data.user);
      } else {
        setError(data.error || "Invalid credentials");
      }
    } catch (err) {
      setError("Connection error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-lg p-6 w-full max-w-md relative"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-2 mb-6">
          <LogIn className="w-8 h-8 text-blue-500" />
          <h2 className="text-2xl font-bold">Staff Login</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) =>
                setCredentials((prev) => ({
                  ...prev,
                  username: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) =>
                setCredentials((prev) => ({
                  ...prev,
                  password: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 flex items-center justify-center gap-2 ${
              isLoading ? "opacity-75 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <LogIn className="w-5 h-5" />
            )}
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default StaffLogin;

// Staff Item Selection
const StaffItemSelector = ({ onAddItem, onClose, storeItems }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);

  const filteredItems = storeItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddItem = () => {
    if (selectedItem) {
      onAddItem({
        ...selectedItem,
        quantity,
      });
      setSelectedItem(null);
      setQuantity(1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] flex flex-col relative"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold mb-6">Add Store Items</h2>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex-grow overflow-auto mb-4">
          <div className="grid grid-cols-2 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.name}
                onClick={() => setSelectedItem(item)}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedItem?.name === item.name
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-200"
                }`}
              >
                <img
                  src={`/Assets/${item.image_path.split("/").pop()}`}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded mb-2"
                />
                <div className="font-medium">{item.name}</div>
                <div className="text-gray-600">
                  ${item.unit_price.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedItem && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{selectedItem.name}</h3>
                <p className="text-gray-600">
                  ${selectedItem.unit_price.toFixed(2)} each
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <MinusCircle className="w-6 h-6 text-gray-600" />
                </button>
                <span className="w-8 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <PlusCircle className="w-6 h-6 text-gray-600" />
                </button>
              </div>
            </div>
            <button
              onClick={handleAddItem}
              className="mt-4 w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add to Cart
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export { StaffItemSelector, StaffLogin };
