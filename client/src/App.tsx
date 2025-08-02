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
