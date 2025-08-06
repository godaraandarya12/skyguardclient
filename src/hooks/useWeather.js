import { useState, useEffect } from "react";

export default function useWeather() {
  const [weather, setWeather] = useState({ temp: "--°", condition: "Loading" });

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch('https://cors-anywhere.herokuapp.com/https://www.timeanddate.com/weather/new-zealand/auckland');
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const tempElement = doc.querySelector(".h2");
        const conditionElement = doc.querySelector("p");
        setWeather({
          temp: tempElement ? tempElement.textContent.trim() : "--°",
          condition: conditionElement ? conditionElement.textContent.trim().split(".")[0] : "Unknown",
        });
      } catch (error) {
        console.error("Weather fetch error:", error);
        setWeather({ temp: "--°", condition: "Error" });
      }
    };
    fetchWeather();
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return weather;
}