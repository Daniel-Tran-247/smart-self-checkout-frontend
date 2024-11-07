import React, { useState, useEffect } from "react";
import { X, Delete } from "lucide-react";

const VirtualKeyboard = ({
  onInput,
  onClose,
  onSubmit,
  type = "text", // 'text' or 'numeric'
  maxLength,
  show = true,
  initialValue = "", // Add initialValue prop
  fieldType = "text", // Add fieldType prop: 'text' or 'password'
}) => {
  const [currentValue, setCurrentValue] = useState(initialValue);
  const [isShift, setIsShift] = useState(false);

  // Reset currentValue when show changes or initialValue changes
  useEffect(() => {
    setCurrentValue(initialValue);
  }, [show, initialValue]);

  const numericKeys = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["", "0", ""],
  ];

  const textKeys = [
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
    ["z", "x", "c", "v", "b", "n", "m"],
  ];

  const handleKeyPress = (key) => {
    if (maxLength && currentValue.length >= maxLength) return;

    const newValue = currentValue + (isShift ? key.toUpperCase() : key);
    setCurrentValue(newValue);
    onInput(newValue);
  };

  const handleBackspace = () => {
    const newValue = currentValue.slice(0, -1);
    setCurrentValue(newValue);
    onInput(newValue);
  };

  const handleSubmit = () => {
    onSubmit(currentValue);
    setCurrentValue(""); // Clear after submit
  };

  const renderKey = (key, index) => {
    if (key === "") return <div key={`empty-${index}`} className="w-16 h-16" />;

    return (
      <button
        key={key}
        onClick={() => handleKeyPress(key)}
        className="w-16 h-16 bg-white border border-gray-200 rounded-lg shadow-sm 
                 hover:bg-gray-50 active:bg-gray-100 flex items-center justify-center
                 text-2xl font-medium transition-colors"
      >
        {isShift ? key.toUpperCase() : key}
      </button>
    );
  };

  const getMaskedValue = (value) => {
    return fieldType === "password" ? "•".repeat(value.length) : value;
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
      <div className="bg-gray-100 p-4 rounded-t-xl w-full max-w-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="w-10" /> {/* Spacer */}
          <input
            type={fieldType}
            value={getMaskedValue(currentValue)}
            readOnly
            className="px-4 py-2 text-2xl text-center bg-white border rounded-lg w-64"
            placeholder={type === "numeric" ? "••••" : "Type here..."}
          />
          <button
            onClick={() => {
              setCurrentValue(""); // Clear value when closing
              onClose();
            }}
            className="p-2 hover:bg-gray-200 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Keyboard Layout */}
        <div className="space-y-2">
          {(type === "numeric" ? numericKeys : textKeys).map((row, i) => (
            <div key={i} className="flex justify-center gap-2">
              {row.map((key, j) => renderKey(key, `${i}-${j}`))}
            </div>
          ))}

          {/* Action Buttons */}
          <div className="flex justify-center gap-2 mt-4">
            {type === "text" && (
              <button
                onClick={() => setIsShift(!isShift)}
                className="px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 
                         active:bg-gray-100 flex-grow max-w-[150px]"
              >
                Shift
              </button>
            )}
            <button
              onClick={handleBackspace}
              className="px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 
                       active:bg-gray-100 flex-grow max-w-[150px] flex items-center justify-center"
            >
              <Delete className="w-6 h-6" />
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
                       active:bg-blue-700 flex-grow max-w-[150px]"
            >
              Enter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualKeyboard;
