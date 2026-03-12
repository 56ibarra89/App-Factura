import { Navigate, Route, Routes } from "react-router-dom";
import Home from '../pages/Home';
import Facturacion from '../pages/Facturacion';
// import Orders from '../pages/Orders';
// import Tables from '../pages/Tables';
// import Reports from '../pages/Reports';
// import ReimprimirFactura from '../pages/ReimprimirFactura';
import Producto from '../pages/Producto';
// import Users from '../pages/Users';
import ChangePassword from '../pages/ChangePassword';
// import AdminCaja from '../pages/AdminCaja';
// import Admin from '../pages/Admin';
import Login from '../pages/Login';
import AbrirCajaPage from "../pages/AbrirCajaPage";
import Mesa from "../pages/Mesa";

const PrivateRoute = ({ element }: { element: JSX.Element }) => {

const isLoggedIn = sessionStorage.getItem("loggedIn") === "true";

return isLoggedIn ? element : <Navigate to="/" replace />;

};

const AppRoutes = () => (
    <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<PrivateRoute element={<Home />} />} />
        <Route path="/producto" element={<PrivateRoute element={<Producto />} />} />
        <Route path="/facturacion" element={<PrivateRoute element={<Facturacion />} />} />
        <Route path="/clave" element={<PrivateRoute element={<ChangePassword />} />} />
        <Route path="/abrircaja" element={<PrivateRoute element={<AbrirCajaPage />} />} />
        <Route path="/mesas" element={<PrivateRoute element={<Mesa />} />} />
        {/* <Route path="/orders" element={<PrivateRoute element={<Orders />} />} />
        <Route path="/ordenes" element={<PrivateRoute element={<Orders />} />} />
        
        <Route path="/reporte" element={<PrivateRoute element={<Reports />} />} />
        <Route path="/reimprimir" element={<PrivateRoute element={<ReimprimirFactura />} />} />
        <Route path="/cuentas" element={<PrivateRoute element={<Users />} />} />
        <Route path="/clave" element={<PrivateRoute element={<ChangePassword />} />} />
        <Route path="/admin" element={<PrivateRoute element={<Admin />} />} />
        <Route path="/admincaja" element={<PrivateRoute element={<AdminCaja />} />} /> */}
    </Routes>
);

export default AppRoutes;
