// src/components/Receipt.js
import React from "react";
import { useParams, useLocation } from "react-router-dom";

const Receipt = () => {
  const [receipt, setReceipt] = React.useState(null);
  const { purchaseId } = useParams();
  const location = useLocation();

  React.useEffect(() => {
    try {
      // Get receipt data from URL
      const searchParams = new URLSearchParams(location.search);
      const encodedData = searchParams.get("data");

      if (encodedData) {
        const decodedData = JSON.parse(atob(encodedData));
        setReceipt(decodedData);
      }
    } catch (error) {
      console.error("Error parsing receipt data:", error);
    }
  }, [location.search]);

  if (!receipt) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <p className="text-gray-600 text-center">Receipt not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Quick Stop</h1>
          <p className="text-gray-600">1750 Finch Ave E, North York, ON</p>
          <p className="text-sm text-gray-500 mt-2">
            {new Date(receipt.timestamp).toLocaleString()}
          </p>
          <p className="text-sm text-gray-500">Order #{purchaseId}</p>
        </div>

        {/* Items */}
        <div className="border-t border-b py-4 mb-4">
          {receipt.items.map((item, index) => (
            <div key={index} className="flex justify-between py-2">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-600">
                  {item.quantity} × ${item.price.toFixed(2)}
                </p>
              </div>
              <p className="font-medium">
                ${(item.quantity * item.price).toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${receipt.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>HST (13%)</span>
            <span>${receipt.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>${receipt.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 italic">
            Thank you for shopping with us!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Receipt;
