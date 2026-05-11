import Sidebar from './Sidebar'

function Layout({ children }) {
    return (
        <div style={{
            display: 'flex',
            height: '100vh',
            overflow: 'hidden',
            background: '#f9fafb',
            position: 'relative'
        }}>
            <Sidebar />
            <main style={{
                flex: 1,
                overflowY: 'auto',
                padding: '32px',
                marginLeft: '68px',
                transition: 'margin-left 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }}>
                {children}
            </main>
        </div>
    )
}

export default Layout