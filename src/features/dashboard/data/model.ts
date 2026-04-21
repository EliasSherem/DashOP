import type {
  DashboardDataModel,
  DashboardDateBounds,
  DashboardEntityOption,
  DashboardFilterOptions,
  DashboardFilterState,
  DashboardFiltersRpcResponse,
  DashboardMonthOption,
  DashboardSourceTable,
  OperationsFilterRow,
  TurnosDashboardRow,
} from "./types";

const SOURCE_TABLE_LABELS: Record<string, string> = {
  access_request: "Accesos",
  coverage_assignment: "Coberturas",
  event_record: "Eventos",
  incident: "Situaciones",
  shift_log: "Turnos",
  surveillance_snapshot: "Eficiencia",
};

function countByValue<T>(items: T[], getValue: (item: T) => string | null): Map<string, number> {
  const counts = new Map<string, number>();

  for (const item of items) {
    const value = getValue(item);

    if (!value) {
      continue;
    }

    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return counts;
}

function normalizeMonthValue(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? null;
}

function buildSignatureMap<T>(
  items: T[],
  getValue: (item: T) => string | null,
  getKey: (item: T) => string,
) {
  const valueToCounts = new Map<string, Map<string, number>>();

  for (const item of items) {
    const value = getValue(item) ?? "__NULL__";
    const key = getKey(item);
    const counts = valueToCounts.get(value) ?? new Map<string, number>();

    counts.set(key, (counts.get(key) ?? 0) + 1);
    valueToCounts.set(value, counts);
  }

  const signatureToValues = new Map<string, string[]>();

  for (const [value, counts] of valueToCounts.entries()) {
    const signature = [...counts.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, total]) => `${key}:${total}`)
      .join("|");
    const values = signatureToValues.get(signature) ?? [];

    values.push(value);
    signatureToValues.set(signature, values);
  }

  return {
    valueToCounts,
    signatureToValues,
  };
}

function pairByExactSignature(left: ReturnType<typeof buildSignatureMap>, right: ReturnType<typeof buildSignatureMap>) {
  const pairs = new Map<string, string>();

  for (const [signature, leftValues] of left.signatureToValues.entries()) {
    const rightValues = right.signatureToValues.get(signature);

    if (leftValues.length === 1 && rightValues?.length === 1) {
      pairs.set(leftValues[0], rightValues[0]);
    }
  }

  return pairs;
}

function collectMostCommonValue<T>(items: T[], getValue: (item: T) => string | null) {
  const counts = countByValue(items, getValue);
  let bestValue: string | null = null;
  let bestCount = -1;

  for (const [value, total] of counts.entries()) {
    if (total > bestCount) {
      bestValue = value;
      bestCount = total;
    }
  }

  return bestValue;
}

function collectInstitutionMeta(rows: OperationsFilterRow[]) {
  const byInstitution = new Map<string, OperationsFilterRow[]>();

  for (const row of rows) {
    if (!row.institution_id) {
      continue;
    }

    const group = byInstitution.get(row.institution_id) ?? [];
    group.push(row);
    byInstitution.set(row.institution_id, group);
  }

  const meta = new Map<string, { zoneId: string | null; communityId: string | null }>();

  for (const [institutionId, group] of byInstitution.entries()) {
    meta.set(institutionId, {
      zoneId: collectMostCommonValue(group, (row) => row.zone_id),
      communityId: collectMostCommonValue(group, (row) => row.community_id),
    });
  }

  return meta;
}

function toLabelWithFallback(prefix: string, id: string) {
  return `${prefix} ${id.slice(0, 8)}`;
}

function mergeEntityOptions(args: {
  allIds: Iterable<string>;
  rpcOptions: DashboardEntityOption[];
  inferredLabels?: Map<string, string>;
  fallbackPrefix: string;
  institutionMeta?: Map<string, { zoneId: string | null; communityId: string | null }>;
}) {
  const byId = new Map<string, DashboardEntityOption>();

  for (const option of args.rpcOptions) {
    byId.set(option.id, option);
  }

  for (const id of args.allIds) {
    const current = byId.get(id);
    const inferredLabel = args.inferredLabels?.get(id);
    const meta = args.institutionMeta?.get(id);

    byId.set(id, {
      id,
      label: current?.label ?? inferredLabel ?? toLabelWithFallback(args.fallbackPrefix, id),
      code: current?.code ?? null,
      name: current?.name ?? inferredLabel ?? null,
      sortOrder: current?.sortOrder ?? null,
      zoneId: current?.zoneId ?? meta?.zoneId ?? null,
      communityId: current?.communityId ?? meta?.communityId ?? null,
      legacyId: current?.legacyId ?? null,
      legacyKey: current?.legacyKey ?? null,
      inferred: current?.inferred ?? !current,
    });
  }

  return [...byId.values()].sort((left, right) => {
    const leftOrder = left.sortOrder ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = right.sortOrder ?? Number.MAX_SAFE_INTEGER;

    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    return left.label.localeCompare(right.label, "es");
  });
}

function deriveDateBounds(
  globalRpc: DashboardFiltersRpcResponse,
  operationsRows: OperationsFilterRow[],
): DashboardDateBounds {
  if (globalRpc.dateBounds.minDate || globalRpc.dateBounds.maxDate) {
    return globalRpc.dateBounds;
  }

  const datedRows = operationsRows.map((row) => row.fact_date).filter(Boolean) as string[];

  if (!datedRows.length) {
    return {
      minDate: null,
      maxDate: null,
    };
  }

  return {
    minDate: datedRows.slice().sort()[0] ?? null,
    maxDate: datedRows.slice().sort().at(-1) ?? null,
  };
}

function toSourceTableOption(sourceTable: DashboardSourceTable) {
  return {
    value: sourceTable,
    label: SOURCE_TABLE_LABELS[sourceTable] ?? sourceTable,
  };
}

export function getYearFromOperationsRow(row: OperationsFilterRow) {
  if (typeof row.year_num === "number") {
    return row.year_num;
  }

  return row.fact_date ? Number(row.fact_date.slice(0, 4)) : null;
}

export function getMonthValueFromDate(dateString: string | null, months: DashboardMonthOption[]) {
  if (!dateString) {
    return null;
  }

  const rawMonth = Number(dateString.slice(5, 7));
  const monthOption = months.find((month) => month.order === rawMonth);

  return monthOption?.value ?? null;
}

export function getMonthValueFromOperationsRow(row: OperationsFilterRow, months: DashboardMonthOption[]) {
  return normalizeMonthValue(row.month_name) ?? getMonthValueFromDate(row.fact_date, months);
}

export function getWeekFromOperationsRow(row: OperationsFilterRow) {
  return typeof row.week_num === "number" ? row.week_num : null;
}

export function getYearFromTurnosRow(row: TurnosDashboardRow) {
  if (typeof row.anio === "number") {
    return row.anio;
  }

  return row.shift_date ? Number(row.shift_date.slice(0, 4)) : null;
}

export function getMonthValueFromTurnosRow(row: TurnosDashboardRow, months: DashboardMonthOption[]) {
  return getMonthValueFromDate(row.shift_date, months);
}

export function getWeekFromTurnosRow(row: TurnosDashboardRow) {
  return typeof row.semana === "number" ? row.semana : null;
}

export function parseDurationToHours(value: string | null) {
  if (!value) {
    return 0;
  }

  const parts = value.split(":").map((part) => Number(part));

  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) {
    return 0;
  }

  const [hours, minutes, seconds] = parts;
  return hours + minutes / 60 + seconds / 3600;
}

export function formatMonthYearLabel(month: DashboardMonthOption, year: number) {
  return `${month.label.slice(0, 3)} ${year}`;
}

function rowsMatchDateRange(dateString: string | null, filters: DashboardFilterState) {
  if (!dateString) {
    return !filters.startDate && !filters.endDate;
  }

  if (filters.startDate && dateString < filters.startDate) {
    return false;
  }

  if (filters.endDate && dateString > filters.endDate) {
    return false;
  }

  return true;
}

export function matchesOperationsRow(
  row: OperationsFilterRow,
  filters: DashboardFilterState,
  model: DashboardDataModel,
  ignore: Array<keyof DashboardFilterState> = [],
) {
  if (!ignore.includes("sourceTable") && filters.sourceTable && row.source_table !== filters.sourceTable) {
    return false;
  }

  if (!rowsMatchDateRange(row.fact_date, filters)) {
    return false;
  }

  const year = getYearFromOperationsRow(row);
  const month = getMonthValueFromOperationsRow(row, model.months);
  const week = getWeekFromOperationsRow(row);

  if (!ignore.includes("year") && filters.year && year !== filters.year) {
    return false;
  }

  if (!ignore.includes("month") && filters.month && month !== filters.month) {
    return false;
  }

  if (!ignore.includes("week") && filters.week && week !== filters.week) {
    return false;
  }

  if (!ignore.includes("zoneId") && filters.zoneId && row.zone_id !== filters.zoneId) {
    return false;
  }

  if (!ignore.includes("communityId") && filters.communityId && row.community_id !== filters.communityId) {
    return false;
  }

  if (!ignore.includes("institutionId") && filters.institutionId && row.institution_id !== filters.institutionId) {
    return false;
  }

  return true;
}

export function matchesTurnosRow(row: TurnosDashboardRow, filters: DashboardFilterState, model: DashboardDataModel) {
  if (filters.sourceTable && filters.sourceTable !== "shift_log") {
    return false;
  }

  if (!rowsMatchDateRange(row.shift_date, filters)) {
    return false;
  }

  const year = getYearFromTurnosRow(row);
  const month = getMonthValueFromTurnosRow(row, model.months);
  const week = getWeekFromTurnosRow(row);

  if (filters.year && year !== filters.year) {
    return false;
  }

  if (filters.month && month !== filters.month) {
    return false;
  }

  if (filters.week && week !== filters.week) {
    return false;
  }

  if (filters.zoneId) {
    const expectedZone = model.turnosNamesById.zone.get(filters.zoneId);

    if (!expectedZone || row.zona !== expectedZone) {
      return false;
    }
  }

  if (filters.communityId) {
    const expectedCommunity = model.turnosNamesById.community.get(filters.communityId);

    if (!expectedCommunity || row.comunidad !== expectedCommunity) {
      return false;
    }
  }

  if (filters.institutionId) {
    const expectedInstitution = model.turnosNamesById.institution.get(filters.institutionId);

    if (!expectedInstitution || row.ubicacion_institucion !== expectedInstitution) {
      return false;
    }
  }

  return true;
}

export function normalizeDashboardFilters(filters: DashboardFilterState, bounds: DashboardDateBounds): DashboardFilterState {
  const clampedStart =
    filters.startDate && bounds.minDate && filters.startDate < bounds.minDate
      ? bounds.minDate
      : filters.startDate;
  const clampedEnd =
    filters.endDate && bounds.maxDate && filters.endDate > bounds.maxDate
      ? bounds.maxDate
      : filters.endDate;

  if (clampedStart && clampedEnd && clampedStart > clampedEnd) {
    return {
      ...filters,
      startDate: clampedEnd,
      endDate: clampedStart,
    };
  }

  return {
    ...filters,
    startDate: clampedStart,
    endDate: clampedEnd,
  };
}

export function buildDashboardDataModel(args: {
  globalRpc: DashboardFiltersRpcResponse;
  rangeRpc: DashboardFiltersRpcResponse;
  operationsRows: OperationsFilterRow[];
  turnosRows: TurnosDashboardRow[];
}): DashboardDataModel {
  const shiftRows = args.operationsRows.filter((row) => row.source_table === "shift_log");
  const months = (args.globalRpc.months.length ? args.globalRpc.months : args.rangeRpc.months).slice().sort((left, right) => left.order - right.order);
  const monthByValue = new Map(months.map((month) => [month.value, month]));
  const communityIdToName = pairByExactSignature(
    buildSignatureMap(shiftRows, (row) => row.community_id, (row) => row.fact_date ?? "__NULL__"),
    buildSignatureMap(args.turnosRows, (row) => row.comunidad, (row) => row.shift_date ?? "__NULL__"),
  );
  const zoneIdToName = pairByExactSignature(
    buildSignatureMap(shiftRows, (row) => row.zone_id, (row) => row.fact_date ?? "__NULL__"),
    buildSignatureMap(args.turnosRows, (row) => row.zona, (row) => row.shift_date ?? "__NULL__"),
  );

  const communityNameToId = new Map([...communityIdToName.entries()].map(([id, name]) => [name, id]));
  const zoneNameToId = new Map([...zoneIdToName.entries()].map(([id, name]) => [name, id]));

  const institutionIdToName = pairByExactSignature(
    buildSignatureMap(
      shiftRows,
      (row) => row.institution_id,
      (row) => `${row.fact_date ?? "__NULL__"}|${row.community_id ?? "__NULL__"}|${row.zone_id ?? "__NULL__"}`,
    ),
    buildSignatureMap(
      args.turnosRows,
      (row) => row.ubicacion_institucion,
      (row) =>
        `${row.shift_date ?? "__NULL__"}|${communityNameToId.get(row.comunidad ?? "__NULL__") ?? "__NULL__"}|${zoneNameToId.get(row.zona ?? "__NULL__") ?? "__NULL__"}`,
    ),
  );

  const institutionMeta = collectInstitutionMeta(args.operationsRows);
  const zoneIds = [...new Set(args.operationsRows.map((row) => row.zone_id).filter(Boolean))] as string[];
  const communityIds = [...new Set(args.operationsRows.map((row) => row.community_id).filter(Boolean))] as string[];
  const institutionIds = [...new Set(args.operationsRows.map((row) => row.institution_id).filter(Boolean))] as string[];
  const mergedZones = mergeEntityOptions({
    allIds: zoneIds,
    rpcOptions: args.rangeRpc.zones.length ? args.rangeRpc.zones : args.globalRpc.zones,
    inferredLabels: zoneIdToName,
    fallbackPrefix: "Zona",
  });
  const mergedCommunities = mergeEntityOptions({
    allIds: communityIds,
    rpcOptions: args.rangeRpc.communities.length ? args.rangeRpc.communities : args.globalRpc.communities,
    inferredLabels: communityIdToName,
    fallbackPrefix: "Comunidad",
  });
  const mergedInstitutions = mergeEntityOptions({
    allIds: institutionIds,
    rpcOptions: args.rangeRpc.institutions.length ? args.rangeRpc.institutions : args.globalRpc.institutions,
    inferredLabels: institutionIdToName,
    fallbackPrefix: "Institución",
    institutionMeta,
  });

  const years = [...new Set([...args.globalRpc.years, ...args.rangeRpc.years, ...args.operationsRows.map(getYearFromOperationsRow).filter(Boolean) as number[]])].sort((left, right) => left - right);
  const weeks = [...new Set([...args.globalRpc.weeks, ...args.rangeRpc.weeks, ...args.operationsRows.map(getWeekFromOperationsRow).filter(Boolean) as number[]])].sort((left, right) => left - right);
  const sourceTables = [...new Set([...args.globalRpc.sourceTables, ...args.rangeRpc.sourceTables, ...args.operationsRows.map((row) => row.source_table)])]
    .sort((left, right) => (SOURCE_TABLE_LABELS[left] ?? left).localeCompare(SOURCE_TABLE_LABELS[right] ?? right, "es"))
    .map(toSourceTableOption);

  return {
    globalRpc: args.globalRpc,
    rangeRpc: args.rangeRpc,
    operationsRows: args.operationsRows,
    turnosRows: args.turnosRows,
    months,
    monthByValue,
    dateBounds: deriveDateBounds(args.globalRpc, args.operationsRows),
    baseOptions: {
      years: years.map((year) => ({ value: year, label: year.toString() })),
      months: months.map((month) => ({ value: month.value, label: month.label })),
      weeks: weeks.map((week) => ({ value: week, label: `Semana ${week}` })),
      zones: mergedZones,
      communities: mergedCommunities,
      institutions: mergedInstitutions,
      sourceTables,
    },
    zonesById: new Map(mergedZones.map((option) => [option.id, option])),
    communitiesById: new Map(mergedCommunities.map((option) => [option.id, option])),
    institutionsById: new Map(mergedInstitutions.map((option) => [option.id, option])),
    turnosNamesById: {
      zone: zoneIdToName,
      community: communityIdToName,
      institution: institutionIdToName,
    },
  };
}

function collectAvailableOperationsRows(
  model: DashboardDataModel,
  filters: DashboardFilterState,
  dimension: keyof DashboardFilterState,
) {
  return model.operationsRows.filter((row) => matchesOperationsRow(row, filters, model, [dimension]));
}

export function deriveAvailableFilterOptions(model: DashboardDataModel, filters: DashboardFilterState): DashboardFilterOptions {
  const availableYears = new Set(
    collectAvailableOperationsRows(model, filters, "year")
      .map(getYearFromOperationsRow)
      .filter(Boolean) as number[],
  );
  const availableMonths = new Set(
    collectAvailableOperationsRows(model, filters, "month")
      .map((row) => getMonthValueFromOperationsRow(row, model.months))
      .filter(Boolean) as string[],
  );
  const availableWeeks = new Set(
    collectAvailableOperationsRows(model, filters, "week")
      .map(getWeekFromOperationsRow)
      .filter(Boolean) as number[],
  );
  const availableZones = new Set(
    collectAvailableOperationsRows(model, filters, "zoneId")
      .map((row) => row.zone_id)
      .filter(Boolean) as string[],
  );
  const availableCommunities = new Set(
    collectAvailableOperationsRows(model, filters, "communityId")
      .map((row) => row.community_id)
      .filter(Boolean) as string[],
  );
  const availableInstitutions = new Set(
    collectAvailableOperationsRows(model, filters, "institutionId")
      .map((row) => row.institution_id)
      .filter(Boolean) as string[],
  );
  const availableSourceTables = new Set(
    collectAvailableOperationsRows(model, filters, "sourceTable").map((row) => row.source_table),
  );
  const rpcYears = new Set(model.rangeRpc.years);
  const rpcWeeks = new Set(model.rangeRpc.weeks);
  const rpcMonths = new Set(model.rangeRpc.months.map((month) => month.value));
  const rpcSourceTables = new Set(model.rangeRpc.sourceTables);

  return {
    years: model.baseOptions.years.filter((option) => availableYears.has(option.value) && (!rpcYears.size || rpcYears.has(option.value))),
    months: model.baseOptions.months.filter((option) => availableMonths.has(option.value) && (!rpcMonths.size || rpcMonths.has(option.value))),
    weeks: model.baseOptions.weeks.filter((option) => availableWeeks.has(option.value) && (!rpcWeeks.size || rpcWeeks.has(option.value))),
    zones: model.baseOptions.zones.filter((option) => availableZones.has(option.id)),
    communities: model.baseOptions.communities.filter((option) => availableCommunities.has(option.id)),
    institutions: model.baseOptions.institutions.filter((option) => availableInstitutions.has(option.id)),
    sourceTables: model.baseOptions.sourceTables.filter((option) => availableSourceTables.has(option.value) && (!rpcSourceTables.size || rpcSourceTables.has(option.value))),
  };
}
