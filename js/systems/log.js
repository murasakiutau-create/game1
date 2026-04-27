// Centralised log buffer. Logs are { day, phase, kind, advId?, summary, detail }.
// kinds: dispatch | encounter | sale | craft | research | hire | system
// Detail can be any structured payload (e.g., combat log lines).

import { state } from "../state.js";

const MAX_LOG_DAYS = 30;

export function pushLog(entry) {
  const e = {
    id: `${Date.now().toString(36)}_${Math.random().toString(36).slice(2,7)}`,
    day: state.day,
    phase: state.phase,
    ts: Date.now(),
    ...entry,
  };
  state.logs.unshift(e);
  // Trim by day window
  const cutoffDay = state.day - MAX_LOG_DAYS;
  state.logs = state.logs.filter(l => l.day >= cutoffDay);
  return e;
}

export function getLogs({ day = null, kinds = null, advId = null } = {}) {
  return state.logs.filter(l =>
    (day == null || l.day === day) &&
    (kinds == null || kinds.includes(l.kind)) &&
    (advId == null || l.advId === advId)
  );
}
