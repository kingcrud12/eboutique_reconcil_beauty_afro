import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./layout/Layout";
import Orders from "./pages/Orders";
import Customers from "./pages/Customers";
import Products from "./pages/Products";
import Settings from "./pages/Settings";
import Informations from "./pages/Informations";
import Availabilities from "./pages/Availabilities";
import Prestations from "./pages/Prestations";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PrivateRoute from "./components/PrivateRoute";
import CreateProduct from "./pages/CreateProduct";
import ProductDetails from "./pages/ProductDetails";

function App() {
  return (
    <Router>
      <Routes>
        {/* Routes publiques */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Routes privées */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Orders />} />
          <Route path="Orders" element={<Orders />} />
          <Route path="Customers" element={<Customers />} />
          <Route path="Products" element={<Products />} />
          <Route path="Settings" element={<Settings />} />
          <Route path="Informations" element={<Informations />} />
          <Route path="Availabilities" element={<Availabilities />} />
          <Route path="Prestations" element={<Prestations />} />
          <Route path="Product" element={<CreateProduct />} />
          <Route path="/products/:productId" element={<ProductDetails />} />

        </Route>
      </Routes>
    </Router>
  );
}

export default App;
