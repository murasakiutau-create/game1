// Day scene: shop and craft tabs.

import { h, clear, btn, panel, tabs, modal, toast, spinner, confirmModal } from "./components.js";
import { state, totalMat, getMat, addItem, removeItem } from "../state.js";
import { RECIPES, ITEMS, CATEGORY_LABELS, priceForItem } from "../data/recipes.js";
import { MATERIALS, QUALITY_LABEL, QUALITY_LEVELS } from "../data/materials.js";
import { canCraft, craft, predictCraftQuality } from "../systems/crafting.js";
import { listOnShelf, unlistFromShelf } from "../systems/shop.js";
import { itemIconKind, iconChip } from "./iconKind.js";

let currentTab = "craft";
let craftFilterCraftableOnly = true;

export function renderDayScene(host, { onAdvance, refresh }) {
  clear(host);
  const wrap = h("section", { class: "stack" });

  wrap.appendChild(panel("昼　— 店舗営業＆調合",
    h("p", { class: "muted" }, "棚にアイテムを並べて昼の終わりに客が来ます。")
  ));

  wrap.appendChild(tabs([
    { id: "craft", label: "調合（クラフト）" },
    { id: "shop", label: "店頭・棚" },
    { id: "stock", label: "在庫" },
  ], currentTab, (id) => { currentTab = id; renderDayScene(host, { onAdvance, refresh }); }));

  if (currentTab === "craft") wrap.appendChild(renderCraftTab(refresh));
  else if (currentTab === "shop") wrap.appendChild(renderShopTab(refresh));
  else wrap.appendChild(renderStockTab());

  wrap.appendChild(panel("",
    h("div", { class: "stack" },
      h("p", { class: "muted" }, "客の購買は昼の終わりに自動でシミュレートされます。棚を整えてから「夕へ」を押してください。"),
      btn("店じまい → 夕へ", () => onAdvance(), { primary: true, block: true, sfx: "primary" })
    ), "❦"));

  host.appendChild(wrap);
}

function renderCraftTab(refresh) {
  const all = Object.values(RECIPES).filter(r => state.recipes[r.id]?.unlocked);
  // Sort: craftable first, then by output basePrice ascending so cheap
  // staples sit near the top of each group.
  const sorted = [...all].sort((a, b) => {
    const ac = canCraft(a.id) ? 0 : 1;
    const bc = canCraft(b.id) ? 0 : 1;
    if (ac !== bc) return ac - bc;
    return (ITEMS[a.out]?.basePrice || 0) - (ITEMS[b.out]?.basePrice || 0);
  });
  const recipes = craftFilterCraftableOnly ? sorted.filter(r => canCraft(r.id)) : sorted;

  const filterRow = h("div", { class: "row", style: { marginBottom: "0.5rem", flexWrap: "wrap", gap: "0.5rem" } },
    btn(craftFilterCraftableOnly ? "✓ 作れるものだけ" : "作れるものだけ", () => {
      craftFilterCraftableOnly = !craftFilterCraftableOnly;
      refresh();
    }, { small: true, primary: craftFilterCraftableOnly, ghost: !craftFilterCraftableOnly, sfx: "plain" }),
    h("span", { class: "muted" },
      craftFilterCraftableOnly
        ? `${recipes.length} / ${all.length} 件表示中`
        : `全 ${all.length} 件（うち調合可 ${all.filter(r => canCraft(r.id)).length} 件）`),
  );

  const grid = h("div", { class: "card-grid" });
  if (all.length === 0) {
    grid.appendChild(h("div", { class: "parchment-card empty" }, "解禁中のレシピがありません。"));
  } else if (recipes.length === 0) {
    grid.appendChild(h("div", { class: "parchment-card empty" },
      "今ある素材で作れるレシピはありません。フィルタを外すと全レシピを表示します。"));
  }
  for (const r of recipes) {
    const item = ITEMS[r.out];
    const ok = canCraft(r.id);
    const predicted = ok ? predictCraftQuality(r.id) : null;
    const predictedPrice = predicted ? priceForItem(item.id, predicted) : null;
    grid.appendChild(h("div", { class: "parchment-card" + (ok ? "" : " disabled") },
      h("div", { class: "row between" },
        h("strong", null, iconChip(itemIconKind(item)), item.name),
        h("span", { class: "tag" }, CATEGORY_LABELS[item.cat]),
      ),
      h("p", { class: "muted" }, item.blurb || ""),
      ok
        ? h("div", null,
            h("strong", { style: { color: "var(--wax-soft)" } },
              `予想品質：${QUALITY_LABEL[predicted]}　／　予想売値：${predictedPrice} G`),
            h("div", { class: "muted" },
              `相場 ${priceForItem(item.id, "poor")}〜${priceForItem(item.id, "fine")} G（品質次第）`))
        : h("div", { class: "muted" },
            `相場 ${priceForItem(item.id, "poor")}〜${priceForItem(item.id, "fine")} G（品質次第）`),
      h("div", { class: "muted" },
        h("div", null, "必要素材："),
        h("ul", null,
          ...r.inputs.map(i => h("li", null, `${MATERIALS[i.mat]?.name || i.mat} ×${i.n}`,
            h("span", { class: "muted" }, `（在庫 ${totalMat(i.mat)}）`),
          )),
        ),
      ),
      h("div", { class: "row" },
        btn("1個 調合", () => {
          const res = craft(r.id);
          if (!res.ok) toast(res.reason, { error: true });
          else toast(`${ITEMS[res.itemId].name}（${QUALITY_LABEL[res.quality]}）を調合した。`);
          refresh();
        }, { primary: ok, small: true, disabled: !ok }),
      ),
    ));
  }
  return panel(`調合可能なレシピ (${recipes.length}/${all.length})`,
    h("div", null, filterRow, grid), "✦");
}

function renderShopTab(refresh) {
  const wrap = h("div", { class: "stack" });

  // Inventory items that can be listed
  const sellableItems = state.inventory.items.filter(it => {
    const item = ITEMS[it.itemId];
    return item && item.cat !== "tome" || true; // allow all
  });
  // Tomes are also listable; we keep them.

  const stock = h("div", { class: "card-grid" });
  if (sellableItems.length === 0) stock.appendChild(h("div", { class: "parchment-card empty" }, "在庫にアイテムがありません。"));
  for (const it of sellableItems) {
    const item = ITEMS[it.itemId];
    if (!item) continue;
    const askDefault = priceForItem(it.itemId, it.quality);
    const priceInput = h("input", {
      type: "number", min: 1,
      value: String(askDefault),
      style: { width: "6em" },
      "aria-label": `${item.name} の売値`,
    });
    const readPrice = () => Math.max(1, parseInt(priceInput.value, 10) | 0);
    stock.appendChild(h("div", { class: "parchment-card" },
      h("div", { class: "row between" },
        h("strong", null, iconChip(itemIconKind(item)), item.name, " ", h("span", { class: "tag" }, QUALITY_LABEL[it.quality])),
        h("span", null, "在庫 " + it.count),
      ),
      h("div", { class: "row", style: { alignItems: "center", gap: "0.4rem", flexWrap: "wrap" } },
        h("label", null, "売値"),
        priceInput,
        h("span", { class: "muted" }, "G"),
        h("span", { class: "muted", style: { marginLeft: "0.4rem" } }, `相場 ${askDefault} G`),
      ),
      h("div", { class: "row" },
        btn("棚に並べる(1)", () => {
          listOnShelf(it.itemId, it.quality, 1, readPrice());
          removeItem(it.itemId, it.quality, 1);
          refresh();
        }, { primary: true, small: true }),
        it.count >= 5 ? btn("5個並べる", () => {
          const price = readPrice();
          listOnShelf(it.itemId, it.quality, 5, price);
          for (let i = 0; i < 5; i++) removeItem(it.itemId, it.quality, 1);
          refresh();
        }, { ghost: true, small: true }) : null,
      ),
    ));
  }
  wrap.appendChild(panel("在庫から並べる", stock, "✦"));

  // Shelf
  const shelf = h("div", { class: "card-grid" });
  if (state.shelf.length === 0) shelf.appendChild(h("div", { class: "parchment-card empty" }, "棚は空です。"));
  for (const s of state.shelf) {
    const item = ITEMS[s.itemId];
    if (!item) continue;
    const marketPrice = priceForItem(s.itemId, s.quality);
    shelf.appendChild(h("div", { class: "parchment-card" },
      h("div", { class: "row between" },
        h("strong", null, iconChip(itemIconKind(item)), item.name, " ", h("span", { class: "tag" }, QUALITY_LABEL[s.quality])),
        h("span", null, "棚 " + s.count),
      ),
      h("div", { class: "row", style: { alignItems: "center", gap: "0.4rem", flexWrap: "wrap" } },
        h("label", null, "売値"),
        priceField(s, refresh),
        h("span", { class: "muted" }, "G"),
        h("span", { class: "muted", style: { marginLeft: "0.4rem" } }, `相場 ${marketPrice} G`),
      ),
      h("div", { class: "row" },
        btn("1個下げる", () => { unlistFromShelf(s.itemId, s.quality, 1); addItem(s.itemId, s.quality, 1); refresh(); }, { ghost: true, small: true }),
      ),
    ));
  }
  wrap.appendChild(panel("店頭の棚", shelf, "✦"));

  return wrap;
}

function priceField(shelfEntry, refresh) {
  const inp = h("input", { type: "number", min: 1, value: shelfEntry.askPrice, style: { width: "7em" } });
  inp.addEventListener("change", () => {
    shelfEntry.askPrice = Math.max(1, parseInt(inp.value, 10) | 0);
    refresh();
  });
  return inp;
}

function renderStockTab() {
  // Materials and items overview
  const wrap = h("div", { class: "stack" });

  const matRows = [];
  for (const [mid, mat] of Object.entries(MATERIALS)) {
    const inv = state.inventory.mats[mid];
    if (!inv) continue;
    const total = (inv.poor + inv.norm + inv.good + inv.fine);
    if (total === 0) continue;
    matRows.push(h("div", { class: "parchment-card" },
      h("div", { class: "row between" },
        h("strong", null, mat.name),
        h("span", { class: "muted" }, "計 " + total),
      ),
      h("div", { class: "row" },
        ...QUALITY_LEVELS.filter(q => inv[q] > 0).map(q =>
          h("span", { class: "tag", style: { marginRight: "0.3em" } }, `${QUALITY_LABEL[q]} ×${inv[q]}`)),
      ),
    ));
  }
  if (matRows.length === 0) matRows.push(h("div", { class: "parchment-card empty" }, "素材なし。"));
  wrap.appendChild(panel("素材在庫", h("div", { class: "card-grid" }, ...matRows), "❖"));

  const itemRows = state.inventory.items.map(it => {
    const item = ITEMS[it.itemId];
    if (!item) return null;
    return h("div", { class: "parchment-card" },
      h("div", { class: "row between" },
        h("strong", null, iconChip(itemIconKind(item)), item.name, " ", h("span", { class: "tag" }, QUALITY_LABEL[it.quality])),
        h("span", null, "×" + it.count),
      ),
      h("div", { class: "muted" }, item.blurb || ""),
    );
  }).filter(Boolean);
  if (itemRows.length === 0) itemRows.push(h("div", { class: "parchment-card empty" }, "アイテム在庫なし。"));
  wrap.appendChild(panel("アイテム在庫", h("div", { class: "card-grid" }, ...itemRows), "❖"));

  return wrap;
}
