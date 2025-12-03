import axios from "axios";

const API_KEY = "236d2f9f80aba45cc4206b23e71d29c4";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

export const getCurrentWeather = async (city) => {
  const url = `${BASE_URL}/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`;
  console.log("[Service] getCurrent URL:", url);
  return axios.get(url).then(r => r.data);
};

export const getForecastWeather = async (city) => {
  const url = `${BASE_URL}/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`;
  console.log("[Service] getForecast URL:", url);
  return axios.get(url).then(r => r.data);
};
