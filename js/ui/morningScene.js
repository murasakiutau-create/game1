// Morning scene: party overview, dispatch wizard per adventurer, hire market.

import { h, clear, btn, panel, modal, toast, tabs, confirmModal } from "./components.js";
import { state, repTier, generateAdventurer, rng, syncRng,
         PARTY_MAX, newPartyId, partyForAdv, removeAdvFromParties } from "../state.js";
import { openReturnModal } from "./returnModal.js";
import { RANKS } from "../data/ranks.js";
import { CLASSES } from "../data/adventurers.js";
import { RANKS } from "../data/ranks.js";
import { LOCATIONS, LOCATION_ORDER } from "../data/locations.js";
import { EQUIPMENT, CAT_LABELS, slotKind, isEquipAllowed } from "../data/equipment.js";
import { SPELLS, spellsAllowedForClass, isSpellAllowed } from "../data/spells.js";
import { STRATEGY_PRESETS, STRATEGY_ORDER, TRIGGER_OPTIONS, ACTION_OPTIONS, SCHOOL_OPTIONS } from "../data/strategies.js";
import { ITEMS } from "../data/recipes.js";
import { advSummary, rankSeal } from "./advCard.js";
import { ELEMENTS, elementLabel } from "../data/elements.js";
import { PASSIVES, PASSIVE_ORDER, passivesAllowedForClass, passiveSlotsForRank } from "../data/passives.js";

// Tracks which day we already auto-opened the return modal for, so it
// only pops up once per new morning even if the scene re-renders.
let returnModalShownForDay = 0;

export function renderMorningScene(host, { onAdvance, refresh }) {
  clear(host);
  const phase = h("section", { class: "stack" });
  phase.appendChild(panel("朝　— 派遣の支度",
    h("p", { class: "muted" }, "パーティを編成して採取地へ送り出します。1パーティ最大5名、複数パーティを別々の場所に派遣できます。"),
  ));

  // Auto-show "returned from dispatch" modal once per new morning
  if ((state.dispatchResults || []).length > 0 && returnModalShownForDay !== state.day) {
    returnModalShownForDay = state.day;
    setTimeout(() => openReturnModal(refresh), 60);
  }
  // Re-open button while results are unviewed
  if ((state.dispatchResults || []).length > 0) {
    phase.appendChild(panel("帰還報告",
      h("div", { class: "stack" },
        h("p", { class: "muted" }, `${state.dispatchResults.length}組の派遣結果が届いています。`),
        btn("帰還報告を見る", () => openReturnModal(refresh), { primary: true, block: true }),
      ), "✦"));
  }

  // Pending parties panel
  const partiesBody = h("div", { class: "stack" });
  if (state.pendingDispatch.length === 0) {
    partiesBody.appendChild(h("p", { class: "muted" }, "編成中のパーティはありません。"));
  } else {
    for (const pt of state.pendingDispatch) {
      const loc = LOCATIONS[pt.locId];
      const memberCards = h("div", { class: "row", style: { flexWrap: "wrap", gap: "0.3em" } });
      for (const advId of (pt.advIds || [])) {
        const adv = state.party.find(a => a.id === advId);
        if (!adv) continue;
        memberCards.appendChild(h("span", { class: "tag gold" }, `${adv.name}（${CLASSES[adv.classId]?.label || ""}）`));
      }
      partiesBody.appendChild(h("div", { class: "parchment-card" },
        h("div", { class: "row between" },
          h("strong", null, `${loc?.name || "—"}　`,
            h("span", { class: "tag wax" }, `危険度 ${loc?.danger ?? "?"}`)),
          h("span", { class: "tag" }, `${(pt.advIds || []).length} / ${PARTY_MAX}名`),
        ),
        memberCards,
        h("div", { class: "row", style: { marginTop: "0.5rem", flexWrap: "wrap" } },
          btn("メンバー編集", () => openPartyEditor(pt, refresh), { small: true, primary: true }),
          btn("派遣先変更", () => openLocationPicker(pt, refresh), { small: true, dark: true }),
          btn("解散", () => {
            confirmModal({
              title: "パーティ解散",
              message: `${loc?.name} へのパーティを解散します。`,
              confirmLabel: "解散する",
              danger: true,
              onConfirm: () => {
                for (const advId of pt.advIds) {
                  const adv = state.party.find(a => a.id === advId);
                  if (adv) adv.busy = false;
                }
                state.pendingDispatch = state.pendingDispatch.filter(x => x.id !== pt.id);
                refresh();
              },
            });
          }, { small: true, ghost: true }),
        ),
      ));
    }
  }
  partiesBody.appendChild(btn("＋ 新しいパーティを編成", () => openPartyFormation(refresh),
    { primary: true, block: true }));
  phase.appendChild(panel(`派遣パーティ（${state.pendingDispatch.length}組）`, partiesBody, "✦"));

  // Party panel — roster overview
  const partyBody = h("div", { class: "card-grid" });
  if (state.party.length === 0) {
    partyBody.appendChild(h("div", { class: "parchment-card empty" }, "雇用市場から冒険者を雇いましょう。"));
  } else {
    for (const adv of state.party) {
      const pt = partyForAdv(adv.id);
      const card = h("div", { class: "parchment-card selectable" + (pt ? " selected" : "") + (adv.injured ? " disabled" : "") },
        advSummary(adv),
        h("div", { class: "muted", style: { marginTop: "0.4rem" } },
          pt ? `→ ${LOCATIONS[pt.locId]?.name || ""} へ派遣予定` :
          adv.injured ? "本日は休養（重傷）" : "未派遣"),
        h("div", { class: "row", style: { marginTop: "0.5rem", flexWrap: "wrap" } },
          btn("詳細", () => openAdventurerSheet(adv, refresh), { small: true, primary: true }),
          pt ? btn("パーティから外す", () => {
            removeAdvFromParties(adv.id);
            refresh();
          }, { small: true, ghost: true }) : null,
        ),
      );
      partyBody.appendChild(card);
    }
  }
  phase.appendChild(panel("手駒の冒険者", partyBody, "✦"));

  // Market
  const mktBody = h("div", null);
  if (state.market.length === 0) {
    mktBody.appendChild(h("p", { class: "muted" }, "本日の応募者はいません。"));
  } else {
    const grid = h("div", { class: "card-grid" });
    for (const cand of state.market) {
      const cls = CLASSES[cand.classId];
      const rank = RANKS[cand.rankId];
      const canAfford = state.gold >= rank.hireCost;
      grid.appendChild(h("div", { class: "parchment-card" + (canAfford ? "" : " disabled") },
        advSummary(cand),
        h("div", { class: "row between", style: { marginTop: "0.5rem" } },
          h("span", { class: "tag gold" }, `雇用金 ${rank.hireCost} G`),
          btn(canAfford ? "雇う" : "金貨不足", () => hireFromMarket(cand, refresh), { primary: canAfford, disabled: !canAfford, small: true }),
        ),
      ));
    }
    mktBody.appendChild(grid);
  }
  phase.appendChild(panel(`雇用市場  (${state.market.length}名)`, mktBody, "⚖"));

  // Advance button
  const totalDispatched = state.pendingDispatch.reduce((s, p) => s + (p.advIds?.length || 0), 0);
  let pendingWages = 0;
  for (const p of state.pendingDispatch) {
    for (const id of (p.advIds || [])) {
      const a = state.party.find(x => x.id === id);
      if (a) pendingWages += RANKS[a.rankId].dailyWage;
    }
  }
  const canAfford = state.gold >= pendingWages;
  phase.appendChild(panel("",
    h("div", { class: "stack" },
      h("p", { class: "muted" }, totalDispatched > 0
        ? `${state.pendingDispatch.length}組／計${totalDispatched}名を派遣準備中。送り出す際に派遣手当 ${pendingWages} G を支払います。冒険者は明朝に帰還します。`
        : "派遣しなくても店舗営業に進めます（素材は集まりません）。"),
      btn(totalDispatched > 0 ? `パーティを送り出す（手当 ${pendingWages} G） → 昼へ` : "そのまま昼へ", () => {
        if (totalDispatched > 0 && !canAfford) {
          toast("派遣手当を支払う金貨が足りません。", { error: true });
          return;
        }
        for (const p of state.pendingDispatch) {
          for (const advId of (p.advIds || [])) {
            const adv = state.party.find(a => a.id === advId);
            if (adv) adv.busy = true;
          }
        }
        onAdvance();
      }, { primary: true, block: true, disabled: totalDispatched > 0 && !canAfford }),
    ), "❦"));

  host.appendChild(phase);
}

function hireFromMarket(cand, refresh) {
  const rank = RANKS[cand.rankId];
  if (state.gold < rank.hireCost) { toast("金貨が足りません。", { error: true }); return; }
  state.gold -= rank.hireCost;
  state.party.push(cand);
  state.market = state.market.filter(c => c.id !== cand.id);
  state.equippedGear[cand.id] = { weapon: null, armor: null, trinket: null };
  state.equippedSpells[cand.id] = [];
  state.learnedSpells[cand.id] = [];
  state.strategies[cand.id] = { preset: "standard", custom: [] };
  state.passives[cand.id] = [];
  toast(`${cand.name}（ランク${cand.rankId}）を雇用しました。`);
  refresh();
}

// =================== Adventurer sheet (multi-tab modal) ===================

export function openAdventurerSheet(adv, refresh) {
  const cls = CLASSES[adv.classId];
  let tab = "gear";
  const body = h("div", { class: "stack" });

  function render() {
    body.innerHTML = "";
    body.appendChild(advSummary(adv));
    body.appendChild(tabs([
      { id: "gear",     label: "装備" },
      { id: "spells",   label: "魔法" },
      { id: "passives", label: "特性" },
      { id: "strategy", label: "戦略" },
      { id: "dispatch", label: "派遣" },
    ], tab, (id) => { tab = id; render(); }));
    body.appendChild(h("div", { class: "divider" }));
    if (tab === "gear") body.appendChild(renderGearTab(adv, render));
    else if (tab === "spells") body.appendChild(renderSpellsTab(adv, render));
    else if (tab === "passives") body.appendChild(renderPassivesTab(adv, render));
    else if (tab === "strategy") body.appendChild(renderStrategyTab(adv, render));
    else if (tab === "dispatch") body.appendChild(renderDispatchTab(adv, () => { m.close(); refresh(); }));
  }

  const m = modal(body, { title: `${adv.name} — 詳細`, onClose: refresh });
  render();
}

// ---- Gear ----

function renderGearTab(adv, rerender) {
  const cls = CLASSES[adv.classId];
  const gear = state.equippedGear[adv.id] || { weapon: null, armor: null, trinket: null };
  const wrap = h("div", { class: "stack" });
  for (const slot of ["weapon", "armor", "trinket"]) {
    const slotLabel = slot === "weapon" ? "武器" : slot === "armor" ? "防具" : "装身具";
    const equippedId = gear[slot];
    const eq = equippedId ? EQUIPMENT[equippedId] : null;
    wrap.appendChild(h("div", { class: "parchment-card" },
      h("div", { class: "row between" },
        h("strong", null, slotLabel),
        eq ? h("span", { class: "tag" }, CAT_LABELS[eq.cat]) : h("span", { class: "muted" }, "なし"),
      ),
      h("div", null, eq ? eq.name : h("span", { class: "muted" }, "（未装備）")),
      h("div", { class: "row", style: { marginTop: "0.5rem" } },
        btn("付け替え", () => openGearPicker(adv, slot, rerender), { small: true, ghost: true }),
        eq ? btn("外す", () => { gear[slot] = null; rerender(); }, { small: true, ghost: true }) : null,
      ),
    ));
  }
  wrap.appendChild(h("p", { class: "muted" }, `${cls.label}は ${cls.eqCats.map(c => CAT_LABELS[c]).join("／")} を扱える。`));
  return wrap;
}

function openGearPicker(adv, slot, parentRerender) {
  const cls = CLASSES[adv.classId];
  // Find inventory items that grant equipment matching this slot kind, that the class can use.
  // Equipment is consumed from inventory upon equip (first instance).
  // Slot kind constraint: weapon -> weapon:*, armor -> armor:*, trinket -> trinket
  const candidates = [];
  for (const it of state.inventory.items) {
    const item = ITEMS[it.itemId];
    if (!item || !item.grantsEquip) continue;
    const eq = EQUIPMENT[item.grantsEquip];
    if (!eq) continue;
    const kind = slotKind(eq.id);
    if (kind !== slot) continue;
    if (!isEquipAllowed(eq.id, cls)) continue;
    candidates.push({ inv: it, eq, item });
  }
  // Also any unused EQUIPMENT instance the player already has? We use inventory only.

  const list = h("div", { class: "stack" });
  if (candidates.length === 0) {
    list.appendChild(h("p", { class: "muted" }, "該当する装備が在庫にありません。"));
  }
  for (const c of candidates) {
    list.appendChild(h("div", { class: "parchment-card selectable" },
      h("div", { class: "row between" },
        h("strong", null, c.eq.name),
        h("span", { class: "tag" }, CAT_LABELS[c.eq.cat] + " ×" + c.inv.count),
      ),
      h("div", { class: "muted" },
        c.eq.atk ? `攻+${c.eq.atk} ` : "",
        c.eq.def ? `守+${c.eq.def} ` : "",
        c.eq.luk ? `運+${c.eq.luk} ` : "",
        c.eq.gather ? `採取補正 ` : "",
        c.eq.qty ? `数量補正 ` : "",
      ),
      h("div", { class: "row", style: { marginTop: "0.4rem" } },
        btn("装備する", () => {
          // remove from inventory, equip
          c.inv.count -= 1;
          if (c.inv.count <= 0) state.inventory.items = state.inventory.items.filter(x => x !== c.inv);
          // If something already equipped, return it to inventory as item
          const old = state.equippedGear[adv.id][slot];
          if (old) {
            // find item that grants this equipment
            const grantItem = Object.values(ITEMS).find(i => i.grantsEquip === old);
            if (grantItem) {
              const ex = state.inventory.items.find(it => it.itemId === grantItem.id && it.quality === "norm");
              if (ex) ex.count += 1;
              else state.inventory.items.push({ itemId: grantItem.id, quality: "norm", count: 1 });
            }
          }
          state.equippedGear[adv.id][slot] = c.eq.id;
          m.close();
          parentRerender();
        }, { primary: true, small: true })
      ),
    ));
  }
  const m = modal(list, { title: `装備を選ぶ（${slot === "weapon" ? "武器" : slot === "armor" ? "防具" : "装身具"}）` });
}

// ---- Spells ----

function renderSpellsTab(adv, rerender) {
  const cls = CLASSES[adv.classId];
  const learned = state.learnedSpells[adv.id] || [];
  const equipped = state.equippedSpells[adv.id] || [];
  const slotsLeft = adv.slots - equipped.length;

  const wrap = h("div", { class: "stack" });
  wrap.appendChild(h("p", { class: "muted" },
    `${cls.label}が扱える系統：${cls.spellSchools.join("／")}　│　スロット ${equipped.length}/${adv.slots}`
  ));

  // Equipped spells list
  const eqList = h("div", { class: "stack" });
  if (equipped.length === 0) {
    eqList.appendChild(h("div", { class: "parchment-card empty" }, "セット中の魔法はなし。"));
  }
  for (const sid of equipped) {
    const s = SPELLS[sid];
    if (!s) continue;
    eqList.appendChild(h("div", { class: "parchment-card" },
      h("div", { class: "row between" },
        h("strong", null, s.name),
        spellTagRow(s),
      ),
      h("div", { class: "muted" }, s.blurb),
      h("div", { class: "row", style: { marginTop: "0.4rem" } },
        btn("外す", () => {
          state.equippedSpells[adv.id] = equipped.filter(x => x !== sid);
          rerender();
        }, { small: true, ghost: true }),
      ),
    ));
  }
  wrap.appendChild(panel("セット中の魔法", eqList, "❖"));

  // Learned-but-unequipped spells
  const knownButOff = learned.filter(sid => !equipped.includes(sid));
  const knownList = h("div", { class: "stack" });
  if (knownButOff.length === 0) {
    knownList.appendChild(h("p", { class: "muted" }, "他に習得済みの魔法はありません。"));
  }
  for (const sid of knownButOff) {
    const s = SPELLS[sid];
    if (!s) continue;
    const allowed = isSpellAllowed(sid, cls);
    knownList.appendChild(h("div", { class: "parchment-card" + (allowed ? "" : " disabled") },
      h("div", { class: "row between" },
        h("strong", null, s.name),
        spellTagRow(s),
      ),
      h("div", { class: "muted" }, s.blurb),
      h("div", { class: "row", style: { marginTop: "0.4rem" } },
        btn(slotsLeft > 0 ? "セットする" : "スロット満杯", () => {
          if (!allowed) { toast(`${cls.label}は『${s.school}』を扱えません。`, { error: true }); return; }
          if (slotsLeft <= 0) { toast("スロットがいっぱいです。先に外してください。", { error: true }); return; }
          state.equippedSpells[adv.id] = [...equipped, sid];
          rerender();
        }, { small: true, primary: allowed && slotsLeft > 0, disabled: !allowed || slotsLeft <= 0 }),
      ),
    ));
  }
  wrap.appendChild(panel("習得済み", knownList, "❖"));

  // Tomes from inventory (consume to learn)
  const tomeOptions = [];
  for (const it of state.inventory.items) {
    const item = ITEMS[it.itemId];
    if (!item || !item.grantsSpell) continue;
    tomeOptions.push({ inv: it, item, spell: SPELLS[item.grantsSpell] });
  }
  const tomeList = h("div", { class: "stack" });
  if (tomeOptions.length === 0) {
    tomeList.appendChild(h("p", { class: "muted" }, "在庫の魔法書はありません。"));
  }
  for (const t of tomeOptions) {
    const allowed = t.spell && isSpellAllowed(t.spell.id, cls);
    const already = learned.includes(t.spell?.id);
    tomeList.appendChild(h("div", { class: "parchment-card" + (allowed && !already ? "" : " disabled") },
      h("div", { class: "row between" },
        h("strong", null, t.item.name, " ×", t.inv.count),
        t.spell ? spellTagRow(t.spell) : null,
      ),
      h("div", { class: "muted" }, t.spell?.blurb || "謎の頁。"),
      h("div", { class: "row", style: { marginTop: "0.4rem" } },
        btn(already ? "習得済み" : (allowed ? "頁を解読して習得" : "扱えない系統"), () => {
          if (already) return;
          if (!allowed) { toast(`${cls.label}は『${t.spell.school}』を扱えません。`, { error: true }); return; }
          // consume one tome, add to learnedSpells
          t.inv.count -= 1;
          if (t.inv.count <= 0) state.inventory.items = state.inventory.items.filter(x => x !== t.inv);
          state.learnedSpells[adv.id] = [...learned, t.spell.id];
          toast(`${adv.name}は『${t.spell.name}』を習得した。`);
          rerender();
        }, { small: true, primary: allowed && !already, disabled: !allowed || already }),
      ),
    ));
  }
  wrap.appendChild(panel("魔法書（在庫）", tomeList, "✦"));

  return wrap;
}

function spellTagRow(s) {
  const tags = [
    h("span", { class: "tag" }, s.school),
  ];
  if (s.element && s.element !== "none") {
    tags.push(h("span", { class: "tag", style: { color: ELEMENTS[s.element].color, borderColor: ELEMENTS[s.element].color } },
      ELEMENTS[s.element].glyph + " " + ELEMENTS[s.element].label));
  }
  return h("span", { class: "row" }, ...tags);
}

// ---- Passives ----

function renderPassivesTab(adv, rerender) {
  const cap = passiveSlotsForRank(adv.rankId);
  if (!state.passives[adv.id]) state.passives[adv.id] = [];
  const equipped = state.passives[adv.id];

  const wrap = h("div", { class: "stack" });
  wrap.appendChild(h("p", { class: "muted" },
    `ランク${adv.rankId}：パッシブ枠 ${equipped.length}/${cap}　── 雇用時のランクが上がるほど多く付けられます。`
  ));
  if (cap === 0) {
    wrap.appendChild(h("p", null, "Fランクは特性を装着できません。雇用市場でEランク以上の冒険者を探してみましょう。"));
    return wrap;
  }

  const candidates = passivesAllowedForClass(adv.classId);

  const grid = h("div", { class: "card-grid" });
  for (const p of candidates) {
    const isOn = equipped.includes(p.id);
    const slotsLeft = cap - equipped.length;
    grid.appendChild(h("div", { class: "parchment-card" + (isOn ? " selected" : (slotsLeft <= 0 ? " disabled" : "")) },
      h("div", { class: "row between" },
        h("strong", null, p.name),
        p.classLock ? h("span", { class: "tag gold" }, p.classLock + " 専用") : h("span", { class: "tag" }, "汎用"),
      ),
      h("p", { class: "muted" }, p.blurb),
      h("div", { class: "row" },
        btn(isOn ? "外す" : (slotsLeft > 0 ? "付ける" : "枠なし"),
          () => {
            if (isOn) {
              state.passives[adv.id] = equipped.filter(x => x !== p.id);
            } else if (slotsLeft > 0) {
              state.passives[adv.id] = [...equipped, p.id];
            } else {
              toast("特性枠がいっぱいです。", { error: true });
              return;
            }
            // recompute maxHp from passives
            recomputeAdvMaxHp(adv);
            rerender();
          },
          { small: true, primary: !isOn && slotsLeft > 0, ghost: isOn, disabled: !isOn && slotsLeft <= 0 }
        ),
      ),
    ));
  }
  wrap.appendChild(grid);
  return wrap;
}

function recomputeAdvMaxHp(adv) {
  const cls = CLASSES[adv.classId];
  const r = RANKS[adv.rankId];
  let baseMax = cls.base.hp + r.statBonus + adv.extra.hp;
  for (const pid of (state.passives[adv.id] || [])) {
    const p = PASSIVES[pid];
    if (p?.effect?.hpBonus) baseMax += p.effect.hpBonus;
  }
  const delta = baseMax - adv.maxHp;
  adv.maxHp = baseMax;
  if (delta > 0) adv.hp = Math.min(adv.maxHp, adv.hp + delta);
  if (adv.hp > adv.maxHp) adv.hp = adv.maxHp;
}

// ---- Strategy ----

function renderStrategyTab(adv, rerender) {
  const slot = state.strategies[adv.id] || (state.strategies[adv.id] = { preset: "standard", custom: [] });
  const wrap = h("div", { class: "stack" });
  wrap.appendChild(h("p", { class: "muted" }, "戦闘中の振る舞いを決めます。冒険者ごとに記憶されます。"));

  // Preset list
  const presetGrid = h("div", { class: "card-grid" });
  for (const id of STRATEGY_ORDER) {
    const p = STRATEGY_PRESETS[id];
    presetGrid.appendChild(h("div", { class: "parchment-card selectable" + (slot.preset === id ? " selected" : "") },
      h("strong", null, p.label),
      h("p", { class: "muted" }, p.blurb),
      h("div", { class: "row" },
        btn(slot.preset === id ? "選択中" : "選ぶ", () => {
          slot.preset = id;
          if (id !== "custom") slot.custom = slot.custom || [];
          rerender();
        }, { small: true, primary: slot.preset !== id, disabled: slot.preset === id }),
      ),
    ));
  }
  wrap.appendChild(presetGrid);

  if (slot.preset === "custom") {
    wrap.appendChild(panel("カスタム条件 (1〜3)", renderCustomEditor(adv, slot, rerender), "✦"));
  }

  return wrap;
}

function renderCustomEditor(adv, slot, rerender) {
  const cls = CLASSES[adv.classId];
  const wrap = h("div", { class: "stack" });
  if (!slot.custom) slot.custom = [];

  slot.custom.forEach((rule, i) => {
    wrap.appendChild(h("div", { class: "parchment-card" },
      h("div", { class: "row" },
        h("span", null, `${i+1}.`),
        triggerSelect(rule, () => rerender()),
        rule.trigger && TRIGGER_OPTIONS.find(t => t.id === rule.trigger)?.needsValue
          ? h("input", { type: "number", value: rule.value || 50, min: 1, max: 100, style: { width: "5em" }, onChange: (e) => { rule.value = +e.target.value; } })
          : null,
        h("span", null, "→"),
        actionSelect(rule, () => rerender()),
        rule.action === "castSchool" ? schoolSelect(rule, cls, () => rerender()) : null,
        btn("削除", () => { slot.custom.splice(i, 1); rerender(); }, { small: true, ghost: true }),
      ),
    ));
  });

  if (slot.custom.length < 3) {
    wrap.appendChild(btn("+ 条件を追加", () => {
      slot.custom.push({ trigger: "always", action: "attack" });
      rerender();
    }, { ghost: true, small: true }));
  }
  if (slot.custom.length === 0) {
    wrap.appendChild(h("p", { class: "muted" }, "条件未設定の場合、通常攻撃のみが行われます。"));
  }

  return wrap;
}

function triggerSelect(rule, onChange) {
  const sel = h("select", { onChange: (e) => { rule.trigger = e.target.value; const t = TRIGGER_OPTIONS.find(x => x.id === e.target.value); if (t?.needsValue) rule.value = t.defaultValue; onChange(); } });
  for (const t of TRIGGER_OPTIONS) {
    const opt = document.createElement("option");
    opt.value = t.id; opt.textContent = t.label;
    if (rule.trigger === t.id) opt.selected = true;
    sel.appendChild(opt);
  }
  return sel;
}
function actionSelect(rule, onChange) {
  const sel = h("select", { onChange: (e) => { rule.action = e.target.value; if (rule.action !== "castSchool") delete rule.school; onChange(); } });
  for (const a of ACTION_OPTIONS) {
    const opt = document.createElement("option");
    opt.value = a.id; opt.textContent = a.label;
    if (rule.action === a.id) opt.selected = true;
    sel.appendChild(opt);
  }
  return sel;
}
function schoolSelect(rule, cls, onChange) {
  const sel = h("select", { onChange: (e) => { rule.school = e.target.value; onChange(); } });
  for (const s of SCHOOL_OPTIONS) {
    if (cls && !cls.spellSchools.includes(s.id)) continue;
    const opt = document.createElement("option");
    opt.value = s.id; opt.textContent = s.label;
    if (rule.school === s.id) opt.selected = true;
    sel.appendChild(opt);
  }
  if (!rule.school && sel.options.length) rule.school = sel.options[0].value;
  return sel;
}

// ---- Dispatch tab (per-adv): join existing party, create solo, or leave ----

function renderDispatchTab(adv, onDispatched) {
  const wrap = h("div", { class: "stack" });
  if (adv.injured) {
    wrap.appendChild(h("p", null, "重傷のため本日は派遣できません。明日まで休養させてください。"));
    return wrap;
  }
  const current = partyForAdv(adv.id);
  if (current) {
    const loc = LOCATIONS[current.locId];
    wrap.appendChild(h("p", null, `現在 ${loc?.name || "—"} へのパーティに所属中（${current.advIds.length}/${PARTY_MAX}名）。`));
    wrap.appendChild(btn("パーティから外す", () => {
      removeAdvFromParties(adv.id);
      toast(`${adv.name}をパーティから外しました。`);
      onDispatched();
    }, { ghost: true }));
    return wrap;
  }
  // Existing parties (with capacity)
  const open = state.pendingDispatch.filter(p => (p.advIds?.length || 0) < PARTY_MAX);
  if (open.length > 0) {
    wrap.appendChild(h("h4", null, "既存のパーティに加わる"));
    for (const pt of open) {
      const loc = LOCATIONS[pt.locId];
      wrap.appendChild(h("div", { class: "parchment-card selectable" },
        h("div", { class: "row between" },
          h("strong", null, loc?.name || "—"),
          h("span", { class: "tag" }, `${pt.advIds.length}/${PARTY_MAX}名`),
        ),
        h("div", { class: "muted" }, pt.advIds.map(id => state.party.find(a => a.id === id)?.name).filter(Boolean).join("、")),
        h("div", { class: "row", style: { marginTop: "0.4rem" } },
          btn("このパーティに加わる", () => {
            pt.advIds.push(adv.id);
            adv.busy = true;
            toast(`${adv.name}が ${loc?.name} 行きパーティに加わりました。`);
            onDispatched();
          }, { primary: true, small: true }),
        ),
      ));
    }
    wrap.appendChild(h("div", { class: "divider" }));
  }
  // Create new solo party
  wrap.appendChild(h("h4", null, "新しく単独で出発する"));
  wrap.appendChild(h("p", { class: "muted" }, "送り出す採取地を選んでください。"));
  const grid = h("div", { class: "card-grid" });
  for (const lid of LOCATION_ORDER) {
    const loc = LOCATIONS[lid];
    grid.appendChild(h("div", { class: "parchment-card selectable" },
      h("h3", null, loc.name, " ", h("span", { class: "tag wax" }, "危険度 " + loc.danger)),
      h("p", { class: "muted" }, loc.blurb),
      h("div", { class: "row" },
        btn("ここへ派遣", () => {
          state.pendingDispatch.push({ id: newPartyId(), locId: lid, advIds: [adv.id] });
          adv.busy = true;
          toast(`${adv.name}を ${loc.name} へ送り出します。`);
          onDispatched();
        }, { primary: true, small: true }),
      ),
    ));
  }
  wrap.appendChild(grid);
  return wrap;
}

// ---- New party formation wizard ----

export function openPartyFormation(refresh) {
  let step = "loc";
  let chosenLoc = null;
  let chosenIds = new Set();
  const body = h("div", { class: "stack" });

  function rerender() {
    body.innerHTML = "";
    if (step === "loc") {
      body.appendChild(h("p", { class: "muted" }, "1. 派遣先を選んでください。"));
      const grid = h("div", { class: "card-grid" });
      for (const lid of LOCATION_ORDER) {
        const loc = LOCATIONS[lid];
        grid.appendChild(h("div", { class: "parchment-card selectable" },
          h("h3", null, loc.name, " ", h("span", { class: "tag wax" }, "危険度 " + loc.danger)),
          h("p", { class: "muted" }, loc.blurb),
          btn("ここに決める", () => { chosenLoc = lid; step = "members"; rerender(); }, { primary: true, small: true }),
        ));
      }
      body.appendChild(grid);
    } else if (step === "members") {
      const loc = LOCATIONS[chosenLoc];
      body.appendChild(h("p", { class: "muted" }, `2. ${loc.name} へ向かうメンバーを最大 ${PARTY_MAX} 名まで選んでください（${chosenIds.size}/${PARTY_MAX}）。`));
      const grid = h("div", { class: "card-grid" });
      for (const adv of state.party) {
        const inOther = !!partyForAdv(adv.id);
        const cant = adv.injured || inOther;
        const sel = chosenIds.has(adv.id);
        grid.appendChild(h("div", { class: "parchment-card selectable" + (sel ? " selected" : "") + (cant ? " disabled" : "") },
          advSummary(adv),
          h("div", { class: "muted", style: { marginTop: "0.3rem" } },
            adv.injured ? "重傷で参加不可" : inOther ? "別パーティに所属中" : sel ? "編成中" : "選択可"),
          h("div", { class: "row", style: { marginTop: "0.4rem" } },
            btn(sel ? "外す" : "加える", () => {
              if (cant) return;
              if (sel) chosenIds.delete(adv.id);
              else if (chosenIds.size < PARTY_MAX) chosenIds.add(adv.id);
              else toast(`パーティは最大 ${PARTY_MAX} 名までです。`, { error: true });
              rerender();
            }, { primary: !sel && !cant, ghost: sel || cant, small: true, disabled: cant }),
          ),
        ));
      }
      body.appendChild(grid);
      body.appendChild(h("div", { class: "row", style: { marginTop: "0.5rem", flexWrap: "wrap" } },
        btn("← 派遣先を選び直す", () => { step = "loc"; rerender(); }, { ghost: true, small: true }),
        btn(`このメンバーで結成（${chosenIds.size}名）`, () => {
          if (chosenIds.size === 0) { toast("最低1名は選んでください。", { error: true }); return; }
          const partyObj = { id: newPartyId(), locId: chosenLoc, advIds: [...chosenIds] };
          state.pendingDispatch.push(partyObj);
          for (const id of chosenIds) {
            const a = state.party.find(x => x.id === id);
            if (a) a.busy = true;
          }
          const loc = LOCATIONS[chosenLoc];
          toast(`${loc.name} 行きパーティを結成しました（${chosenIds.size}名）。`);
          m.close();
          refresh();
        }, { primary: chosenIds.size > 0, disabled: chosenIds.size === 0, small: true }),
      ));
    }
  }
  rerender();
  const m = modal(body, { title: "パーティを編成" });
}

// ---- Edit existing party (add/remove members) ----

function openPartyEditor(pt, refresh) {
  const body = h("div", { class: "stack" });
  function rerender() {
    body.innerHTML = "";
    const loc = LOCATIONS[pt.locId];
    body.appendChild(h("p", { class: "muted" },
      `${loc?.name || "—"} 行きパーティ：${pt.advIds.length}/${PARTY_MAX} 名`));
    const grid = h("div", { class: "card-grid" });
    for (const adv of state.party) {
      const inThis = pt.advIds.includes(adv.id);
      const inOther = !inThis && !!partyForAdv(adv.id);
      const cant = adv.injured || inOther;
      grid.appendChild(h("div", { class: "parchment-card selectable" + (inThis ? " selected" : "") + (cant ? " disabled" : "") },
        advSummary(adv),
        h("div", { class: "muted", style: { marginTop: "0.3rem" } },
          adv.injured ? "重傷" : inOther ? "別パーティに所属中" : inThis ? "在籍中" : "未配属"),
        h("div", { class: "row", style: { marginTop: "0.4rem" } },
          btn(inThis ? "外す" : "加える", () => {
            if (inThis) {
              pt.advIds = pt.advIds.filter(id => id !== adv.id);
              adv.busy = false;
            } else {
              if (cant) return;
              if (pt.advIds.length >= PARTY_MAX) { toast(`最大 ${PARTY_MAX} 名です。`, { error: true }); return; }
              pt.advIds.push(adv.id);
              adv.busy = true;
            }
            rerender();
          }, { primary: !inThis && !cant, ghost: inThis || cant, small: true, disabled: cant }),
        ),
      ));
    }
    body.appendChild(grid);
    body.appendChild(h("div", { class: "row", style: { marginTop: "0.5rem" } },
      btn("完了", () => {
        if (pt.advIds.length === 0) {
          state.pendingDispatch = state.pendingDispatch.filter(x => x.id !== pt.id);
        }
        m.close();
        refresh();
      }, { primary: true }),
    ));
  }
  rerender();
  const m = modal(body, { title: "メンバー編成", onClose: refresh });
}

// ---- Change a party's location ----

function openLocationPicker(pt, refresh) {
  const body = h("div", { class: "stack" });
  body.appendChild(h("p", { class: "muted" }, "新しい派遣先を選んでください。"));
  const grid = h("div", { class: "card-grid" });
  for (const lid of LOCATION_ORDER) {
    const loc = LOCATIONS[lid];
    const isCurrent = lid === pt.locId;
    grid.appendChild(h("div", { class: "parchment-card selectable" + (isCurrent ? " selected" : "") },
      h("h3", null, loc.name, " ", h("span", { class: "tag wax" }, "危険度 " + loc.danger)),
      h("p", { class: "muted" }, loc.blurb),
      btn(isCurrent ? "現在の派遣先" : "ここへ変更", () => {
        if (isCurrent) return;
        pt.locId = lid;
        toast(`派遣先を ${loc.name} に変更しました。`);
        m.close();
        refresh();
      }, { primary: !isCurrent, disabled: isCurrent, small: true }),
    ));
  }
  body.appendChild(grid);
  const m = modal(body, { title: "派遣先を変更" });
}
