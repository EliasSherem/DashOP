import { useMemo } from "react";
import { useDashboardData } from "./context/dashboard-context";
import {
  buildCoberturasSummary,
  buildSourceTableSummary,
  filterSourceTableRows,
} from "./data/sections";
import type { DashboardSourceTable } from "./data/types";

export function useSourceTableSection(sourceTable: DashboardSourceTable) {
  const dashboard = useDashboardData();

  const summary = useMemo(() => {
    if (!dashboard.model) {
      return null;
    }

    const rows = filterSourceTableRows(dashboard.model, dashboard.filters, sourceTable);
    return buildSourceTableSummary(rows, dashboard.model, sourceTable);
  }, [dashboard.filters, dashboard.model, sourceTable]);

  return {
    ...dashboard,
    summary,
    isSourceTableMismatch:
      Boolean(dashboard.filters.sourceTable) &&
      dashboard.filters.sourceTable !== sourceTable,
  };
}

export function useCoberturasSection() {
  const dashboard = useDashboardData();

  const summary = useMemo(() => {
    if (!dashboard.model) {
      return null;
    }

    return buildCoberturasSummary(dashboard.model, dashboard.filters);
  }, [dashboard.filters, dashboard.model]);

  return {
    ...dashboard,
    summary,
    isSourceTableMismatch:
      Boolean(dashboard.filters.sourceTable) &&
      dashboard.filters.sourceTable !== "shift_log",
  };
}

export function useCapacitacionAvailability() {
  const dashboard = useDashboardData();

  const exposedSourceTables = dashboard.model?.baseOptions.sourceTables ?? [];
  const hasTrainingSources = exposedSourceTables.some((option) =>
    ["training_session", "kabat_meeting_attendance"].includes(option.value),
  );

  return {
    ...dashboard,
    exposedSourceTables,
    hasTrainingSources,
  };
}
