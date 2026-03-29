/**
 * @file quantity.models.ts
 * Strongly-typed interfaces that mirror the backend DTOs for quantity measurement operations.
 */

/** Supported measurement type discriminators (must match backend enum names) */
export type MeasurementType =
  | 'LengthUnit'
  | 'WeightUnit'
  | 'VolumeUnit'
  | 'TemperatureUnit';

/** Supported operation names */
export type OperationType =
  | 'ADD'
  | 'SUBTRACT'
  | 'DIVIDE'
  | 'COMPARE'
  | 'CONVERT';

/**
 * Available units per measurement type.
 * Names must match the Java enum constants in {@code LengthUnit}, {@code WeightUnit},
 * {@code VolumeUnit}, and {@code TemperatureUnit} (case-insensitive on the wire;
 * we send uppercase to match {@code Enum#name()}).
 */
export const UNIT_MAP: Record<MeasurementType, string[]> = {
  LengthUnit:      ['FEET', 'INCHES', 'YARDS', 'CENTIMETERS', 'METERS'],
  WeightUnit:      ['KILOGRAM', 'GRAM', 'TONNE', 'POUND', 'OUNCE'],
  VolumeUnit:      ['LITRE', 'MILLILITRE', 'GALLON'],
  TemperatureUnit: ['CELSIUS', 'FAHRENHEIT', 'KELVIN'],
};

/**
 * Mirrors {@code QuantityDTO} on the backend.
 * Represents a single quantity: a numeric value, a unit, and a measurement type.
 */
export interface QuantityDTO {
  value: number;
  unit: string;
  measurementType: MeasurementType;
}

/**
 * Mirrors {@code QuantityInputDTO} on the backend.
 * Wraps two operands for binary operations (compare, add, subtract, etc.).
 */
export interface QuantityInputDTO {
  thisQuantityDTO: QuantityDTO;
  thatQuantityDTO: QuantityDTO;
}

/**
 * Mirrors {@code QuantityMeasurementDTO} on the backend.
 * Returned by every operation endpoint; contains operands, operation name, and result.
 */
export interface QuantityMeasurementDTO {
  // First operand
  thisValue: number | null;
  thisUnit: string;
  thisMeasurementType: string;

  // Second operand
  thatValue: number | null;
  thatUnit: string;
  thatMeasurementType: string;

  // Operation
  operation: string;

  // Result fields
  /** Set for COMPARE operations: "true" or "false" */
  resultString: string | null;
  resultValue: number | null;
  resultUnit: string | null;
  resultMeasurementType: string | null;

  // Error fields
  error: boolean;
  errorMessage: string | null;
}

/** Standard error response shape from the backend GlobalExceptionHandler */
export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}
