import { useState } from "react";
import { toast } from "react-hot-toast";

// Custom hook for geolocation
export function useGeolocation() {
  const [location, setLocation] = useState<string | null>(null);
  const [isActive, setIsActive] = useState<boolean>(false);

  const getCityFromCoordinates = async (lat: number, lon: number): Promise<string> => {
    const apiKey = "935bfa46d0924a9082aa54af050e268c";
    const response = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${apiKey}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch geocoding data.");
    }

    const data = await response.json();
    const city = data.results[0]?.components?.city || data.results[0]?.components?.town || "Unknown location";
    return city;
  };

  const handleGetLocation = () => {
    if (isActive) {
      setLocation(null);
      setIsActive(false);
      return;
    }

    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const cityName = await getCityFromCoordinates(latitude, longitude);
          setLocation(cityName);
          setIsActive(true);
        } catch (error) {
          console.log(error)  
          toast.error("Failed to fetch city name.");
        }
      },
      (err) => {
        if (err.code === 1) {
          toast.error("Permission denied. Enable location access in your browser settings.");
        } else {
          toast.error(`Error: ${err.message}`);
        }
      }
    );
  };

  return { location, isActive, handleGetLocation };
}
