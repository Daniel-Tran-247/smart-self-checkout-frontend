import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LiveDetection from "./LiveDetection";
import Receipt from "./components/Receipt";
import AnimationInstruction from "./components/AnimationInstruction";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/receipt/:purchaseId" element={<Receipt />} />
        <Route path="/" element={<LiveDetection />} />
      </Routes>
    </Router>
  );
}

export default App;
