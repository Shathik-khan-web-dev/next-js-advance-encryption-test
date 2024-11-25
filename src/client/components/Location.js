"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import config from "@/config";
import { _get } from "@/client/utils/apiClient";
import { decryptData } from "@/client/utils/encryptDecrypt";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Custom Marker Icon
const customMarkerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
});

export default function LocationComponent() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const apiResponse = await _get("/api/getUserLocation");

        const response = config.isProduction
          ? decryptData(apiResponse.encrypt)
          : apiResponse.encrypt;

        console.log(response);

        const data = response;

        if (data && data.loc) {
          setLocation(data);
        } else {
          throw new Error("Location data is incomplete.");
        }
      } catch (error) {
        setError("Failed to fetch location");
      }
    };

    fetchLocation();
  }, []);

  const center = location
    ? {
        lat: parseFloat(location.loc.split(",")[0]),
        lng: parseFloat(location.loc.split(",")[1]),
      }
    : { lat: 0, lng: 0 };

  return (
    <div className="mt-28">
      {error && <p>Error: {error}</p>}
      {location ? (
        <div>
          <h1>Your IP: {location.ip}</h1>
          <h2>
            Your Location: {location.city}, {location.region},{" "}
            {location.country}
          </h2>
          {location.loc ? (
            <>
              <p>Latitude: {location.loc.split(",")[0]}</p>
              <p>Longitude: {location.loc.split(",")[1]}</p>

              <MapContainer
                center={center}
                zoom={13}
                style={{ height: "400px", width: "100%" }}>
                <TileLayer
                  url="https://api.maptiler.com/maps/cadastre-satellite/256/{z}/{x}/{y}.png?key=WHllaijjKH1ZyXSVXtL4"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={center} icon={customMarkerIcon}>
                  <Popup>
                    Your Location: {location.city}, {location.region}
                  </Popup>
                </Marker>
              </MapContainer>
            </>
          ) : (
            <p>Location data is not available.</p>
          )}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
