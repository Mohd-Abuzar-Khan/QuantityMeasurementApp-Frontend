import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { QuantityService } from '@core/services/quantity.service';
import {
  MeasurementType,
  OperationType,
  QuantityInputDTO,
  QuantityMeasurementDTO,
  UNIT_MAP,
} from '@core/models/quantity.models';

/**
 * MeasurementComponent – the primary UI for performing quantity operations.
 *
 * <h3>Responsibilities:</h3>
 * <ul>
 *   <li>Let the user choose an operation (Add, Subtract, Compare, Convert, Divide).</li>
 *   <li>Let the user enter two operands: value, unit, and measurement type.</li>
 *   <li>Dynamically filter the unit dropdown based on the selected measurement type.</li>
 *   <li>Submit the request to the backend via {@link QuantityService}.</li>
 *   <li>Display the result (or an error) inline.</li>
 * </ul>
 *
 * The form is entirely reactive (no template-driven state), enabling easy
 * programmatic control and unit-testability.
 */
@Component({
  selector: 'app-measurement',
  templateUrl: './measurement.component.html',
  styleUrls: ['./measurement.component.scss'],
})
export class MeasurementComponent implements OnInit {

  measurementForm!: FormGroup;

  /** Tracks the in-flight HTTP request */
  isLoading = false;

  /** Result returned from the backend */
  result: QuantityMeasurementDTO | null = null;

  /** Error message to display when the request fails */
  errorMessage = '';

  // ── Static data for dropdowns ──────────────────────────────────────────────

  readonly measurementTypes: MeasurementType[] = [
    'LengthUnit',
    'WeightUnit',
    'VolumeUnit',
    'TemperatureUnit',
  ];

  readonly operations: { value: OperationType; label: string }[] = [
    { value: 'ADD',     label: 'Add'      },
    { value: 'SUBTRACT',label: 'Subtract' },
    { value: 'COMPARE', label: 'Compare'  },
    { value: 'CONVERT', label: 'Convert'  },
    { value: 'DIVIDE',  label: 'Divide'   },
  ];

  constructor(
    private readonly fb:              FormBuilder,
    private readonly quantityService: QuantityService,
  ) {}

  ngOnInit(): void {
    this.measurementForm = this.fb.group({
      operation:            ['ADD',        Validators.required],
      // First operand
      thisValue:            [null,         [Validators.required]],
      thisMeasurementType:  ['LengthUnit', Validators.required],
      thisUnit:             ['FEET',       Validators.required],
      // Second operand (value ignored for CONVERT; sent as 0)
      thatValue:            [null,         [Validators.required]],
      thatMeasurementType:  ['LengthUnit', Validators.required],
      thatUnit:             ['FEET',       Validators.required],
    });

    this.measurementForm
      .get('operation')
      ?.valueChanges.subscribe((op: OperationType) => this.applyConvertMode(op));
    this.applyConvertMode(this.measurementForm.get('operation')?.value as OperationType);
  }

  /** When converting, only the target unit matters; second value is fixed at 0 on POST. */
  get isConvertMode(): boolean {
    return this.measurementForm?.get('operation')?.value === 'CONVERT';
  }

  private applyConvertMode(operation: OperationType): void {
    const thatValueCtrl = this.measurementForm.get('thatValue');
    if (operation === 'CONVERT') {
      thatValueCtrl?.setValue(0, { emitEvent: false });
      thatValueCtrl?.clearValidators();
    } else {
      if (thatValueCtrl?.value === 0 && operation !== 'DIVIDE') {
        thatValueCtrl.setValue(null, { emitEvent: false });
      }
      thatValueCtrl?.setValidators([Validators.required]);
    }
    thatValueCtrl?.updateValueAndValidity({ emitEvent: false });
  }

  // ── Derived data for templates ─────────────────────────────────────────────

  /**
   * Returns the available units for the 'this' operand measurement type.
   * Called in the template via a getter to keep the template clean.
   */
  get thisUnits(): string[] {
    const type = this.measurementForm.get('thisMeasurementType')?.value as MeasurementType;
    return UNIT_MAP[type] ?? [];
  }

  /**
   * Returns the available units for the 'that' operand measurement type.
   */
  get thatUnits(): string[] {
    const type = this.measurementForm.get('thatMeasurementType')?.value as MeasurementType;
    return UNIT_MAP[type] ?? [];
  }

  /**
   * Called when the user changes a measurement type dropdown.
   * Resets the corresponding unit to the first available option.
   */
  onMeasurementTypeChange(operand: 'this' | 'that'): void {
    const typeKey = operand === 'this' ? 'thisMeasurementType' : 'thatMeasurementType';
    const unitKey = operand === 'this' ? 'thisUnit'            : 'thatUnit';
    const type    = this.measurementForm.get(typeKey)?.value as MeasurementType;
    const firstUnit = UNIT_MAP[type]?.[0] ?? '';
    this.measurementForm.get(unitKey)?.setValue(firstUnit);
  }

  /** Whether the current result is a comparison (boolean result). */
  get isCompareResult(): boolean {
    return this.result?.operation === 'COMPARE';
  }

  // ── Form submission ────────────────────────────────────────────────────────

  onSubmit(): void {
    if (this.measurementForm.invalid) {
      this.measurementForm.markAllAsTouched();
      return;
    }

    this.isLoading    = true;
    this.result       = null;
    this.errorMessage = '';

    const f = this.measurementForm.value;

    const input: QuantityInputDTO = {
      thisQuantityDTO: {
        value:           f.thisValue,
        unit:            f.thisUnit,
        measurementType: f.thisMeasurementType,
      },
      thatQuantityDTO: {
        value:           f.thatValue,
        unit:            f.thatUnit,
        measurementType: f.thatMeasurementType,
      },
    };

    const operation = f.operation as OperationType;
    const request$  = this.dispatchOperation(operation, input);

    request$.subscribe({
      next: (dto) => {
        this.result    = dto;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading    = false;
        this.errorMessage = err.error?.message ?? 'Operation failed. Please try again.';
      },
    });
  }

  /** Dispatches the HTTP call based on the selected operation. */
  private dispatchOperation(operation: OperationType, input: QuantityInputDTO) {
    switch (operation) {
      case 'ADD':      return this.quantityService.add(input);
      case 'SUBTRACT': return this.quantityService.subtract(input);
      case 'COMPARE':  return this.quantityService.compare(input);
      case 'CONVERT':  return this.quantityService.convert(input);
      case 'DIVIDE':   return this.quantityService.divide(input);
    }
  }

  /** Resets the form and clears any result. */
  onReset(): void {
    this.measurementForm.reset({
      operation:           'ADD',
      thisMeasurementType: 'LengthUnit',
      thisUnit:            'FEET',
      thatMeasurementType: 'LengthUnit',
      thatUnit:            'FEET',
    });
    this.result       = null;
    this.errorMessage = '';
  }
}
