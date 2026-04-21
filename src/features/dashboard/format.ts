const integerFormatter = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 0,
});

const decimalFormatter = new Intl.NumberFormat("es-MX", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const percentFormatter = new Intl.NumberFormat("es-MX", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

export function formatInteger(value: number) {
  return integerFormatter.format(value);
}

export function formatDecimal(value: number, maximumFractionDigits = 2) {
  return new Intl.NumberFormat("es-MX", {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  }).format(value);
}

export function formatHours(value: number) {
  return decimalFormatter.format(value);
}

export function formatPercent(value: number) {
  return `${percentFormatter.format(value)}%`;
}
