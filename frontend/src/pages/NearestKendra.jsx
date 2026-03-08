import React from 'react';
import JanAushadhiMap from '../components/JanAushadhiMap';

export default function NearestKendra() {
    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent mb-2">
                    Nearest Jan Aushadhi Kendra
                </h1>
                <p className="text-gray-600">
                    Find affordable generic medicine stores near you relative to your current location.
                </p>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <JanAushadhiMap />
            </div>
        </div>
    );
}
