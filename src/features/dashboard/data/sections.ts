import type {
  CoberturasSummary,
  DashboardDataModel,
  DashboardFilterState,
  DashboardSourceTable,
  OperationsFilterRow,
  RankedMetricItem,
  SourceTableSummary,
  TimelineMetricPoint,
  TurnosDashboardRow,
} from "./types";
import {
  formatMonthYearLabel,
  getMonthValueFromOperationsRow,
  getMonthValueFromTurnosRow,
  getWeekFromOperationsRow,
  getYearFromOperationsRow,
  getYearFromTurnosRow,
  matchesOperationsRow,
  matchesTurnosRow,
  parseDurationToHours,
} from "./model";

function ensureRankedItems<T extends string | null>(counts: Map<T, number>, toLabel: (value: T) => string, limit = 10): RankedMetricItem[] {
  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([id, value]) => ({
      id,
      label: toLabel(id),
      value,
    }));
}

function buildMonthlyTrend(
  rows: OperationsFilterRow[],
  model: DashboardDataModel,
) {
  const buckets = new Map<string, { label: string; value: number }>();

  for (const row of rows) {
    if (!row.fact_date) {
      continue;
    }

    const year = getYearFromOperationsRow(row);
    const monthValue = getMonthValueFromOperationsRow(row, model.months);
    const month = monthValue ? model.monthByValue.get(monthValue) : null;

    if (!year || !month) {
      continue;
    }

    const key = `${year}-${month.order.toString().padStart(2, "0")}`;
    const bucket = buckets.get(key) ?? {
      label: formatMonthYearLabel(month, year),
      value: 0,
    };

    bucket.value += 1;
    buckets.set(key, bucket);
  }

  return [...buckets.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, bucket]) => ({
      key,
      label: bucket.label,
      value: bucket.value,
    }));
}

function buildWeeklyTrend(
  rows: OperationsFilterRow[],
): TimelineMetricPoint[] {
  const buckets = new Map<string, number>();

  for (const row of rows) {
    const year = getYearFromOperationsRow(row);
    const week = getWeekFromOperationsRow(row);

    if (!year || !week) {
      continue;
    }

    const key = `${year}-${week.toString().padStart(2, "0")}`;
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }

  return [...buckets.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .slice(-12)
    .map(([key, value]) => {
      const [year, week] = key.split("-");
      return {
        key,
        label: `S${Number(week)} ${year}`,
        value,
      };
    });
}

function buildYearlyTrend(rows: OperationsFilterRow[]): TimelineMetricPoint[] {
  const buckets = new Map<number, number>();

  for (const row of rows) {
    const year = getYearFromOperationsRow(row);

    if (!year) {
      continue;
    }

    buckets.set(year, (buckets.get(year) ?? 0) + 1);
  }

  return [...buckets.entries()]
    .sort(([left], [right]) => left - right)
    .map(([year, value]) => ({
      key: year.toString(),
      label: year.toString(),
      value,
    }));
}

function labelEntity(label: string | undefined, fallback: string) {
  return label && label.trim().length ? label : fallback;
}

export function buildSourceTableSummary(
  rows: ReturnType<typeof filterSourceTableRows>,
  model: DashboardDataModel,
  sourceTable: DashboardSourceTable,
): SourceTableSummary {
  const institutionCounts = new Map<string | null, number>();
  const communityCounts = new Map<string | null, number>();
  const zoneCounts = new Map<string | null, number>();
  let rowsWithDate = 0;
  let rowsWithInstitution = 0;
  let rowsWithCommunity = 0;
  let rowsWithZone = 0;

  for (const row of rows) {
    if (row.fact_date) {
      rowsWithDate += 1;
    }

    if (row.institution_id) {
      rowsWithInstitution += 1;
      institutionCounts.set(row.institution_id, (institutionCounts.get(row.institution_id) ?? 0) + 1);
    }

    if (row.community_id) {
      rowsWithCommunity += 1;
      communityCounts.set(row.community_id, (communityCounts.get(row.community_id) ?? 0) + 1);
    }

    if (row.zone_id) {
      rowsWithZone += 1;
      zoneCounts.set(row.zone_id, (zoneCounts.get(row.zone_id) ?? 0) + 1);
    }
  }

  return {
    sourceTable,
    totalCount: rows.length,
    rowsWithDate,
    nullDateCount: rows.length - rowsWithDate,
    distinctInstitutions: institutionCounts.size,
    distinctCommunities: communityCounts.size,
    distinctZones: zoneCounts.size,
    monthlyTrend: buildMonthlyTrend(rows, model),
    weeklyTrend: buildWeeklyTrend(rows),
    yearlyTrend: buildYearlyTrend(rows),
    topInstitutions: ensureRankedItems(
      institutionCounts,
      (id) => labelEntity(id ? model.institutionsById.get(id)?.label : undefined, "Sin institución"),
      10,
    ),
    topCommunities: ensureRankedItems(
      communityCounts,
      (id) => labelEntity(id ? model.communitiesById.get(id)?.label : undefined, "Sin comunidad"),
      10,
    ),
    topZones: ensureRankedItems(
      zoneCounts,
      (id) => labelEntity(id ? model.zonesById.get(id)?.label : undefined, "Sin zona"),
      10,
    ),
    dataQuality: [
      { id: "dated", label: "Con fecha", value: rowsWithDate },
      { id: "undated", label: "Sin fecha", value: rows.length - rowsWithDate },
      { id: "institution", label: "Con institución", value: rowsWithInstitution },
      { id: "community", label: "Con comunidad", value: rowsWithCommunity },
      { id: "zone", label: "Con zona", value: rowsWithZone },
    ],
  };
}

export function filterSourceTableRows(
  model: DashboardDataModel,
  filters: DashboardFilterState,
  sourceTable: DashboardSourceTable,
) {
  if (filters.sourceTable && filters.sourceTable !== sourceTable) {
    return [];
  }

  return model.operationsRows.filter(
    (row) => row.source_table === sourceTable && matchesOperationsRow(row, { ...filters, sourceTable: sourceTable }, model),
  );
}

function normalizeRole(value: string | null) {
  if (value === "Profesional") {
    return "Profesional";
  }

  if (value === "Voluntario") {
    return "Voluntario";
  }

  return "Sin clasificar";
}

function normalizeTurn(value: string | null) {
  if (value === "Matutino" || value === "Vespertino" || value === "Nocturno") {
    return value;
  }

  return "Sin turno";
}

function normalizeStatus(value: string | null) {
  if (value === "Asistió" || value === "No asistió" || value === "Retardo" || value === "Aprobado" || value === "Solicitado") {
    return value;
  }

  return "Sin estatus";
}

function filterTurnosRows(model: DashboardDataModel, filters: DashboardFilterState) {
  return model.turnosRows.filter((row) => matchesTurnosRow(row, filters, model));
}

function buildCoberturasMonthlyHours(rows: TurnosDashboardRow[], model: DashboardDataModel): CoberturasSummary["monthlyHours"] {
  const buckets = new Map<string, { label: string; profesional: number; voluntario: number; sinClasificar: number }>();

  for (const row of rows) {
    if (!row.shift_date) {
      continue;
    }

    const year = getYearFromTurnosRow(row);
    const monthValue = getMonthValueFromTurnosRow(row, model.months);
    const month = monthValue ? model.monthByValue.get(monthValue) : null;

    if (!year || !month) {
      continue;
    }

    const key = `${year}-${month.order.toString().padStart(2, "0")}`;
    const bucket = buckets.get(key) ?? {
      label: formatMonthYearLabel(month, year),
      profesional: 0,
      voluntario: 0,
      sinClasificar: 0,
    };
    const hours = parseDurationToHours(row.hrs_laboradas);
    const role = normalizeRole(row.tipo_puesto);

    if (role === "Profesional") {
      bucket.profesional += hours;
    } else if (role === "Voluntario") {
      bucket.voluntario += hours;
    } else {
      bucket.sinClasificar += hours;
    }

    buckets.set(key, bucket);
  }

  return [...buckets.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => ({
      key,
      ...value,
    }));
}

function buildCoberturasCommunityHours(rows: TurnosDashboardRow[]) {
  const buckets = new Map<string, { profesional: number; voluntario: number; total: number }>();

  for (const row of rows) {
    const label = row.comunidad ?? "Sin comunidad";
    const bucket = buckets.get(label) ?? {
      profesional: 0,
      voluntario: 0,
      total: 0,
    };
    const hours = parseDurationToHours(row.hrs_laboradas);
    const role = normalizeRole(row.tipo_puesto);

    if (role === "Profesional") {
      bucket.profesional += hours;
    } else if (role === "Voluntario") {
      bucket.voluntario += hours;
    }

    bucket.total += hours;
    buckets.set(label, bucket);
  }

  return [...buckets.entries()]
    .map(([label, value]) => ({
      label,
      ...value,
    }))
    .sort((left, right) => right.total - left.total)
    .slice(0, 10);
}

function buildCoberturasShiftByRole(rows: TurnosDashboardRow[]) {
  const turns = ["Matutino", "Vespertino", "Nocturno", "Sin turno"];

  return turns.map((turn) => {
    const bucket = {
      name: turn,
      profesional: 0,
      voluntario: 0,
      sinClasificar: 0,
    };

    for (const row of rows) {
      if (normalizeTurn(row.turno) !== turn) {
        continue;
      }

      const role = normalizeRole(row.tipo_puesto);

      if (role === "Profesional") {
        bucket.profesional += 1;
      } else if (role === "Voluntario") {
        bucket.voluntario += 1;
      } else {
        bucket.sinClasificar += 1;
      }
    }

    return bucket;
  });
}

function buildCoberturasRoleTable(rows: TurnosDashboardRow[]) {
  const grouped = new Map<string, { people: Set<string>; totalHours: number; rowCount: number }>();

  for (const row of rows) {
    const role = normalizeRole(row.tipo_puesto);
    const current = grouped.get(role) ?? {
      people: new Set<string>(),
      totalHours: 0,
      rowCount: 0,
    };
    const hours = parseDurationToHours(row.hrs_laboradas);

    if (hours > 0) {
      current.people.add(row.nombre);
      current.totalHours += hours;
      current.rowCount += 1;
    }

    grouped.set(role, current);
  }

  const rowsOut = ["Profesional", "Voluntario", "Sin clasificar"].map((role) => {
    const current = grouped.get(role) ?? {
      people: new Set<string>(),
      totalHours: 0,
      rowCount: 0,
    };

    return {
      role,
      peopleCount: current.people.size,
      averageHours: current.rowCount ? current.totalHours / current.rowCount : 0,
    };
  });

  const totalPeople = new Set<string>();
  let totalHours = 0;
  let totalRowCount = 0;

  for (const row of rowsOut) {
    const groupedRow = grouped.get(row.role);

    groupedRow?.people.forEach((person) => totalPeople.add(person));
    totalHours += groupedRow?.totalHours ?? 0;
    totalRowCount += groupedRow?.rowCount ?? 0;
  }

  rowsOut.push({
    role: "Total",
    peopleCount: totalPeople.size,
    averageHours: totalRowCount ? totalHours / totalRowCount : 0,
  });

  return rowsOut;
}

function buildCoberturasAttendance(rows: TurnosDashboardRow[]) {
  const statuses = ["Asistió", "No asistió", "Retardo"];

  return statuses.map((status) => {
    const bucket = {
      status,
      profesional: 0,
      voluntario: 0,
      sinClasificar: 0,
      total: 0,
    };

    for (const row of rows) {
      if (normalizeStatus(row.estatus) !== status) {
        continue;
      }

      const role = normalizeRole(row.tipo_puesto);

      if (role === "Profesional") {
        bucket.profesional += 1;
      } else if (role === "Voluntario") {
        bucket.voluntario += 1;
      } else {
        bucket.sinClasificar += 1;
      }

      bucket.total += 1;
    }

    return bucket;
  });
}

export function buildCoberturasSummary(model: DashboardDataModel, filters: DashboardFilterState): CoberturasSummary {
  const rows = filterTurnosRows(model, filters);
  const volunteerRows = rows.filter((row) => normalizeRole(row.tipo_puesto) === "Voluntario");
  const volunteerHours = volunteerRows.reduce((total, row) => total + parseDurationToHours(row.hrs_laboradas), 0);
  const volunteerPeople = new Set(
    volunteerRows.filter((row) => parseDurationToHours(row.hrs_laboradas) > 0).map((row) => row.nombre),
  );

  return {
    totalRows: rows.length,
    totalHours: rows.reduce((total, row) => total + parseDurationToHours(row.hrs_laboradas), 0),
    volunteerAverageHours: volunteerPeople.size ? volunteerHours / volunteerPeople.size : 0,
    monthlyHours: buildCoberturasMonthlyHours(rows, model),
    communityHours: buildCoberturasCommunityHours(rows),
    shiftByRole: buildCoberturasShiftByRole(rows),
    roleTable: buildCoberturasRoleTable(rows),
    attendance: buildCoberturasAttendance(rows),
  };
}
