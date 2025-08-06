import React from "react";
import useWeather from "../../hooks/useWeather";
import { Sun, Cloud, CloudRain, CloudLightning } from "lucide-react";

const getWeatherIcon = (condition) => {
  switch (condition.toLowerCase()) {
    case "clear": return <Sun className="text-yellow-500" />;
    case "clouds": return <Cloud className="text-gray-400" />;
    case "rain":
    case "drizzle": return <CloudRain className="text-blue-400" />;
    case "thunderstorm": return <CloudLightning className="text-purple-500" />;
    default: return <Cloud className="text-gray-400" />;
  }
};

export default function WeatherWidget() {
  const weather = useWeather();

  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex items-center space-x-2">
        <div className="p-2 bg-blue-100/50 dark:bg-gray-700 rounded-lg">
          {getWeatherIcon(weather.condition)}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800 dark:text-white">{weather.temp}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{weather.condition}</p>
        </div>
      </div>
    </div>
  );
}
