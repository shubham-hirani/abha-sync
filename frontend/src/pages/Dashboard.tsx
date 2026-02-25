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
                        {user?.phone_number?.slice(-2) ?? "👤"}
                    </div>
                    <h2 className="welcome-title">Welcome!</h2>
                    <p className="welcome-phone">{user?.phone_number}</p>
                    {!user?.consent_given && (
                        <div className="alert-banner">
                            ⚠️ Please accept the privacy policy to enable all features.
                        </div>
                    )}
                </div>

                <div className="feature-grid">
                    {[
                        { icon: "📄", title: "My Records", desc: "View digitized health records" },
                        { icon: "💊", title: "Generic Drugs", desc: "Find affordable alternatives" },
                        { icon: "📍", title: "Kendra Finder", desc: "Locate Jan Aushadhi stores" },
                        { icon: "🔬", title: "Lab Reports", desc: "Understand your test results" },
                    ].map((f) => (
                        <div key={f.title} className="feature-card">
                            <div className="feature-icon">{f.icon}</div>
                            <h3 className="feature-title">{f.title}</h3>
                            <p className="feature-desc">{f.desc}</p>
                            <span className="feature-badge">Coming soon</span>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
