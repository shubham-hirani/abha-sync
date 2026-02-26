import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
    const { signup } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [consent, setConsent] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!email) {
            setError("Please enter your email address.");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (!consent) {
            setError("Please accept the privacy policy to continue.");
            return;
        }
        setLoading(true);
        try {
            await signup(email, password, consent);
            navigate("/dashboard");
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
            setError(msg || "Signup failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                {/* Brand */}
                <div className="auth-brand">
                    <div className="brand-icon">🏥</div>
                    <h1 className="brand-name">ABHA-Sync</h1>
                    <p className="brand-tagline">Your digital health record companion</p>
                </div>

                <form onSubmit={handleSignup} className="auth-form">
                    <h2 className="form-title">Create account</h2>
                    <p className="form-subtitle">Sign up with your email</p>

                    <div className="input-group">
                        <label htmlFor="email" className="input-label">Email</label>
                        <input
                            id="email"
                            type="email"
                            className="text-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="password" className="input-label">Password</label>
                        <input
                            id="password"
                            type="password"
                            className="text-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="At least 6 characters"
                            autoComplete="new-password"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="confirm-password" className="input-label">Confirm Password</label>
                        <input
                            id="confirm-password"
                            type="password"
                            className="text-input"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter your password"
                            autoComplete="new-password"
                            required
                        />
                    </div>

                    <label className="consent-label">
                        <input
                            id="consent"
                            type="checkbox"
                            checked={consent}
                            onChange={(e) => setConsent(e.target.checked)}
                            className="consent-checkbox"
                        />
                        <span>
                            I agree to the{" "}
                            <a href="#" className="auth-link">Privacy Policy</a>{" "}
                            and consent to processing of my health data under the DPDP Act
                        </span>
                    </label>

                    {error && <p className="error-msg">{error}</p>}

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? <span className="spinner" /> : "Create Account"}
                    </button>

                    <p className="auth-switch">
                        Already have an account?{" "}
                        <Link to="/login" className="auth-link">Sign in</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
