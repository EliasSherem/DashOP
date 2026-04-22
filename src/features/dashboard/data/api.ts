import { supabase } from "@/lib/supabase";
import type {
  DashboardEntityOption,
  DashboardFiltersRpcResponse,
  DashboardMonthOption,
  OperationsFilterRow,
  TurnosDashboardRow,
} from "./types";

const PAGE_SIZE = 1000;

function debugLog(scope: string, payload: unknown) {
  if (import.meta.env.DEV) {
    console.debug(`[dashop:${scope}]`, payload);
  }
}

function normalizeMonthOption(value: unknown): DashboardMonthOption | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const raw = value as Record<string, unknown>;
  const label = typeof raw.label === "string" ? raw.label : null;
  const order = typeof raw.order === "number" ? raw.order : null;
  const monthValue = typeof raw.value === "string" ? raw.value.toLowerCase() : null;

  if (!label || !order || !monthValue) {
    return null;
  }

  return {
    label,
    order,
    value: monthValue,
  };
}

function normalizeEntityOption(value: unknown): DashboardEntityOption | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const raw = value as Record<string, unknown>;
  const id = typeof raw.id === "string" ? raw.id : null;

  if (!id) {
    return null;
  }

  const label =
    typeof raw.label === "string"
      ? raw.label
      : typeof raw.name === "string"
        ? raw.name
        : id.slice(0, 8);

  return {
    id,
    code: typeof raw.code === "string" ? raw.code : null,
    name: typeof raw.name === "string" ? raw.name : null,
    label,
    sortOrder: typeof raw.sort_order === "number" ? raw.sort_order : null,
    zoneId: typeof raw.zone_id === "string" ? raw.zone_id : null,
    communityId: typeof raw.community_id === "string" ? raw.community_id : null,
    legacyId: typeof raw.legacy_id === "string" ? raw.legacy_id : null,
    legacyKey: typeof raw.legacy_key === "string" ? raw.legacy_key : null,
  };
}

function normalizeRpcResponse(value: unknown): DashboardFiltersRpcResponse {
  const raw = value && typeof value === "object" ? (value as Record<string, unknown>) : {};

  return {
    weeks: Array.isArray(raw.weeks) ? raw.weeks.filter((item): item is number => typeof item === "number") : [],
    years: Array.isArray(raw.years) ? raw.years.filter((item): item is number => typeof item === "number") : [],
    zones: Array.isArray(raw.zones) ? raw.zones.map(normalizeEntityOption).filter(Boolean) as DashboardEntityOption[] : [],
    months: Array.isArray(raw.months)
      ? raw.months.map(normalizeMonthOption).filter(Boolean).sort((a, b) => a.order - b.order) as DashboardMonthOption[]
      : [],
    communities: Array.isArray(raw.communities)
      ? raw.communities.map(normalizeEntityOption).filter(Boolean) as DashboardEntityOption[]
      : [],
    dateBounds: {
      minDate:
        raw.date_bounds && typeof raw.date_bounds === "object" && typeof (raw.date_bounds as Record<string, unknown>).min_date === "string"
          ? ((raw.date_bounds as Record<string, unknown>).min_date as string)
          : null,
      maxDate:
        raw.date_bounds && typeof raw.date_bounds === "object" && typeof (raw.date_bounds as Record<string, unknown>).max_date === "string"
          ? ((raw.date_bounds as Record<string, unknown>).max_date as string)
          : null,
    },
    institutions: Array.isArray(raw.institutions)
      ? raw.institutions.map(normalizeEntityOption).filter(Boolean) as DashboardEntityOption[]
      : [],
    sourceTables: Array.isArray(raw.source_tables)
      ? raw.source_tables.filter((item): item is string => typeof item === "string")
      : [],
  };
}

async function fetchAllPages<T>(scope: string, fetchPage: (from: number, to: number) => Promise<T[]>): Promise<T[]> {
  const rows: T[] = [];

  for (let from = 0; ; from += PAGE_SIZE) {
    const page = await fetchPage(from, from + PAGE_SIZE - 1);
    rows.push(...page);

    if (page.length < PAGE_SIZE) {
      break;
    }
  }

  debugLog(scope, { rows: rows.length });
  return rows;
}

export async function fetchDashboardFiltersRpc(args?: {
  startDate?: string | null;
  endDate?: string | null;
}): Promise<DashboardFiltersRpcResponse> {
  const { data, error } = await supabase.rpc("rpc_dashboard_filters", {
    p_start_date: args?.startDate ?? null,
    p_end_date: args?.endDate ?? null,
  });

  if (error) {
    throw error;
  }

  const response = normalizeRpcResponse(data);
  debugLog("rpc_dashboard_filters", {
    input: args ?? null,
    years: response.years.length,
    weeks: response.weeks.length,
    zones: response.zones.length,
    communities: response.communities.length,
    institutions: response.institutions.length,
    sourceTables: response.sourceTables,
    dateBounds: response.dateBounds,
  });

  return response;
}

export async function fetchOperationsFilterRows(): Promise<OperationsFilterRow[]> {
  return fetchAllPages("vw_operaciones_filters", async (from, to) => {
    const { data, error } = await supabase
      .from("vw_operaciones_filters")
      .select("source_table,fact_date,institution_id,zone_id,community_id,week_num,month_name,year_num")
      .range(from, to);

    if (error) {
      throw error;
    }

    return (data ?? []) as OperationsFilterRow[];
  });
}

export async function fetchTurnosDashboardRows(): Promise<TurnosDashboardRow[]> {
  return fetchAllPages("vw_turnos_dashboard", async (from, to) => {
    const { data, error } = await supabase
      .from("vw_turnos_dashboard")
      .select(
        "id,shift_date,anio,mes,dia_semana_iso,nombre,tipo_puesto,zona,turno,ubicacion_institucion,comunidad,hora_entrada,hora_salida,hrs_laboradas,estatus,semana",
      )
      .range(from, to);

    if (error) {
      throw error;
    }

    return (data ?? []) as TurnosDashboardRow[];
  });
}
