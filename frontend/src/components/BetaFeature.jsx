import React, { useState } from 'react'

/**
 * BetaBanner — full-width banner for pages that have no backend support yet.
 */
export function BetaBanner({ featureName }) {
    return (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 mb-2">
            <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-amber-400 text-white tracking-wide shrink-0">
                BETA
            </span>
            <p className="text-sm text-amber-800">
                <strong>{featureName}</strong> is currently in Beta and will be available soon.
                You can explore the interface, but interactions are disabled.
            </p>
        </div>
    )
}

/**
 * BetaFeature — wraps a single interactive element.
 * Renders children inside a disabled overlay with tooltip on hover.
 *
 * Usage:
 *   <BetaFeature>
 *     <button>Add Reminder</button>
 *   </BetaFeature>
 */
export function BetaFeature({ children, tooltip = 'This feature is currently in Beta and will be available soon.' }) {
    const [show, setShow] = useState(false)

    return (
        <span
            className="relative inline-block"
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
        >
            {/* Invisible intercept layer that blocks pointer events */}
            <span className="absolute inset-0 z-10 cursor-not-allowed" aria-hidden="true" />

            {/* Children, visually muted */}
            <span className="opacity-50 pointer-events-none select-none">
                {children}
            </span>

            {/* Tooltip */}
            {show && (
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 text-xs text-white bg-gray-900 rounded-xl px-3 py-2 shadow-xl z-50 text-center leading-relaxed pointer-events-none">
                    {tooltip}
                    <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                </span>
            )}
        </span>
    )
}

/**
 * BetaBlock — wraps a whole section/div (not just inline elements).
 * Shows tooltip on hover and blocks pointer events.
 */
export function BetaBlock({ children, tooltip = 'This feature is currently in Beta and will be available soon.', className = '' }) {
    const [show, setShow] = useState(false)

    return (
        <div
            className={`relative ${className}`}
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
        >
            {/* Block layer */}
            <div className="absolute inset-0 z-10 cursor-not-allowed rounded-xl" aria-hidden="true" />

            {/* Content, visually muted */}
            <div className="opacity-50 pointer-events-none select-none">
                {children}
            </div>

            {/* Tooltip */}
            {show && (
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center z-50 pointer-events-none">
                    <span className="max-w-xs text-xs text-white bg-gray-900 rounded-xl px-3 py-2 shadow-xl text-center leading-relaxed">
                        {tooltip}
                    </span>
                </div>
            )}
        </div>
    )
}

export default BetaFeature
