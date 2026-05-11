import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './Sidebar.css'

const menuItems = [
    {
        section: 'Principal',
        items: [
            {
                label: 'Inicio',
                path: '/',
                icon: (
                    <svg className="nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                ),
            },
        ],
    },
    {
        section: 'Gestión',
        items: [
            {
                label: 'Ventas',
                icon: (
                    <svg className="nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                ),
                submenu: [
                    { label: 'Nueva Venta', path: '/ventas/nueva' },
                    { label: 'Historial', path: '/ventas/historial' },
                    { label: 'Facturas', path: '/ventas/facturas' },
                ],
            },
            {
                label: 'Inventario',
                icon: (
                    <svg className="nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                ),
                submenu: [
                    { label: 'Productos', path: '/inventario/productos' },
                    { label: 'Bajo Stock', path: '/inventario/bajo-stock' },
                ],
            },
            {
                label: 'Clientes',
                path: '/clientes',
                icon: (
                    <svg className="nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                ),
            },
        ],
    },
    {
        section: 'Proveedores',
        items: [
            {
                label: 'Proveedores',
                path: '/proveedores',
                icon: (
                    <svg className="nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                ),
            },
        ],
    },
    {
        section: 'Sistema',
        items: [
            {
                label: 'Caja',
                icon: (
                    <svg className="nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                ),
                submenu: [
                    { label: 'Abrir Caja', path: '/caja/abrir' },
                    { label: 'Cerrar Caja', path: '/caja/cerrar' },
                ],
            },
            {
                label: 'Fiscal',
                path: '/fiscal',
                icon: (
                    <svg className="nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                    </svg>
                ),
            },
            {
                label: 'Usuarios',
                path: '/usuarios',
                icon: (
                    <svg className="nav-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                ),
            },
        ],
    },
]

function Sidebar() {
    const [collapsed, setCollapsed]     = useState(false)
    const [openSubmenu, setOpenSubmenu] = useState(null)
    const { user, userInfo, logout }    = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const isActive = (path) => location.pathname === path
    const isSubmenuActive = (submenu) => submenu?.some((s) => isActive(s.path))
    const handleSubmenu = (label) => setOpenSubmenu(openSubmenu === label ? null : label)

    const getInicial = () => {
        const n = userInfo?.first_name || user || 'U'
        return n[0].toUpperCase()
    }

    const getFotoUrl = () => userInfo?.foto_url || null

    return (
        <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>

            <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
            </button>

            <div className="sidebar-inner">

                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">FV</div>
                    <div className="sidebar-logo-text">
                        <div className="sidebar-logo-title">Farma Visión</div>
                        <div className="sidebar-logo-subtitle">Sistema de Gestión</div>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((section) => (
                        <div key={section.section}>
                            <div className="nav-section-label">{section.section}</div>
                            {section.items.map((item) => (
                                <div key={item.label}>
                                    {item.submenu ? (
                                        <div>
                                            <button
                                                className={`nav-item ${isSubmenuActive(item.submenu) ? 'active' : ''}`}
                                                onClick={() => !collapsed && handleSubmenu(item.label)}
                                            >
                                                {item.icon}
                                                <span className="nav-item-label">{item.label}</span>
                                                <svg className={`nav-item-arrow ${openSubmenu === item.label ? 'open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>
                                            {!collapsed && openSubmenu === item.label && (
                                                <div className="submenu">
                                                    {item.submenu.map((sub) => (
                                                        <button key={sub.path} className={`submenu-item ${isActive(sub.path) ? 'active' : ''}`} onClick={() => navigate(sub.path)}>
                                                            {sub.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <button className={`nav-item ${isActive(item.path) ? 'active' : ''}`} onClick={() => navigate(item.path)}>
                                            {item.icon}
                                            <span className="nav-item-label">{item.label}</span>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button className="footer-user footer-user-btn" onClick={() => navigate('/perfil')}>
                        <div className="footer-avatar">
                            {getFotoUrl() ? (
                                <img src={getFotoUrl()} alt="perfil" className="footer-avatar-img" />
                            ) : (
                                getInicial()
                            )}
                        </div>
                        <div className="footer-user-info">
                            <div className="footer-username">{userInfo?.first_name || user || 'Usuario'}</div>
                            <div className="footer-role">
                                {userInfo?.rol === 'admin' ? 'Administrador'
                                : userInfo?.rol === 'vendedor' ? 'Vendedor'
                                : 'Usuario'}
                            </div>
                        </div>
                        <svg className="footer-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 18l6-6-6-6" />
                        </svg>
                    </button>

                    <button className="footer-btn logout" onClick={() => { logout(); navigate('/login') }}>
                        <svg className="footer-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="footer-btn-label">Cerrar sesión</span>
                    </button>
                </div>

            </div>
        </div>
    )
}

export default Sidebar