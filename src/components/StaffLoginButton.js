import { HelpCircle, LogIn, LogOut, UserCircle } from "lucide-react";
import React, { useState } from "react";
import Draggable from "react-draggable";
import HelpRequestModal from "./HelpRequestModal";

export const DraggableHelpButton = ({ onClick }) => {
  const [showHelpModal, setShowHelpModal] = useState(false);

  const handleHelpClick = () => {
    setShowHelpModal(true);
    if (onClick) onClick();
  };

  return (
    <>
      <Draggable bounds="parent">
        <div className="fixed top-5 right-6 z-[9999]">
          <button
            onClick={handleHelpClick}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 shadow-lg cursor-pointer"
          >
            <HelpCircle className="w-5 h-5" />
            <span>Need Help?</span>
          </button>
        </div>
      </Draggable>

      {showHelpModal && (
        <HelpRequestModal onClose={() => setShowHelpModal(false)} />
      )}
    </>
  );
};

export const StaffLoginButton = ({ isStaffMode, onLoginClick, onLogout }) => {
  if (isStaffMode) {
    return (
      <button
        onClick={onLogout}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
      >
        <LogOut className="w-5 h-5" />
        <span>Logout</span>
      </button>
    );
  }

  return (
    <button
      onClick={onLoginClick}
      className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
    >
      <LogIn className="w-5 h-5" />
      <span>Staff Login</span>
    </button>
  );
};

export const StaffLoginMenu = ({ isStaffMode, onLoginClick, onLogout }) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleClick = (action) => {
    if (action === "login") {
      onLoginClick();
    } else {
      onLogout();
    }
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="p-2 rounded-full hover:bg-gray-100"
        title="Staff Menu"
      >
        <UserCircle className="w-6 h-6 text-gray-600" />
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          {isStaffMode ? (
            <button
              onClick={() => handleClick("logout")}
              className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
            >
              Logout Staff
            </button>
          ) : (
            <button
              onClick={() => handleClick("login")}
              className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
            >
              Staff Login
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export const ReviewInstructions = ({ onClose }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 max-w-md w-full m-4">
      <h3 className="text-xl font-bold mb-4">Review Your Cart</h3>
      <p className="text-gray-600 mb-4">
        You're about to review your shopping cart. In the review screen, you
        can:
      </p>
      <ul className="list-disc ml-6 mb-6 space-y-2 text-gray-600">
        <li>Review your items and total</li>
        <li>Adjust quantities if needed</li>
        <li>Get assistance if needed</li>
      </ul>
      <p className="text-gray-600 mb-6">
        <strong>Note:</strong> You can return to scanning unless you make
        quantity adjustments. Once you modify any quantities, you'll need to
        complete this transaction before starting a new scan.
      </p>
      <div className="flex justify-end space-x-3">
        <button
          onClick={() => onClose(false)}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          Keep Scanning
        </button>
        <button
          onClick={() => onClose(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Review Cart
        </button>
      </div>
    </div>
  </div>
);

export default {
  ReviewInstructions,
  StaffLoginButton,
  DraggableHelpButton,
  StaffLoginMenu,
};
