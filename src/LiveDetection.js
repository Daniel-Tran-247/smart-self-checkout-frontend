import { AnimatePresence, motion } from "framer-motion";
import React, { useCallback, useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import CartReview from "./components/CartReview";
import Header from "./components/Header";
import {
  DraggableHelpButton,
  ReviewInstructions,
} from "./components/StaffLoginButton";
import { endpoint } from "./services/endpoint";
import SessionComplete from "./components/SessionComplete";
import AnimationIntruction from "./components/AnimationInstruction";

const BACKEND_URL = endpoint;

const LiveDetection = () => {
  const canvasRef = useRef(null);
  const [fps, setFps] = useState(0);
  const [confirmedObjects, setConfirmedObjects] = useState({});
  const [undeterminedObjects, setUndeterminedObjects] = useState([]);
  const [trackedObjects, setTrackedObjects] = useState([]);
  const [instruction, setInstruction] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);
  const lastInstructionRef = useRef("");
  const lastConfirmedTimeRef = useRef({});
  const scanStartTimeRef = useRef(null);
  const socketRef = useRef(null);
  const [frameStatus, setFrameStatus] = useState({
    is_empty: true,
    empty_confidence: 1.0,
  });
  const [processingItems, setProcessingItems] = useState(new Set());
  const [isReviewing, setIsReviewing] = useState(false);
  const [needsAssistance, setNeedsAssistance] = useState(false);
  const [isScanningPaused, setIsScanningPaused] = useState(false);
  const [isStaffMode, setIsStaffMode] = useState(false);
  const [storeItems, setStoreItems] = useState([]); // You'll need to fetch this from your backend
  const [staffUser, setStaffUser] = useState(null);
  const [showLiveDetection, setShowLiveDetection] = useState(true);
  const [showSessionComplete, setShowSessionComplete] = useState(false);
  const [showReviewInstructions, setShowReviewInstructions] = useState(false);
  const [showInstructionPage, setShowInstructionPage] = useState(
    !sessionStorage.getItem("instructionShown") ||
      sessionStorage.getItem("forceInstructionPage") === "true"
  );

  const handleProceedToScanning = useCallback(() => {
    setShowInstructionPage(false);
    sessionStorage.setItem("instructionShown", "true");
    sessionStorage.removeItem("forceInstructionPage");
  }, []);

  const resetSession = async () => {
    try {
      // Clear all frontend state first
      setConfirmedObjects({});
      setUndeterminedObjects([]);
      setTrackedObjects([]);
      setProcessingItems(new Set());
      setTotalPrice(0);
      setInstruction("Please place items in the scanning area");
      scanStartTimeRef.current = null;
      lastInstructionRef.current = "";
      lastConfirmedTimeRef.current = {};
      setShowSessionComplete(false);
      setIsReviewing(false);
      setIsScanningPaused(false);
      setFrameStatus({ is_empty: true, empty_confidence: 1.0 });
      sessionStorage.setItem("forceInstructionPage", "true");
      setShowInstructionPage(true);

      // Clean up socket connection
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }

      // Wait a moment before establishing new connection
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Create new socket connection
      const newSocket = io(BACKEND_URL, {
        secure: true,
        rejectUnauthorized: false,
        transports: ["websocket"],
        upgrade: false,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 60000,
        pingTimeout: 60000,
        pingInterval: 25000,
      });

      // Set up event handlers
      newSocket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        alert("Connection error. Please try again.");
      });

      newSocket.on("connect", () => {
        console.log("Socket connected successfully");
      });

      socketRef.current = newSocket;
      setIsScanningPaused(false);
    } catch (error) {
      console.error("Error resetting session:", error);
      alert("Error resetting session. Please refresh the page.");
    }
  };

  let frameCount = 0;
  let lastTime = Date.now();

  const updateShoppingCart = useCallback(
    (tracked, confirmed) => {
      const newCart = { ...confirmed };

      // First, handle newly confirmed items from tracking
      tracked.forEach((obj) => {
        if (obj.status === "confirmed") {
          const itemName = obj.class;
          if (!newCart[itemName]) {
            // Find the item details from storeItems
            const itemDetails = storeItems.find(
              (item) => item.name === itemName
            );
            if (itemDetails) {
              newCart[itemName] = {
                quantity: 1,
                unit_price: itemDetails.unit_price,
                image_path: itemDetails.image_path,
              };
            } else {
              // Fallback if item not found in database
              newCart[itemName] = {
                quantity: 1,
                unit_price: 0,
                image_path: "",
              };
            }
          } else {
            newCart[itemName].quantity += 1;
          }
          lastConfirmedTimeRef.current[obj.id] = Date.now();
        }
      });

      // Merge with existing confirmed objects to preserve their details
      Object.entries(confirmed).forEach(([itemName, item]) => {
        if (newCart[itemName]) {
          // Keep existing details but update quantity if needed
          newCart[itemName] = {
            ...item,
            quantity: Math.max(item.quantity, newCart[itemName].quantity),
          };
        } else {
          newCart[itemName] = item;
        }
      });

      setConfirmedObjects(newCart);
    },
    [storeItems]
  ); // Add storeItems to dependency array

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/products`);
        const data = await response.json();
        if (data.success) {
          setStoreItems(data.products);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (isScanningPaused) return;

    socketRef.current = io(BACKEND_URL, {
      secure: true,
      rejectUnauthorized: false,
      transports: ["websocket", "polling"],
      upgrade: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 60000,
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    socketRef.current.on("detection_results", (data) => {
      const img = new Image();
      img.onload = () => {
        drawDetections(img, data.tracked_objects);
        updateFPS();
      };
      img.src = URL.createObjectURL(
        new Blob([data.frame], { type: "image/jpeg" })
      );

      setTrackedObjects(data.tracked_objects || []);
      updateShoppingCart(
        data.tracked_objects || [],
        data.confirmed_objects || {}
      );
      setUndeterminedObjects(data.undetermined_objects || []);
      setFrameStatus(
        data.frame_status || { is_empty: true, empty_confidence: 1.0 }
      ); // Add this line

      if (data.tracked_objects?.length > 0 && !scanStartTimeRef.current) {
        scanStartTimeRef.current = Date.now();
      } else if (data.tracked_objects?.length === 0) {
        scanStartTimeRef.current = null;
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [updateShoppingCart, isScanningPaused]);

  useEffect(() => {
    const newInstruction = getContextualInstructions();
    if (newInstruction !== lastInstructionRef.current) {
      setInstruction(newInstruction);
      speakInstruction(newInstruction);
      lastInstructionRef.current = newInstruction;
    }

    const total = Object.entries(confirmedObjects).reduce(
      (sum, [_, item]) => sum + item.quantity * (item.unit_price || 0),
      0
    );
    setTotalPrice(total);
  }, [confirmedObjects, undeterminedObjects, trackedObjects]);

  const getContextualInstructions = () => {
    const itemsInFrame = trackedObjects.filter(
      (obj) => obj.is_valid || obj.status === "confirmed"
    ).length;
    const processingCount = processingItems.size;
    const confirmedInFrame = trackedObjects.filter(
      (obj) => obj.status === "confirmed"
    );
    const undeterminedInFrame = trackedObjects.filter(
      (obj) => obj.status === "undetermined" && obj.is_valid
    );
    const currentTime = Date.now();

    // Items detected but still processing stability
    if (processingCount > 0 && itemsInFrame === 0) {
      return `Detected ${processingCount} item${
        processingCount > 1 ? "s" : ""
      }. Processing stability check, please keep items steady...`;
    }

    // No items in scanning area - now uses frame_status
    if (frameStatus.is_empty || itemsInFrame === 0) {
      return "Please place items in the scanning area. Make sure everything is spread out and visible for the camera.";
    }

    if (
      scanStartTimeRef.current &&
      currentTime - scanStartTimeRef.current > 10000 &&
      confirmedInFrame.length === 0
    ) {
      return "Items are taking longer than usual to confirm. Please reposition the yellow-boxed items to ensure they're clearly visible to the camera. If you believe we have detected something wrong, click the help button and an assistant will come help you right away. Sorry for this inconvenience.";
    }

    if (confirmedInFrame.length > 0 && undeterminedInFrame.length > 0) {
      const oldestConfirmation = Math.min(
        ...confirmedInFrame.map(
          (obj) => lastConfirmedTimeRef.current[obj.id] || currentTime
        )
      );
      if (currentTime - oldestConfirmation > 3000) {
        return "Please place confirmed items in the bagging area to clear the scanning area, then reposition the yellow-boxed items for better detection.";
      }
    }

    if (undeterminedInFrame.length === 0 && confirmedInFrame.length > 0) {
      return "All items confirmed. Place items into the bagging area and continue to scan or proceed with payment.";
    }

    return "Scanning in progress. Please keep items steady...";
  };

  const speakInstruction = (text) => {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  };

  const roundRect = (ctx, x, y, width, height, radius) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };

  const drawDetections = (img, trackedObjects) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    // Track currently processing items
    const currentlyProcessing = new Set();

    trackedObjects.forEach((obj) => {
      const isProcessingStability = obj.history_length < 15; // MIN_HISTORY_LENGTH from backend
      if (isProcessingStability) {
        currentlyProcessing.add(obj.id);
      }

      // Draw detection boxes for objects being processed
      if (isProcessingStability) {
        const [x1, y1, x2, y2] = obj.bbox;

        // Draw dashed box for processing items
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = "#6366f1"; // Indigo color for processing
        ctx.lineWidth = 2;
        ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
        ctx.setLineDash([]); // Reset dash pattern

        // Draw "Processing..." label
        const text = `Processing ${obj.class}...`;
        ctx.font = "16px Arial";
        const textWidth = ctx.measureText(text).width;
        const padding = 4;

        let textX = x1;
        let textY = y1 - 5;
        if (textY < 20) textY = y2 + 20;
        if (textX + textWidth > canvas.width)
          textX = canvas.width - textWidth - padding;

        // Draw label background
        ctx.fillStyle = "#6366f1";
        ctx.beginPath();
        roundRect(
          ctx,
          textX - padding,
          textY - 20,
          textWidth + padding * 2,
          24,
          4
        );
        ctx.fill();

        // Draw text
        ctx.fillStyle = "#ffffff";
        ctx.fillText(text, textX, textY - 4);

        // Draw stability progress bar
        const progressBarHeight = 4;
        const progressBarY = y2 + 5;
        const progressBarWidth = x2 - x1;
        const stabilityProgress = (obj.history_length / 15) * 100; // 15 is MIN_HISTORY_LENGTH

        // Background
        ctx.fillStyle = "rgba(99, 102, 241, 0.3)";
        ctx.beginPath();
        roundRect(
          ctx,
          x1,
          progressBarY,
          progressBarWidth,
          progressBarHeight,
          2
        );
        ctx.fill();

        // Progress
        ctx.fillStyle = "rgba(99, 102, 241, 0.9)";
        ctx.beginPath();
        roundRect(
          ctx,
          x1,
          progressBarY,
          (progressBarWidth * stabilityProgress) / 100,
          progressBarHeight,
          2
        );
        ctx.fill();
      }

      // Only draw regular detection boxes for valid or confirmed objects
      if (!obj.is_valid && obj.status !== "confirmed") return;

      const [x1, y1, x2, y2] = obj.bbox;
      const color = obj.status === "confirmed" ? "#22c55e" : "#eab308";

      // Adjust opacity based on stability
      const opacity = obj.stability ? Math.max(0.3, obj.stability) : 1;
      const strokeColor = `${color}${Math.round(opacity * 255)
        .toString(16)
        .padStart(2, "0")}`;

      // Draw box with stability-based opacity
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

      // Draw label background
      const text = `${obj.class} ${(obj.confidence * 100).toFixed(1)}%`;
      ctx.font = "16px Arial";
      const textWidth = ctx.measureText(text).width;
      const padding = 4;

      let textX = x1;
      let textY = y1 - 5;
      if (textY < 20) textY = y2 + 20;
      if (textX + textWidth > canvas.width)
        textX = canvas.width - textWidth - padding;

      ctx.fillStyle = strokeColor;
      ctx.beginPath();
      roundRect(
        ctx,
        textX - padding,
        textY - 20,
        textWidth + padding * 2,
        24,
        4
      );
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.fillText(text, textX, textY - 4);

      // Draw progress bar for undetermined objects
      if (obj.status === "undetermined") {
        const progressBarHeight = 4;
        const progressBarY = y2 + 5;
        const progressBarWidth = x2 - x1;
        const progress = obj.progress || 0;

        // Background (red)
        ctx.fillStyle = "rgba(239, 68, 68, 0.5)";
        ctx.beginPath();
        roundRect(
          ctx,
          x1,
          progressBarY,
          progressBarWidth,
          progressBarHeight,
          2
        );
        ctx.fill();

        // Progress (green)
        ctx.fillStyle = "rgba(34, 197, 94, 0.9)";
        ctx.beginPath();
        roundRect(
          ctx,
          x1,
          progressBarY,
          (progressBarWidth * progress) / 100,
          progressBarHeight,
          2
        );
        ctx.fill();
      }
    });

    // Update processing items state
    setProcessingItems(currentlyProcessing);
  };

  const updateFPS = () => {
    frameCount++;
    const currentTime = Date.now();
    if (currentTime - lastTime >= 1000) {
      setFps(frameCount);
      frameCount = 0;
      lastTime = currentTime;
    }
  };

  const handleCheckout = () => {
    setShowReviewInstructions(true);
  };

  const handleReviewInstructions = (proceed) => {
    setShowReviewInstructions(false);
    if (proceed) {
      setIsScanningPaused(true);
      setIsReviewing(true);
    }
  };

  const handleReviewCancel = () => {
    setIsReviewing(false);
    setIsScanningPaused(false);
  };

  const handleConfirmCart = () => {
    setShowSessionComplete(true);
    setIsScanningPaused(true);
    if (socketRef.current) {
      socketRef.current.disconnect(); // Stop scanning during session complete screen
    }
  };

  const handleQuantityUpdate = (itemName, newQuantity) => {
    setConfirmedObjects((prev) => ({
      ...prev,
      [itemName]: {
        ...prev[itemName],
        quantity: newQuantity,
      },
    }));
  };

  const handleRequestHelp = () => {
    setNeedsAssistance(true);
    // Here you would implement the logic to notify staff
    console.log("Assistance requested");
  };

  const handleStaffLogin = async (userData) => {
    if (userData) {
      setStaffUser(userData);
      setIsStaffMode(true);
      sessionStorage.setItem("staffAuth", JSON.stringify(userData));
    }
  };

  const handleStaffLogout = () => {
    sessionStorage.removeItem("staffAuth");
    setStaffUser(null);
    setIsStaffMode(false);
  };

  useEffect(() => {
    const savedAuth = sessionStorage.getItem("staffAuth");
    if (savedAuth) {
      const userData = JSON.parse(savedAuth);
      handleStaffLogin(userData);
    }
  }, []);

  const handleStaffAddItem = (item) => {
    setConfirmedObjects((prev) => ({
      ...prev,
      [item.name]: {
        ...item,
        quantity: (prev[item.name]?.quantity || 0) + item.quantity,
      },
    }));
  };

  // When opening cart review:
  const handleOpenCartReview = () => {
    setShowLiveDetection(false);
  };

  // When closing cart review:
  const handleCloseCartReview = () => {
    setShowLiveDetection(true);
  };

  return (
    <div className="h-screen overflow-hidden relative">
      {showInstructionPage ? (
        <AnimationIntruction onProceed={handleProceedToScanning} />
      ) : (
        <div className="flex flex-col h-screen bg-gray-100">
          <Header
            isStaffMode={isStaffMode}
            onStaffLogin={handleStaffLogin}
            onStaffLogout={handleStaffLogout}
            onAddItem={handleStaffAddItem}
            storeItems={storeItems}
          />
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
            <p className="font-bold">Instructions:</p>
            <p>{instruction}</p>
          </div>
          <div className="flex flex-grow">
            <div className="w-1/2 p-4 flex flex-col">
              <h2 className="text-2xl font-bold mb-4">Live Detection</h2>
              <div className="relative flex-grow">
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full object-contain"
                />
              </div>
              <div className="mt-2">FPS: {fps}</div>
            </div>
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
                      {Object.entries(confirmedObjects).map(
                        ([itemName, item]) => (
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
                                src={`${BACKEND_URL}/Assets/${
                                  item.image_path
                                    ? item.image_path.split("/").pop()
                                    : ""
                                }`}
                                alt={itemName}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                            </td>
                            <td className="p-2 font-medium">{itemName}</td>
                            <td className="p-2 text-center">{item.quantity}</td>
                            <td className="p-2 text-right">
                              ${item.unit_price?.toFixed(2) || "N/A"}
                            </td>
                            <td className="p-2 text-right font-medium">
                              $
                              {(item.quantity * (item.unit_price || 0)).toFixed(
                                2
                              )}
                            </td>
                          </motion.tr>
                        )
                      )}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
              {isReviewing && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="absolute inset-0 bg-gray-900/90" />
                  <div className="relative bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto m-4">
                    <CartReview
                      confirmedObjects={confirmedObjects}
                      onUpdateQuantity={handleQuantityUpdate}
                      onRequestHelp={handleRequestHelp}
                      onConfirm={handleConfirmCart}
                      onCancel={handleReviewCancel} // Add this
                      isStaffMode={isStaffMode}
                      storeItems={storeItems}
                      onStaffLogin={handleStaffLogin}
                      onStaffLogout={handleStaffLogout}
                    />
                  </div>
                </div>
              )}

              {showReviewInstructions && (
                <ReviewInstructions onClose={handleReviewInstructions} />
              )}
              <div className="mt-4 p-4 bg-white rounded-lg shadow-sm">
                <div className="text-xl font-bold text-right">
                  Total: ${totalPrice.toFixed(2)}
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={Object.keys(confirmedObjects).length === 0}
                  className={`mt-4 w-full p-3 text-white font-bold rounded-lg transition-all duration-200 ${
                    (undeterminedObjects.length > 0) |
                    (Object.keys(confirmedObjects).length === 0)
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
          </div>
        </div>
      )}
      <DraggableHelpButton onClick={handleRequestHelp} />
      {showSessionComplete && <SessionComplete onStartNew={resetSession} />}
    </div>
  );
};
export default LiveDetection;
