// Bottom-tab "店" modal — at-a-glance summary of the player's shop.

import { h, modal, panel } from "./components.js";
import { state, repTier } from "../state.js";
import { ITEMS, CATEGORY_LABELS } from "../data/recipes.js";
import { MATERIALS, QUALITY_LABEL, QUALITY_LEVELS } from "../data/materials.js";
import {
  SHELF_TYPES_PER_SHELF,
  shelfTypesMax,
  shelfTypesUsed,
  maxShelvesAllowed,
} from "../systems/shopExpansion.js";
import { itemIconKind, iconChip } from "./iconKind.js";

export function openShopViewer() {
  const body = h("div", { class: "stack" });
  body.appendChild(renderOverview());
  body.appendChild(renderShelfPanel());
  body.appendChild(renderInventoryPanel());
  modal(body, { title: "店" });
}

function renderOverview() {
  const tier = repTier();
  const stars = "★".repeat(tier.stars) + "☆".repeat(4 - tier.stars);
  const totalItems = (state.inventory.items || []).reduce((s, it) => s + it.count, 0);
  const totalMats = sumMatCount();
  const tierMaxTypes = maxShelvesAllowed() * SHELF_TYPES_PER_SHELF;
  const grid = h("div", { class: "card-grid" },
    statCard("店ランク", `${tier.label}　${stars}`),
    statCard("所持金貨", `${state.gold.toLocaleString()} G`),
    statCard("棚の数", `${state.shopShelves} / ${maxShelvesAllowed()} 個`),
    statCard("陳列容量", `${shelfTypesUsed()} / ${tierMaxTypes} 種類`),
    statCard("店頭の在庫", `${shelfStockTotal()} 点`),
    statCard("倉庫アイテム", `${totalItems} 点（${(state.inventory.items || []).length} 種類）`),
    statCard("素材総数", `${totalMats} 点`, () => openMaterialList()),
    statCard("本日の売上", `${state.bookkeeping?.earnedToday?.toLocaleString() || 0} G`),
  );
  return panel("店の概要", grid, "❦");
}

function statCard(label, value, onClick) {
  const cls = onClick ? "parchment-card clickable" : "parchment-card";
  const card = h("div", { class: cls },
    h("div", { class: "muted", style: { fontSize: "0.85em" } }, label),
    h("strong", null, value),
    onClick ? h("div", { class: "muted", style: { fontSize: "0.75em", marginTop: "0.2rem" } }, "タップで一覧") : null,
  );
  if (onClick) {
    card.style.cursor = "pointer";
    card.addEventListener("click", onClick);
  }
  return card;
}

function openMaterialList() {
  const body = h("div", { class: "stack" });
  const entries = [];
  for (const [mid, mat] of Object.entries(MATERIALS)) {
    const inv = state.inventory.mats[mid];
    if (!inv) continue;
    const total = (inv.poor || 0) + (inv.norm || 0) + (inv.good || 0) + (inv.fine || 0);
    if (total === 0) continue;
    entries.push({ mat, inv, total });
  }
  entries.sort((a, b) => b.total - a.total);
  if (entries.length === 0) {
    body.appendChild(h("p", { class: "muted" }, "倉庫に素材はありません。"));
  } else {
    const grid = h("div", { class: "card-grid" });
    for (const { mat, inv, total } of entries) {
      grid.appendChild(h("div", { class: "parchment-card" },
        h("div", { class: "row between" },
          h("strong", null, mat.name),
          h("span", { class: "muted" }, `計 ${total}`),
        ),
        h("div", { class: "row", style: { flexWrap: "wrap", gap: "0.3rem" } },
          ...QUALITY_LEVELS
            .filter(q => (inv[q] || 0) > 0)
            .map(q => h("span", { class: "tag" }, `${QUALITY_LABEL[q]} ×${inv[q]}`)),
        ),
      ));
    }
    body.appendChild(grid);
  }
  modal(body, { title: "素材一覧" });
}

function renderShelfPanel() {
  const grid = h("div", { class: "card-grid" });
  if ((state.shelf || []).length === 0) {
    grid.appendChild(h("div", { class: "parchment-card empty" }, "棚は空です。"));
  }
  for (const s of state.shelf || []) {
    const item = ITEMS[s.itemId];
    if (!item) continue;
    grid.appendChild(h("div", { class: "parchment-card" },
      h("div", { class: "row between" },
        h("strong", null, iconChip(itemIconKind(item)), item.name, " ",
          h("span", { class: "tag" }, QUALITY_LABEL[s.quality])),
        h("span", null, `×${s.count}`),
      ),
      h("div", { class: "muted" },
        `${CATEGORY_LABELS[item.cat] || item.cat}　売値 ${s.askPrice} G`),
    ));
  }
  return panel(`店頭の棚（${shelfTypesUsed()} 種 / ${shelfTypesMax()} 種）`, grid, "✦");
}

function renderInventoryPanel() {
  const grid = h("div", { class: "card-grid" });
  if ((state.inventory.items || []).length === 0) {
    grid.appendChild(h("div", { class: "parchment-card empty" }, "倉庫は空です。"));
  }
  for (const it of state.inventory.items || []) {
    const item = ITEMS[it.itemId];
    if (!item) continue;
    grid.appendChild(h("div", { class: "parchment-card" },
      h("div", { class: "row between" },
        h("strong", null, iconChip(itemIconKind(item)), item.name, " ",
          h("span", { class: "tag" }, QUALITY_LABEL[it.quality])),
        h("span", null, `×${it.count}`),
      ),
      h("div", { class: "muted" }, CATEGORY_LABELS[item.cat] || item.cat),
    ));
  }
  return panel(`倉庫のアイテム（${(state.inventory.items || []).length} 種類）`, grid, "❖");
}

function shelfStockTotal() {
  return (state.shelf || []).reduce((s, x) => s + x.count, 0);
}

function sumMatCount() {
  let n = 0;
  for (const inv of Object.values(state.inventory.mats || {})) {
    n += (inv.poor || 0) + (inv.norm || 0) + (inv.good || 0) + (inv.fine || 0);
  }
  return n;
}
