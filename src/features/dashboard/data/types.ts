export type DashboardSourceTable =
  | "access_request"
  | "coverage_assignment"
  | "event_record"
  | "incident"
  | "shift_log"
  | "surveillance_snapshot"
  | string;

export interface DashboardDateBounds {
  minDate: string | null;
  maxDate: string | null;
}

export interface DashboardMonthOption {
  label: string;
  order: number;
  value: string;
}

export interface DashboardEntityOption {
  id: string;
  code?: string | null;
  name?: string | null;
  label: string;
  sortOrder?: number | null;
  zoneId?: string | null;
  communityId?: string | null;
  legacyId?: string | null;
  legacyKey?: string | null;
  inferred?: boolean;
}

export interface DashboardFiltersRpcResponse {
  weeks: number[];
  years: number[];
  zones: DashboardEntityOption[];
  months: DashboardMonthOption[];
  communities: DashboardEntityOption[];
  dateBounds: DashboardDateBounds;
  institutions: DashboardEntityOption[];
  sourceTables: DashboardSourceTable[];
}

export interface OperationsFilterRow {
  source_table: DashboardSourceTable;
  fact_date: string | null;
  institution_id: string | null;
  zone_id: string | null;
  community_id: string | null;
  week_num: number | null;
  month_name: string | null;
  year_num: number | null;
}

export interface TurnosDashboardRow {
  id: string;
  shift_date: string | null;
  anio: number | null;
  mes: string | null;
  dia_semana_iso: number | null;
  nombre: string;
  tipo_puesto: string | null;
  zona: string | null;
  turno: string | null;
  ubicacion_institucion: string | null;
  comunidad: string | null;
  hora_entrada: string | null;
  hora_salida: string | null;
  hrs_laboradas: string | null;
  estatus: string | null;
  semana: number | null;
}

export interface DashboardFilterState {
  startDate: string | null;
  endDate: string | null;
  year: number | null;
  month: string | null;
  week: number | null;
  zoneId: string | null;
  communityId: string | null;
  institutionId: string | null;
  sourceTable: DashboardSourceTable | null;
}

export interface LabeledValueOption<T extends string | number> {
  value: T;
  label: string;
}

export interface DashboardFilterOptions {
  years: LabeledValueOption<number>[];
  months: LabeledValueOption<string>[];
  weeks: LabeledValueOption<number>[];
  zones: DashboardEntityOption[];
  communities: DashboardEntityOption[];
  institutions: DashboardEntityOption[];
  sourceTables: LabeledValueOption<DashboardSourceTable>[];
}

export interface DashboardDataModel {
  globalRpc: DashboardFiltersRpcResponse;
  rangeRpc: DashboardFiltersRpcResponse;
  operationsRows: OperationsFilterRow[];
  turnosRows: TurnosDashboardRow[];
  months: DashboardMonthOption[];
  monthByValue: Map<string, DashboardMonthOption>;
  dateBounds: DashboardDateBounds;
  baseOptions: DashboardFilterOptions;
  zonesById: Map<string, DashboardEntityOption>;
  communitiesById: Map<string, DashboardEntityOption>;
  institutionsById: Map<string, DashboardEntityOption>;
  turnosNamesById: {
    zone: Map<string, string>;
    community: Map<string, string>;
    institution: Map<string, string>;
  };
}

export interface RankedMetricItem {
  id: string | null;
  label: string;
  value: number;
}

export interface TimelineMetricPoint {
  key: string;
  label: string;
  value: number;
}

export interface SourceTableSummary {
  sourceTable: DashboardSourceTable;
  totalCount: number;
  rowsWithDate: number;
  nullDateCount: number;
  distinctInstitutions: number;
  distinctCommunities: number;
  distinctZones: number;
  monthlyTrend: TimelineMetricPoint[];
  weeklyTrend: TimelineMetricPoint[];
  yearlyTrend: TimelineMetricPoint[];
  topInstitutions: RankedMetricItem[];
  topCommunities: RankedMetricItem[];
  topZones: RankedMetricItem[];
  dataQuality: RankedMetricItem[];
}

export interface CoberturasSummary {
  totalRows: number;
  totalHours: number;
  volunteerAverageHours: number;
  monthlyHours: Array<{
    key: string;
    label: string;
    profesional: number;
    voluntario: number;
    sinClasificar: number;
  }>;
  communityHours: Array<{
    label: string;
    profesional: number;
    voluntario: number;
    total: number;
  }>;
  shiftByRole: Array<{
    name: string;
    profesional: number;
    voluntario: number;
    sinClasificar: number;
  }>;
  roleTable: Array<{
    role: string;
    peopleCount: number;
    averageHours: number;
  }>;
  attendance: Array<{
    status: string;
    profesional: number;
    voluntario: number;
    sinClasificar: number;
    total: number;
  }>;
}
