"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";

// Fix for default icon issue with Webpack
// You might need to copy marker-icon.png, marker-icon-2x.png, and marker-shadow.png
// from 'leaflet/dist/images' to your public/images folder
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/images/marker-icon-2x.png", // Adjust path if needed
  iconUrl: "/images/marker-icon.png", // Adjust path if needed
  shadowUrl: "/images/marker-shadow.png", // Adjust path if needed
});

interface Farm {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
}

interface MapProps {
  farms: Farm[];
}

// Default center coordinates (e.g., center of Kenya)
const defaultCenter: [number, number] = [-0.0236, 37.9062]; // Approx center of Kenya
const defaultZoom = 6;
const kenyaBounds: L.LatLngBoundsLiteral = [
  [-5.0, 33.9], // Southwest corner of Kenya
  [5.0, 41.9], // Northeast corner of Kenya
];
const minZoomLevel = 5;

export default function MapComponent({ farms }: MapProps) {
  // Ensure Leaflet runs only on the client side
  useEffect(() => {
    // Any Leaflet-specific initialization that needs the window object can go here
  }, []);

  // Calculate center based on farms or use default
  const center: [number, number] =
    farms.length > 0
      ? [farms[0].latitude, farms[0].longitude] // Center on the first farm for simplicity
      : defaultCenter;

  return (
    <MapContainer
      center={center}
      zoom={defaultZoom}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%" }}
      maxBounds={kenyaBounds} // Restrict map view to Kenya
      minZoom={minZoomLevel} // Prevent zooming out too far
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {farms.map((farm) => (
        <Marker key={farm.id} position={[farm.latitude, farm.longitude]}>
          <Popup>
            {farm.name} <br /> Lat: {farm.latitude}, Lng: {farm.longitude}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
