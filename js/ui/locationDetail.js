// Location detail modal — shows danger, gather table (materials),
// encounter table (monsters with drop tables) so the player can
// decide whether a location matches their goals.

import { h, modal, panel, dangerTag } from "./components.js";
import { LOCATIONS } from "../data/locations.js";
import { MONSTERS } from "../data/monsters.js";
import { MATERIALS } from "../data/materials.js";
import { CLASSES } from "../data/adventurers.js";

export function openLocationDetail(locId) {
  const loc = LOCATIONS[locId];
  if (!loc) return;

  const body = h("div", { class: "stack" });
  body.appendChild(h("div", { class: "row between" },
    h("h3", null, loc.name),
    dangerTag(loc.danger),
  ));
  body.appendChild(h("p", { class: "muted" }, loc.blurb));

  // Class affinities
  const aff = loc.classAffinity || {};
  const affEntries = Object.entries(aff);
  if (affEntries.length > 0) {
    const list = h("div", { class: "row", style: { flexWrap: "wrap", gap: "0.3rem" } });
    for (const [classId, mult] of affEntries) {
      const cls = CLASSES[classId];
      list.appendChild(h("span", { class: "tag gold" },
        `${cls?.label || classId} ×${mult.toFixed(2)}`));
    }
    body.appendChild(panel("相性のいい職業", list, "✦"));
  }

  // Encounter rate
  const encRate = Math.round((loc.encounterRate || 0) * 100);
  body.appendChild(h("p", { class: "muted" }, `エンカウント率：約 ${encRate}%`));

  // Gather table
  body.appendChild(panel("採取できるもの", renderGatherTable(loc), "❖"));

  // Encounter table
  body.appendChild(panel("出現する敵", renderEncounterTable(loc), "⚔"));

  modal(body, { title: "派遣先の詳細" });
}

function renderGatherTable(loc) {
  const list = (loc.gather || []);
  const totalW = list.reduce((s, e) => s + (e.w || 0), 0) || 1;
  const grid = h("div", { class: "card-grid" });
  if (list.length === 0) {
    grid.appendChild(h("div", { class: "parchment-card empty" }, "採取できるものはありません。"));
    return grid;
  }
  // Sort by chance descending
  const sorted = [...list].sort((a, b) => (b.w || 0) - (a.w || 0));
  for (const entry of sorted) {
    const mat = MATERIALS[entry.mat];
    if (!mat) continue;
    const pct = ((entry.w || 0) / totalW * 100).toFixed(1);
    const boost = entry.classBoost
      ? Object.entries(entry.classBoost).map(([cid, b]) =>
          `${CLASSES[cid]?.label || cid}+${b}`).join("、")
      : "";
    grid.appendChild(h("div", { class: "parchment-card" },
      h("div", { class: "row between" },
        h("strong", null, mat.name),
        h("span", { class: "tag" }, `${pct}%`),
      ),
      boost ? h("div", { class: "muted" }, `職業ボーナス：${boost}`) : null,
    ));
  }
  return grid;
}

function renderEncounterTable(loc) {
  const list = (loc.encounters || []);
  const totalW = list.reduce((s, e) => s + (e.w || 0), 0) || 1;
  const grid = h("div", { class: "card-grid" });
  if (list.length === 0) {
    grid.appendChild(h("div", { class: "parchment-card empty" }, "敵は出現しません。"));
    return grid;
  }
  const sorted = [...list].sort((a, b) => (b.w || 0) - (a.w || 0));
  for (const entry of sorted) {
    const mob = MONSTERS[entry.mob];
    if (!mob) continue;
    const pct = ((entry.w || 0) / totalW * 100).toFixed(1);
    const drops = (mob.drops || []).map(d => {
      const m = MATERIALS[d.mat];
      const dropPct = Math.round((d.p || 0) * 100);
      return `${m?.name || d.mat}（${dropPct}%）`;
    }).join("、") || "—";
    grid.appendChild(h("div", { class: "parchment-card" + (mob.boss ? " selected" : "") },
      h("div", { class: "row between" },
        h("strong", null, mob.name, mob.boss ? " ⚑ 主" : ""),
        h("span", { class: "tag" }, `${pct}%`),
      ),
      h("div", { class: "muted" },
        `HP ${mob.hp}　攻 ${mob.atk}　守 ${mob.def}　経験値 ${mob.exp}`),
      h("div", { class: "muted" }, `ドロップ：${drops}`),
    ));
  }
  return grid;
}
