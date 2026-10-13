
import {
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import Homepage from "./Components/Pages/Homepage/Homepage.jsx";
import ProductDetails from "./Components/Pages/ProductDetails/ProductDetails.jsx";
import Login from "./Components/Login/Login.jsx";
import Cart from "./Components/Cart/Cart.jsx";
import Admin from "./Components/Admin/Admin.jsx";

import { ShopContextProvider } from "./Components/ShopContext/ShopContext.jsx";
import FloatingContact from "./Components/FloatingContact/FloatingContact.jsx";

const RequireLogin = ({ children }) => {
  const location = useLocation();

  if (!sessionStorage.getItem("arveToken")) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

function App() {
  const { pathname } = useLocation();

  return (
    <ShopContextProvider>
      <Routes>
        <Route
          path="/"
          element={
            <RequireLogin>
              <Homepage />
            </RequireLogin>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route
          path="/product/:id"
          element={
            <RequireLogin>
              <ProductDetails />
            </RequireLogin>
          }
        />
        <Route
          path="/cart"
          element={
            <RequireLogin>
              <Cart />
            </RequireLogin>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireLogin>
              <Admin />
            </RequireLogin>
          }
        />
      </Routes>

      {!pathname.startsWith("/admin") && <FloatingContact />}
    </ShopContextProvider>
  );
}

export default App;
