import React, { useState } from "react";
import { ShoppingBag, LogOut } from "lucide-react";
import { StaffLogin, StaffItemSelector } from "./StaffLogin";

const Header = ({
  isStaffMode,
  onStaffLogin,
  onStaffLogout,
  onAddItem,
  storeItems,
}) => {
  const [showLogin, setShowLogin] = useState(false);
  const [showItemSelector, setShowItemSelector] = useState(false);

  const handleLogoClick = () => {
    if (!isStaffMode) {
      setShowLogin(true);
    }
  };

  const handleLogin = (userData) => {
    onStaffLogin(userData);
    setShowLogin(false);
  };

  const handleAddItems = () => {
    setShowItemSelector(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("staffAuth");
    onStaffLogout();
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo - clickable for staff login */}
        <div
          onClick={handleLogoClick}
          className="flex items-center space-x-2 cursor-pointer"
        >
          <ShoppingBag className="w-8 h-8 text-blue-500" />
          <span className="text-xl font-bold">Smart Checkout</span>
        </div>

        {/* Staff controls */}
        {isStaffMode && (
          <div className="flex items-center gap-4">
            <button
              onClick={onStaffLogout}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        )}

        {/* Staff Login Modal */}
        {showLogin && (
          <StaffLogin
            onClose={() => setShowLogin(false)}
            onLogin={handleLogin}
          />
        )}

        {/* Item Selector Modal */}
        {showItemSelector && (
          <StaffItemSelector
            storeItems={storeItems}
            onAddItem={onAddItem}
            onClose={() => setShowItemSelector(false)}
          />
        )}
      </div>
    </header>
  );
};

export default Header;
