import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./home";
import PgDetails from "./PgDetails";
import Register from "./pages/Register";
import Login from "./pages/login"
import OwnerDashboard from "./pages/OwnerDashboard";
import { Toaster } from 'react-hot-toast';
import EditPG from "./pages/EditPG"; // Adjust path
import AddPG from "./pages/AddPG";  
import UserDashboard from "./pages/UserDashboard"; // Adjust the path based on your folder structure
export default function App() {
  return (
    <div className="container">
      <Toaster position="top-center" />
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pg/update/:id" element={<EditPG />} />
        <Route path="/pg/:id" element={<PgDetails />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
         <Route path="/owner-dashboard" element={<OwnerDashboard />} />
        <Route path="pg/add" element={<AddPG/>}/>
      </Routes>
    </Router>
    </div>
  );
}
