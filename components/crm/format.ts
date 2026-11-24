const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const count = new Intl.NumberFormat("en-IN");

export const money = (value: unknown) => (value === undefined || value === "" || value === null ? "—" : inr.format(Number(value) || 0));
export const number = (value: unknown) => (value === undefined || value === "" || value === null ? "—" : count.format(Number(value) || 0));
export const percent = (value: number | null | undefined, digits = 0) => (value === null || value === undefined ? "—" : `${(value * 100).toFixed(digits)}%`);
export const date = (value: unknown) => {
  if (typeof value !== "string" || !value) return "—";
  const d = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};
export const dateTime = (value: unknown) => {
  if (typeof value !== "string" || !value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
};
