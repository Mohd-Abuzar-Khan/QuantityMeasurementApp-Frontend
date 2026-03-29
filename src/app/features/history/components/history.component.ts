import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { QuantityService } from '@core/services/quantity.service';
import {
  MeasurementType,
  OperationType,
  QuantityMeasurementDTO,
} from '@core/models/quantity.models';

/**
 * HistoryComponent – displays persisted operation records from the backend.
 *
 * <h3>Features:</h3>
 * <ul>
 *   <li>Filter by operation type (ADD, SUBTRACT, COMPARE, etc.).</li>
 *   <li>Filter by measurement type (LengthUnit, WeightUnit, etc.).</li>
 *   <li>Separate tab/button to view only errored records.</li>
 *   <li>Pagination – client-side slicing of the result list.</li>
 *   <li>Loading and empty-state indicators.</li>
 * </ul>
 *
 * All data is fetched on component init and re-fetched on filter change.
 * No local caching is applied to keep the view in sync with the backend.
 */
@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
})
export class HistoryComponent implements OnInit {

  filterForm!: FormGroup;

  /** Full result list from the last fetch */
  records: QuantityMeasurementDTO[] = [];

  isLoading   = false;
  errorMessage = '';

  // ── Pagination ─────────────────────────────────────────────────────────────
  Math = Math;

  currentPage = 1;
  pageSize = 10;
  
  get totalPages(): number {
    return Math.ceil(this.records.length / this.pageSize);
  }

  get pagedRecords(): QuantityMeasurementDTO[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.records.slice(start, start + this.pageSize);
  }

  // ── Static data for dropdowns ──────────────────────────────────────────────

  readonly operationOptions: Array<{ value: string; label: string }> = [
    { value: '',         label: 'All operations' },
    { value: 'ADD',      label: 'Add'     },
    { value: 'SUBTRACT', label: 'Subtract' },
    { value: 'COMPARE',  label: 'Compare'  },
    { value: 'CONVERT',  label: 'Convert'  },
    { value: 'DIVIDE',   label: 'Divide'   },
    { value: 'ERRORED',  label: 'Errors only' },
  ];

  readonly typeOptions: Array<{ value: string; label: string }> = [
    { value: '',                label: 'All types'        },
    { value: 'LengthUnit',      label: 'Length'           },
    { value: 'WeightUnit',      label: 'Weight'           },
    { value: 'VolumeUnit',      label: 'Volume'           },
    { value: 'TemperatureUnit', label: 'Temperature'      },
  ];

  constructor(
    private readonly fb:      FormBuilder,
    private readonly svc:     QuantityService,
  ) {}

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      operation:       [''],
      measurementType: [''],
    });

    // React to filter changes without a separate button
    this.filterForm.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.fetchRecords();
    });

    // Initial load – fetch all records
    this.fetchRecords();
  }

  // ── Data fetching ──────────────────────────────────────────────────────────

  /**
   * Determines which backend endpoint to call based on current filter state,
   * then updates the records list.
   */
  fetchRecords(): void {
    const { operation, measurementType } = this.filterForm.value as {
      operation: string;
      measurementType: string;
    };

    this.isLoading    = true;
    this.errorMessage = '';

    let request$;

    if (operation === 'ERRORED') {
      // Special filter: errored records endpoint
      request$ = this.svc.getErrorHistory();
    } else if (operation) {
      // Filter by specific operation
      request$ = this.svc.getHistoryByOperation(operation as OperationType);
    } else if (measurementType) {
      // Filter by measurement type
      request$ = this.svc.getHistoryByType(measurementType);
    } else {
      // Default: all records via the ADD history (placeholder for a future /all endpoint)
      // In production, add GET /api/v1/quantities/history to the backend.
      request$ = this.svc.getHistoryByOperation('ADD');
    }

    request$.subscribe({
      next: (data) => {
        this.records   = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading    = false;
        this.errorMessage = err.error?.message ?? 'Failed to load history.';
      },
    });
  }

  // ── Pagination controls ────────────────────────────────────────────────────

  prevPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  goToPage(page: number): void {
    this.currentPage = page;
  }

  /** Array of page numbers for the pagination strip */
  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}
