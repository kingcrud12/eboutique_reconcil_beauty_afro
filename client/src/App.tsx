import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; 
import Layout from "./Layout/Layout";
import Home from "./pages/Home"
import About from "./pages/About"
import Appointment from "./pages/Appointment";
import Account from "./pages/Account";
import Products from "./pages/Products";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout/>}>
          <Route index element={<Home/>}  />
          <Route path="Products" element={<Products />} />
          <Route path="About" element={<About/>}/>
          <Route path="Appointment" element={<Appointment />} />
          <Route path="Account" element={<Account />} />
          <Route path="Login" element={<Login />} />
          <Route path="Register" element={<Register />} />
        </Route>
      </Routes>
     
    </Router>
  );
}

export default App;
