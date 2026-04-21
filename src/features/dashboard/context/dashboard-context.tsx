import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchDashboardFiltersRpc,
  fetchOperationsFilterRows,
  fetchTurnosDashboardRows,
} from "../data/api";
import {
  buildDashboardDataModel,
  deriveAvailableFilterOptions,
  normalizeDashboardFilters,
} from "../data/model";
import type {
  DashboardDataModel,
  DashboardFilterOptions,
  DashboardFilterState,
} from "../data/types";

interface DashboardContextValue {
  filters: DashboardFilterState;
  setFilter: <K extends keyof DashboardFilterState>(key: K, value: DashboardFilterState[K]) => void;
  resetFilters: () => void;
  availableOptions: DashboardFilterOptions;
  model: DashboardDataModel | null;
  isLoading: boolean;
  error: Error | null;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

const EMPTY_FILTER_OPTIONS: DashboardFilterOptions = {
  years: [],
  months: [],
  weeks: [],
  zones: [],
  communities: [],
  institutions: [],
  sourceTables: [],
};

const INITIAL_FILTERS: DashboardFilterState = {
  startDate: null,
  endDate: null,
  year: null,
  month: null,
  week: null,
  zoneId: null,
  communityId: null,
  institutionId: null,
  sourceTable: null,
};

function debugLog(scope: string, payload: unknown) {
  if (import.meta.env.DEV) {
    console.debug(`[dashop:${scope}]`, payload);
  }
}

export function DashboardDataProvider({ children }: PropsWithChildren) {
  const [filters, setFilters] = useState<DashboardFilterState>(INITIAL_FILTERS);
  const [defaultsApplied, setDefaultsApplied] = useState(false);

  const globalRpcQuery = useQuery({
    queryKey: ["dashboard", "rpc", "global"],
    queryFn: () => fetchDashboardFiltersRpc(),
    staleTime: 5 * 60 * 1000,
  });

  const rangeRpcQuery = useQuery({
    queryKey: ["dashboard", "rpc", "range", filters.startDate ?? null, filters.endDate ?? null],
    queryFn: () =>
      fetchDashboardFiltersRpc({
        startDate: filters.startDate,
        endDate: filters.endDate,
      }),
    staleTime: 5 * 60 * 1000,
  });

  const operationsQuery = useQuery({
    queryKey: ["dashboard", "vw_operaciones_filters"],
    queryFn: fetchOperationsFilterRows,
    staleTime: 5 * 60 * 1000,
  });

  const turnosQuery = useQuery({
    queryKey: ["dashboard", "vw_turnos_dashboard"],
    queryFn: fetchTurnosDashboardRows,
    staleTime: 5 * 60 * 1000,
  });

  const error = (globalRpcQuery.error ??
    rangeRpcQuery.error ??
    operationsQuery.error ??
    turnosQuery.error ??
    null) as Error | null;
  const isLoading =
    globalRpcQuery.isLoading ||
    rangeRpcQuery.isLoading ||
    operationsQuery.isLoading ||
    turnosQuery.isLoading;

  const model = useMemo(() => {
    if (
      !globalRpcQuery.data ||
      !rangeRpcQuery.data ||
      !operationsQuery.data ||
      !turnosQuery.data
    ) {
      return null;
    }

    return buildDashboardDataModel({
      globalRpc: globalRpcQuery.data,
      rangeRpc: rangeRpcQuery.data,
      operationsRows: operationsQuery.data,
      turnosRows: turnosQuery.data,
    });
  }, [
    globalRpcQuery.data,
    operationsQuery.data,
    rangeRpcQuery.data,
    turnosQuery.data,
  ]);

  const availableOptions = useMemo(() => {
    if (!model) {
      return EMPTY_FILTER_OPTIONS;
    }

    return deriveAvailableFilterOptions(model, filters);
  }, [filters, model]);

  useEffect(() => {
    if (!model || defaultsApplied) {
      return;
    }

    setDefaultsApplied(true);
    setFilters((current) =>
      normalizeDashboardFilters(
        {
          ...current,
          startDate: model.dateBounds.minDate,
          endDate: model.dateBounds.maxDate,
        },
        model.dateBounds,
      ),
    );
  }, [defaultsApplied, model]);

  useEffect(() => {
    if (!model) {
      return;
    }

    setFilters((current) => {
      const normalized = normalizeDashboardFilters(current, model.dateBounds);

      const next: DashboardFilterState = {
        ...normalized,
        year: availableOptions.years.some((option) => option.value === normalized.year) ? normalized.year : null,
        month: availableOptions.months.some((option) => option.value === normalized.month) ? normalized.month : null,
        week: availableOptions.weeks.some((option) => option.value === normalized.week) ? normalized.week : null,
        zoneId: availableOptions.zones.some((option) => option.id === normalized.zoneId) ? normalized.zoneId : null,
        communityId: availableOptions.communities.some((option) => option.id === normalized.communityId)
          ? normalized.communityId
          : null,
        institutionId: availableOptions.institutions.some((option) => option.id === normalized.institutionId)
          ? normalized.institutionId
          : null,
        sourceTable: availableOptions.sourceTables.some((option) => option.value === normalized.sourceTable)
          ? normalized.sourceTable
          : null,
      };

      const changed = Object.entries(next).some(([key, value]) => current[key as keyof DashboardFilterState] !== value);
      return changed ? next : current;
    });
  }, [availableOptions, model]);

  useEffect(() => {
    debugLog("filters", filters);
  }, [filters]);

  const value = useMemo<DashboardContextValue>(
    () => ({
      filters,
      setFilter: (key, value) => {
        setFilters((current) => ({
          ...current,
          [key]: value,
        }));
      },
      resetFilters: () => {
        setFilters({
          ...INITIAL_FILTERS,
          startDate: model?.dateBounds.minDate ?? null,
          endDate: model?.dateBounds.maxDate ?? null,
        });
      },
      availableOptions,
      model,
      isLoading,
      error,
    }),
    [availableOptions, error, filters, isLoading, model],
  );

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboardData() {
  const value = useContext(DashboardContext);

  if (!value) {
    throw new Error("useDashboardData must be used inside DashboardDataProvider.");
  }

  return value;
}
