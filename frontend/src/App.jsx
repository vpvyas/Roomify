import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./home";
import PgDetails from "./PgDetails";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pg/:id" element={<PgDetails />} />
      </Routes>
    </Router>
  );
}
