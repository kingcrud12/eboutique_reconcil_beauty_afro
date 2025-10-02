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
import OrderDetails from "./pages/OderDetails";
import CreatePrestation from "./pages/CreatePrestation";
import ServiceDetail from "./pages/ServiceDetail";
import SlotDetail from "./pages/SlotDetail";
import CreateAvailability from "./pages/CreateAvailability";
import Callback from "./pages/Callback";

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
          <Route path="/orders/:orderId" element={<OrderDetails />} />
          <Route path="/create-prestation" element={<CreatePrestation />} />
          <Route path="/services/:id" element={<ServiceDetail />} />
          <Route path="/slots/:id" element={<SlotDetail />} />
          <Route path="/create-availibility" element={<CreateAvailability />} />
          <Route path="callback" element={<Callback />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
