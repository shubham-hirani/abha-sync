import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-brand">
                    <span className="brand-icon">🏥</span>
                    <span className="brand-name">ABHA-Sync</span>
                </div>
                <button onClick={handleLogout} className="btn-outline">Sign Out</button>
            </header>

            <main className="dashboard-main">
                <div className="welcome-card">
                    <div className="welcome-avatar">
                        {user?.email?.charAt(0)?.toUpperCase() ?? "👤"}
                    </div>
                    <h2 className="welcome-title">Welcome!</h2>
                    <p className="welcome-email">{user?.email}</p>

                </div>

                <div className="feature-grid">
                    {[
                        { icon: "📄", title: "My Records", desc: "View digitized health records", link: "/records" },
                        { icon: "💊", title: "Generic Drugs", desc: "Find affordable alternatives" },
                        { icon: "📍", title: "Kendra Finder", desc: "Locate Jan Aushadhi stores" },
                        { icon: "🔬", title: "Lab Reports", desc: "Understand your test results", link: "/lab-reports" },
                    ].map((f) => (
                        <div
                            key={f.title}
                            className={`feature-card ${f.link ? "clickable" : ""}`}
                            onClick={() => f.link && navigate(f.link)}
                            style={f.link ? { cursor: "pointer" } : undefined}
                        >
                            <div className="feature-icon">{f.icon}</div>
                            <h3 className="feature-title">{f.title}</h3>
                            <p className="feature-desc">{f.desc}</p>
                            {!f.link && <span className="feature-badge">Coming soon</span>}
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
