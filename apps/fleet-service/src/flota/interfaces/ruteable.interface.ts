/**
 * Interfaz que define la capacidad de un vehículo para ser ruteado
 * y su disponibilidad para asignaciones
 */
export interface IRuteable {
  /**
   * Determina si el vehículo está disponible para ser asignado a una ruta
   * @returns true si está disponible, false en caso contrario
   */
  estaDisponible(): boolean;

  /**
   * Calcula la distancia aproximada a un punto de origen
   * @param latitud - Latitud del punto de destino
   * @param longitud - Longitud del punto de destino
   * @returns Distancia en kilómetros
   */
  calcularDistancia(latitud: number, longitud: number): number;
}
