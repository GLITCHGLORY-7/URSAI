import { WeatherCityData, WeatherCondition } from '../types/ursai';

export const INITIAL_WEATHER_DATA: WeatherCityData = {
  condition: 'CLEAR',
  temperatureC: 31,
  visibilityKm: 8,
  rainIntensity: 'NONE',
};

export function computeSimulatedWeather(
  current: WeatherCityData,
  forceCondition?: WeatherCondition
): WeatherCityData {
  const condition = forceCondition || current.condition;

  let temperatureC = 31;
  let visibilityKm = 8;
  let rainIntensity: WeatherCityData['rainIntensity'] = 'NONE';

  switch (condition) {
    case 'CLEAR':
      temperatureC = 32;
      visibilityKm = 10;
      rainIntensity = 'NONE';
      break;
    case 'CLOUDY':
      temperatureC = 29;
      visibilityKm = 7;
      rainIntensity = 'NONE';
      break;
    case 'LIGHT_RAIN':
      temperatureC = 26;
      visibilityKm = 5;
      rainIntensity = 'LIGHT';
      break;
    case 'HEAVY_RAIN':
      temperatureC = 24;
      visibilityKm = 3;
      rainIntensity = 'HEAVY';
      break;
  }

  return {
    condition,
    temperatureC,
    visibilityKm,
    rainIntensity,
  };
}
