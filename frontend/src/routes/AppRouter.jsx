import { Routes, Route } from 'react-router-dom'
import PrivateRoute from './PrivateRoute'
import Layout from '../components/common/Layout'
import HomePage from '../pages/HomePage'
import LoginPage from '../pages/user/LoginPage'
import ProductosPage from '../pages/productos/ProductosPage'
import ClientesPage from '../pages/clientes/ClientesPage'
import VentasPage from '../pages/ventas/VentasPage'
import NuevaVentaPage from '../pages/ventas/NuevaVentaPage'
import ProveedoresPage from '../pages/proveedores/ProveedoresPage'
import CajaPage from '../pages/caja/CajaPage'
import FiscalPage from '../pages/fiscal/FiscalPage'
import UsuariosPage from '../pages/usuarios/UsuariosPage'
import PerfilPage from '../pages/perfil/PerfilPage'

function AppRouter() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route path="/" element={
                <PrivateRoute>
                    <Layout>
                        <HomePage />
                    </Layout>
                </PrivateRoute>
            } />

            <Route path="/inventario/productos" element={
                <PrivateRoute>
                    <Layout>
                        <ProductosPage />
                    </Layout>
                </PrivateRoute>
            } />

            <Route path="/clientes" element={
                <PrivateRoute>
                    <Layout>
                        <ClientesPage />
                    </Layout>
                </PrivateRoute>
            } />

            <Route path="/ventas/historial" element={
                <PrivateRoute>
                    <Layout>
                        <VentasPage />
                    </Layout>
                </PrivateRoute>
            } />

            <Route path="/ventas/nueva" element={
                <PrivateRoute>
                    <Layout>
                        <NuevaVentaPage />
                    </Layout>
                </PrivateRoute>
            } />

            <Route path="/proveedores" element={
                <PrivateRoute>
                    <Layout>
                        <ProveedoresPage />
                    </Layout>
                </PrivateRoute>
            } />
            <Route path="/caja/abrir" element={
                <PrivateRoute>
                    <Layout>
                        <CajaPage />
                    </Layout>
                </PrivateRoute>
            } />

            <Route path="/caja/cerrar" element={
                <PrivateRoute>
                    <Layout>
                        <CajaPage />
                    </Layout>
                </PrivateRoute>
            } />

            <Route path="/fiscal" element={
                <PrivateRoute>
                    <Layout>
                        <FiscalPage />
                    </Layout>
                </PrivateRoute>
            } />

            <Route path="/usuarios" element={
                <PrivateRoute>
                    <Layout>
                        <UsuariosPage />
                    </Layout>
                </PrivateRoute>
            } />

            <Route path="/perfil" element={
                <PrivateRoute>
                    <Layout>
                        <PerfilPage />
                    </Layout>
                </PrivateRoute>
            } />

        </Routes>
    )
}

export default AppRouter