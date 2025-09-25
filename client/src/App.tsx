import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./Layout/Layout";
import Home from "./pages/Home";
import About from "./pages/About";
import Appointment from "./pages/Appointment";
import Account from "./pages/Account";
import Products from "./pages/Products";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PrivateRoute from "./components/PrivateRoute";
import Product from "./pages/Product";
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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="about" element={<About />} />
          <Route path="appointment" element={<Appointment />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="product/:productId" element={<Product />} />
          <Route path="confirm-account" element={<ConfirmAccount />} />
          <Route path="check" element={<CheckEmail />} />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route path="cart" element={<Cart />} />
          <Route path="delivery" element={<Checkout />} />
          <Route path="orders" element={<Orders />} />
          <Route path="checkout/success/slot" element={<SuccessPageSlot />} />
          <Route path="checkout/success" element={<SuccessPageOrder />} />
          <Route path="checkout/cancel" element={<CancelPage />} />
          <Route path="TestPage" element={<TestPage />} />
          <Route path="contact" element={<Contact />} />

          <Route
            path="account"
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
