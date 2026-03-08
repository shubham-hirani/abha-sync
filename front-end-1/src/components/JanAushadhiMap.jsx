import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function JanAushadhiMap() {
    const mapContainer = useRef(null);
    const mapRef = useRef(null);

    const [userLocation, setUserLocation] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // AWS Configuration via Environment Variables for Vite
    const apiKey = import.meta.env.VITE_AWS_LOCATION_API_KEY;
    const region = import.meta.env.VITE_AWS_REGION || "us-east-1";
    const style = "Standard";
    const colorScheme = "Light";

    // 1. Request user location on mount
    useEffect(() => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser");
            setIsLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation([position.coords.longitude, position.coords.latitude]);
            },
            (err) => {
                let errorMsg = "Failed to get location.";
                if (err.code === 1) errorMsg = "Location permission denied.";
                if (err.code === 2) errorMsg = "Position unavailable.";
                if (err.code === 3) errorMsg = "Location request timed out.";
                setError(errorMsg + " " + err.message);
                setIsLoading(false);
            },
            { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 }
        );
    }, []);

    // 2. Initialize map and fetch locations when userLocation is available
    useEffect(() => {
        if (!userLocation || !mapContainer.current) return;

        if (!apiKey) {
            setError("Please configure VITE_AWS_LOCATION_API_KEY environment variable in your .env");
            setIsLoading(false);
            return;
        }

        // Prevent multiple initializations
        if (mapRef.current) return;

        try {
            // Initialize MapLibre GL JS centered on the user's location
            const map = new maplibregl.Map({
                container: mapContainer.current,
                style: `https://maps.geo.${region}.amazonaws.com/v2/styles/${style}/descriptor?key=${apiKey}&color-scheme=${colorScheme}`,
                center: userLocation,
                zoom: 12, // Zoom level focused around checking nearest places
            });

            map.addControl(new maplibregl.NavigationControl(), "top-left");
            mapRef.current = map;

            // Add User Location Marker
            new maplibregl.Marker({ color: "#007AFF" }) // Blue for user
                .setLngLat(userLocation)
                .setPopup(new maplibregl.Popup({ offset: 25 }).setText("You are here"))
                .addTo(map);

            // Once the map style loads, fetch the nearest stores
            map.on('style.load', () => {
                fetchNearbyPlaces(userLocation, map);
            });

        } catch (err) {
            setError("Error initializing map: " + err.message);
            setIsLoading(false);
        }
    }, [userLocation, apiKey, region, style, colorScheme]);

    // 3. Amazon Location Places API to fetch Jan Aushadhi Kendras
    const fetchNearbyPlaces = async (position, map) => {
        try {
            const ObjectParams = new URLSearchParams({
                key: apiKey
            });
            // Hitting the proxy at /aws-places, which gets rewritten.
            // (e.g., Localhost intercepts, and Vercel rewrites to the aws url)
            const response = await fetch(
                `/aws-places/v2/search/text?${ObjectParams.toString()}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        QueryText: "jan aushadhi kendra",
                        BiasPosition: position,
                        MaxResults: 10,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch nearby places from AWS Location Service.");
            }

            const data = await response.json();

            // 4. Add markers for results
            if (data.ResultItems && data.ResultItems.length > 0) {
                data.ResultItems.forEach((item) => {
                    if (!item.Position) return;

                    const title = item.Title || "Jan Aushadhi Kendra";
                    const address = item.Address?.Label || "Address not available";
                    const coords = `${item.Position[1].toFixed(5)}, ${item.Position[0].toFixed(5)}`;

                    // Create custom popup HTML
                    const popupContent = `
            <div style="font-family: inherit; color: #333; padding: 4px; max-width: 250px;">
              <h3 style="margin: 0 0 6px; font-size: 14px; font-weight: 600;">${title}</h3>
              <p style="margin: 0 0 6px; font-size: 12px; color: #555;">${address}</p>
              <p style="margin: 0; font-size: 11px; color: #888;">Coordinates: ${coords}</p>
            </div>
          `;

                    const popup = new maplibregl.Popup({ offset: 25 }).setHTML(popupContent);

                    // Add store marker
                    new maplibregl.Marker({ color: "#E63946" }) // Red for store
                        .setLngLat(item.Position)
                        .setPopup(popup)
                        .addTo(map);
                });
            }
        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to load nearby Kendras.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full min-h-[500px] w-full border border-gray-200 rounded-xl overflow-hidden relative shadow-sm">

            {/* Loading state indicator */}
            {isLoading && !error && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                    <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mb-3" />
                    <p className="text-gray-700 font-medium">Locating nearest Jan Aushadhi Kendras...</p>
                </div>
            )}

            {/* Error state display */}
            {error && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-md max-w-[90%] text-center">
                    <p className="font-medium text-sm">{error}</p>
                </div>
            )}

            {/* MapLibre DOM Container */}
            <div
                ref={mapContainer}
                className="w-full"
                style={{ height: '500px', minHeight: '500px' }}
            />
        </div>
    );
}
