// ============================================================================
// Copart Brasil — Data Service
// Abstract layer: swap MockDataService for BigQueryDataService
// ============================================================================

import { RawExportDataService } from "./raw-data";
import type { DataService } from "./types";

// Extrações em raw/ (Meta, Google Ads, GA4, Copart). BigQuery substitui esta camada depois.

export const dataService: DataService = new RawExportDataService();
