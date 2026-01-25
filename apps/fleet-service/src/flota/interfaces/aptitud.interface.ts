/**
 * Interfaz que define la capacidad de un vehículo para realizar una tarea
 * según criterios de peso y capacidad
 */
export interface IAptitud {
  /**
   * Determina si el vehículo es apto para transportar una carga específica
   * @param pesoKg - Peso de la carga en kilogramos
   * @returns true si el vehículo puede transportar la carga, false en caso contrario
   */
  esAptoPara(pesoKg: number): boolean;

  /**
   * Calcula el porcentaje de capacidad utilizada para una carga dada
   * @param pesoKg - Peso de la carga en kilogramos
   * @returns Porcentaje de capacidad utilizada (0-100)
   */
  calcularPorcentajeCapacidad(pesoKg: number): number;
}
