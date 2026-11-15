export const AggregateNames = {
  Report: "Report",
  Cleanup: "Cleanup",
} as const
export type AggregateNames = (typeof AggregateNames)[keyof typeof AggregateNames]
