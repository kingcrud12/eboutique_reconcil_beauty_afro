import Layout from "./layout/Layout";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Orders from "./pages/Orders";
import Customers from "./pages/Customers";
import Products from "./pages/Products";
import Settings from "./pages/Settings";
import Informations from "./pages/Informations";
import Availabilities from "./pages/Availabilities";
import Prestations from "./pages/Prestations";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  return (
    <Router>
      <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Orders />} />
          <Route path="/Orders" element={<Orders />} />
          <Route path="/Customers" element={<Customers />} />
          <Route path="/Products" element={<Products />} />
          <Route path="/Settings" element={<Settings />} />
          <Route path="/Informations" element={<Informations />} />
          <Route path="/Availabilities" element={<Availabilities />} />
          <Route path="/Prestations" element={<Prestations />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
