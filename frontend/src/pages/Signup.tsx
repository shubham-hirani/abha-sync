import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import OTPInput from "../components/OTPInput";

type Step = "phone" | "otp";

export default function Signup() {
    const { sendOtp, login } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState<Step>("phone");
    const [phone, setPhone] = useState("+91");
    const [otp, setOtp] = useState("");
    const [consent, setConsent] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);

    const startResendTimer = () => {
        setResendTimer(30);
        const interval = setInterval(() => {
            setResendTimer((t) => {
                if (t <= 1) { clearInterval(interval); return 0; }
                return t - 1;
            });
        }, 1000);
    };

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!phone.match(/^\+[1-9]\d{9,14}$/)) {
            setError("Enter a valid mobile number with country code, e.g. +919876543210");
            return;
        }
        if (!consent) {
            setError("Please accept the privacy policy to continue.");
            return;
        }
        setLoading(true);
        try {
            await sendOtp(phone);
            setStep("otp");
            startResendTimer();
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
            setError(msg || "Failed to send OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (otp.length !== 6) {
            setError("Please enter the 6-digit OTP.");
            return;
        }
        setLoading(true);
        try {
            await login(phone, otp, consent);
            navigate("/dashboard");
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
            setError(msg || "Invalid OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendTimer > 0) return;
        setError("");
        setLoading(true);
        try {
            await sendOtp(phone);
            startResendTimer();
        } catch {
            setError("Failed to resend OTP.");
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

                {step === "phone" ? (
                    <form onSubmit={handleSendOtp} className="auth-form">
                        <h2 className="form-title">Create account</h2>
                        <p className="form-subtitle">Sign up with your mobile number</p>

                        <div className="input-group">
                            <label htmlFor="phone" className="input-label">Mobile Number</label>
                            <input
                                id="phone"
                                type="tel"
                                className="text-input"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+919876543210"
                                autoComplete="tel"
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
                            {loading ? <span className="spinner" /> : "Send OTP"}
                        </button>

                        <p className="auth-switch">
                            Already have an account?{" "}
                            <Link to="/login" className="auth-link">Sign in</Link>
                        </p>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp} className="auth-form">
                        <h2 className="form-title">Verify number</h2>
                        <p className="form-subtitle">
                            We sent a 6-digit code to <strong>{phone}</strong>
                        </p>

                        <OTPInput value={otp} onChange={setOtp} disabled={loading} />

                        {error && <p className="error-msg">{error}</p>}

                        <button type="submit" className="btn-primary" disabled={loading || otp.length !== 6}>
                            {loading ? <span className="spinner" /> : "Verify & Create Account"}
                        </button>

                        <div className="resend-row">
                            {resendTimer > 0 ? (
                                <span className="resend-timer">Resend OTP in {resendTimer}s</span>
                            ) : (
                                <button type="button" className="btn-ghost" onClick={handleResend}>
                                    Resend OTP
                                </button>
                            )}
                            <button
                                type="button"
                                className="btn-ghost"
                                onClick={() => { setStep("phone"); setOtp(""); setError(""); }}
                            >
                                Change number
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
