import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./Layout/Layout";
import Home from "./pages/Home";

import Appointment from "./pages/Appointment";
import Account from "./pages/Account";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PrivateRoute from "./components/PrivateRoute";
import ConfirmAccount from "./pages/ConfirmAccount";
import CheckEmail from "./pages/CheckEmail";
import ResetPassword from "./pages/ResetPassword";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import CancelPage from "./pages/CancelPage";
import SuccessPageSlot from "./pages/SuccessPageSlot";
import SuccessPageOrder from "./pages/SucessPageOrder";
import TestPage from "./TestPage";
import Contact from "./pages/Contact";
import AboutUs from "./pages/AboutUs";
import ProductsSEO from "./pages/ProductsSEO";
import ProductSEO from "./pages/ProductSEO";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="shop/products" element={<ProductsSEO />} />
          <Route path="shop/products/:categoryFilter" element={<ProductsSEO />} />
          <Route path="boutique" element={<ProductsSEO />} /> {/* Fallback */}
          <Route path="shop/about" element={<AboutUs />} />
          <Route path="aboutUs" element={<AboutUs />} /> {/* Fallback */}
          <Route path="shop/services" element={<Appointment />} />
          <Route path="shop/login" element={<Login />} />
          <Route path="shop/register" element={<Register />} />
          <Route path="shop/product/:category/:slug" element={<ProductSEO />} />
          <Route path="boutique/:category/:slug" element={<ProductSEO />} /> {/* Fallback */}
          <Route path="shop/confirm-account" element={<ConfirmAccount />} />
          <Route path="shop/check" element={<CheckEmail />} />
          <Route path="shop/reset-password" element={<ResetPassword />} />
          <Route path="shop/cart" element={<Cart />} />
          <Route path="shop/checkout" element={<Checkout />} />
          <Route path="shop/orders" element={<Orders />} />
          <Route path="shop/checkout/success/slot" element={<SuccessPageSlot />} />
          <Route path="shop/checkout/success" element={<SuccessPageOrder />} />
          <Route path="shop/checkout/cancel" element={<CancelPage />} />
          <Route path="TestPage" element={<TestPage />} />
          <Route path="shop/contact" element={<Contact />} />

          <Route
            path="shop/account"
            element={
              <PrivateRoute>
                <Account />
              </PrivateRoute>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
