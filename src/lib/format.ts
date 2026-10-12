export function formatWhen(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Karachi",
  }).format(new Date(iso));
}

export function ledgerNo(id: number) {
  return `DK-${String(id).padStart(4, "0")}`;
}
