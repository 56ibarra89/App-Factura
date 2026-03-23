import { Navigate, Route, Routes } from "react-router-dom";
import Home from '../pages/Home';
import Facturacion from '../pages/Facturacion';
import Producto from '../pages/Producto';
import ChangePassword from '../pages/ChangePassword';
// import Admin from '../pages/Admin';
import Login from '../pages/Login';
import LoginPin from '../pages/LoginPin';
import AbrirCajaPage from "../pages/AbrirCajaPage";
import Mesa from "../pages/Mesa";

const PrivateRoute = ({ element }: { element: JSX.Element }) => {

const isLoggedIn = sessionStorage.getItem("loggedIn") === "true";

return isLoggedIn ? element : <Navigate to="/" replace />;

};

const AppRoutes = () => (
    <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login-pin" element={<LoginPin />} />
        <Route path="/home" element={<PrivateRoute element={<Home />} />} />
        <Route path="/producto" element={<PrivateRoute element={<Producto />} />} />
        <Route path="/facturacion" element={<PrivateRoute element={<Facturacion />} />} />
        <Route path="/clave" element={<PrivateRoute element={<ChangePassword />} />} />
        <Route path="/abrircaja" element={<PrivateRoute element={<AbrirCajaPage />} />} />
        <Route path="/mesas" element={<PrivateRoute element={<Mesa />} />} />
    </Routes>
);

export default AppRoutes;
