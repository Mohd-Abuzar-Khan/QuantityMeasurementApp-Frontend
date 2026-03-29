import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '@environments/environment';
import {
  QuantityInputDTO,
  QuantityMeasurementDTO,
  OperationType,
} from '@core/models/quantity.models';

/**
 * QuantityService – thin façade over the backend {@code /api/v1/quantities} endpoints.
 *
 * All methods return cold Observables; the caller subscribes and handles
 * loading/error state (typically via the async pipe or explicit subscribe in
 * a component).  No caching is applied because measurement results are
 * inherently ephemeral.
 *
 * Error handling is centralised in the HTTP interceptor
 * ({@link ErrorInterceptor}); this service does not swallow errors.
 */
@Injectable({ providedIn: 'root' })
export class QuantityService {

  private readonly BASE_URL = `${environment.apiUrl}/quantities`;

  constructor(private readonly http: HttpClient) {}

  // ── Mutation endpoints ────────────────────────────────────────────────────

  /**
   * Compares two quantities for physical equality.
   * @returns DTO with {@code resultString} = "true" or "false".
   */
  compare(input: QuantityInputDTO): Observable<QuantityMeasurementDTO> {
    return this.http.post<QuantityMeasurementDTO>(`${this.BASE_URL}/compare`, input);
  }

  /**
   * Converts {@code thisQuantityDTO} to the unit of {@code thatQuantityDTO}.
   * @returns DTO with the converted value and target unit.
   */
  convert(input: QuantityInputDTO): Observable<QuantityMeasurementDTO> {
    return this.http.post<QuantityMeasurementDTO>(`${this.BASE_URL}/convert`, input);
  }

  /**
   * Adds two quantities; result is expressed in the unit of {@code thisQuantityDTO}.
   */
  add(input: QuantityInputDTO): Observable<QuantityMeasurementDTO> {
    return this.http.post<QuantityMeasurementDTO>(`${this.BASE_URL}/add`, input);
  }

  /**
   * Subtracts {@code thatQuantityDTO} from {@code thisQuantityDTO}.
   */
  subtract(input: QuantityInputDTO): Observable<QuantityMeasurementDTO> {
    return this.http.post<QuantityMeasurementDTO>(`${this.BASE_URL}/subtract`, input);
  }

  /**
   * Divides {@code thisQuantityDTO} by {@code thatQuantityDTO}.
   * @returns DTO with a dimensionless ratio in {@code resultValue}.
   */
  divide(input: QuantityInputDTO): Observable<QuantityMeasurementDTO> {
    return this.http.post<QuantityMeasurementDTO>(`${this.BASE_URL}/divide`, input);
  }

  // ── History / analytics endpoints ─────────────────────────────────────────

  /**
   * Retrieves all persisted records for a given operation type.
   * @param operation One of ADD | SUBTRACT | DIVIDE | COMPARE | CONVERT.
   */
  getHistoryByOperation(operation: OperationType): Observable<QuantityMeasurementDTO[]> {
    return this.http.get<QuantityMeasurementDTO[]>(
      `${this.BASE_URL}/history/operation/${operation}`
    );
  }

  /**
   * Retrieves all records whose first operand belongs to the given measurement type.
   * @param measurementType e.g. LengthUnit, WeightUnit.
   */
  getHistoryByType(measurementType: string): Observable<QuantityMeasurementDTO[]> {
    return this.http.get<QuantityMeasurementDTO[]>(
      `${this.BASE_URL}/history/type/${measurementType}`
    );
  }

  /**
   * Returns the count of successful (non-error) operations of the given type.
   */
  getOperationCount(operation: OperationType): Observable<number> {
    return this.http.get<number>(`${this.BASE_URL}/count/${operation}`);
  }

  /**
   * Returns all records where {@code isError = true}.
   */
  getErrorHistory(): Observable<QuantityMeasurementDTO[]> {
    return this.http.get<QuantityMeasurementDTO[]>(`${this.BASE_URL}/history/errored`);
  }
}
