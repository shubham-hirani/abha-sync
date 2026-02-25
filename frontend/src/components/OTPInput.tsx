import React, { useRef, useEffect } from "react";

interface OTPInputProps {
    length?: number;
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

export default function OTPInput({ length = 6, value, onChange, disabled }: OTPInputProps) {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        // Focus first empty box on mount
        inputRefs.current[0]?.focus();
    }, []);

    const digits = value.padEnd(length, "").split("").slice(0, length);

    const handleChange = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, "").slice(-1);
        const newDigits = [...digits];
        newDigits[idx] = val;
        onChange(newDigits.join("").replace(/ /g, ""));
        if (val && idx < length - 1) {
            inputRefs.current[idx + 1]?.focus();
        }
    };

    const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !digits[idx] && idx > 0) {
            inputRefs.current[idx - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
        onChange(pasted);
        const nextIdx = Math.min(pasted.length, length - 1);
        inputRefs.current[nextIdx]?.focus();
    };

    return (
        <div className="otp-input-group" onPaste={handlePaste}>
            {digits.map((digit, idx) => (
                <input
                    key={idx}
                    id={`otp-${idx}`}
                    ref={(el) => { inputRefs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit.trim()}
                    onChange={(e) => handleChange(idx, e)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    disabled={disabled}
                    className={`otp-box${digit.trim() ? " filled" : ""}`}
                    autoComplete="one-time-code"
                />
            ))}
        </div>
    );
}
