/**
 * Constantes para el módulo de Flota
 */

// Cliente de eventos RabbitMQ
export const FLOTA_EVENT_CLIENT = 'FLOTA_EVENT_CLIENT';

// Radio de búsqueda para conductores cercanos (en km)
export const RADIO_BUSQUEDA_KM = 5;

// Capacidades máximas por tipo de vehículo (en kg)
export const CAPACIDAD_MAX_MOTORIZADO = 30;
export const CAPACIDAD_MAX_LIVIANO = 500;

// Tiempos estimados de llegada por tipo de vehículo (en minutos por km)
export const TIEMPO_MINUTOS_POR_KM = {
  MOTORIZADO: 2, // Más rápidos en tráfico urbano
  LIVIANO: 3,
  CAMION: 4, // Más lentos por tamaño
};
