// Quest templates — one of these is rolled each morning into a concrete
// quest with `params` (target id, count, etc) and a `deadline` (current day +
// duration). Tier index determines which set is eligible.
//
// kind values:
//   "deliver"   — sell N items of (itemId | category) [+ minQuality]
//   "hunt"      — defeat N mobs of monsterId in dispatch
//   "gather"    — gather N units of materialId during dispatch
//   "specialty" — deliver one specific item at a specified quality
//                 (premium pay; the customer is willing to wait)

export const QUEST_TEMPLATES = [
  // ── newcomer-friendly (tier 0+)
  { id: "deliver_potions_3",  kind: "deliver", minTier: 0,
    title: () => "薬を3個納品",
    desc:  () => "村人に薬を売る。種類は問わない。",
    spec: { category: "potion", count: 3 },
    duration: 3, gold: 80, rep: 4 },
  { id: "hunt_goblin_3",      kind: "hunt", minTier: 0,
    title: () => "ゴブリンを3体討伐",
    desc:  () => "村への被害が増えている。退治を頼む。",
    spec: { mobId: "goblin", count: 3 },
    duration: 3, gold: 100, rep: 5 },
  { id: "gather_herb_8",      kind: "gather", minTier: 0,
    title: () => "薬草を8本採取",
    desc:  () => "薬師が在庫切れだという。森から集めてほしい。",
    spec: { matId: "herb", count: 8 },
    duration: 3, gold: 60, rep: 3 },
  { id: "deliver_basic_potion_2", kind: "deliver", minTier: 0,
    title: () => "薬草ポーションを2個納品",
    desc:  () => "町外れの宿屋からの注文。常備薬として置いておきたい。",
    spec: { itemId: "herb_potion", count: 2 },
    duration: 3, gold: 90, rep: 4 },
  { id: "hunt_forest_wolf_2", kind: "hunt", minTier: 0,
    title: () => "森狼を2頭討伐",
    desc:  () => "羊飼いから泣きつかれた。北の森の群れを減らしてくれ。",
    spec: { mobId: "forest_wolf", count: 2 },
    duration: 3, gold: 120, rep: 5 },
  { id: "gather_twig_10",     kind: "gather", minTier: 0,
    title: () => "枯れ枝を10本採取",
    desc:  () => "パン窯の薪が尽きかけている。乾いた枝を集めてほしい。",
    spec: { matId: "twig", count: 10 },
    duration: 3, gold: 50, rep: 3 },

  // ── mid (tier 1+)
  { id: "deliver_healing_2",  kind: "deliver", minTier: 1,
    title: () => "治癒の薬を2個納品",
    desc:  () => "冒険者ギルドが備蓄を求めている。",
    spec: { itemId: "healing_potion", count: 2 },
    duration: 3, gold: 200, rep: 8 },
  { id: "hunt_wraith_2",      kind: "hunt", minTier: 1,
    title: () => "亡霊を2体討伐",
    desc:  () => "遺跡で亡霊が騒がしい。鎮めてくれ。",
    spec: { mobId: "wraith", count: 2 },
    duration: 3, gold: 220, rep: 10 },
  { id: "gather_silver_5",    kind: "gather", minTier: 1,
    title: () => "銀鉱石を5個集める",
    desc:  () => "宝飾師の注文。質は問わない。",
    spec: { matId: "silver_ore", count: 5 },
    duration: 3, gold: 180, rep: 6 },

  // ── famed (tier 2+)
  { id: "specialty_greater_fine", kind: "specialty", minTier: 2,
    title: () => "上級治癒薬（極上）を1個",
    desc:  () => "貴族からの特注。極上品でなければ受け取らないという。",
    spec: { itemId: "greater_potion", count: 1, minQuality: "fine" },
    duration: 4, gold: 600, rep: 20 },
  { id: "hunt_dragon_kit_2",  kind: "hunt", minTier: 2,
    title: () => "幼飛竜を2体討伐",
    desc:  () => "雪山の幼飛竜の数が増えすぎている。",
    spec: { mobId: "wyvern_kit", count: 2 },
    duration: 4, gold: 480, rep: 18 },
  { id: "gather_moonleaf_4",  kind: "gather", minTier: 2,
    title: () => "月花の葉を4本採取",
    desc:  () => "月明かりの夜にしか採れぬという薬草。",
    spec: { matId: "moonleaf", count: 4 },
    duration: 4, gold: 360, rep: 14 },

  // ── legendary (tier 3+)
  { id: "specialty_legend_elixir", kind: "specialty", minTier: 3,
    title: () => "伝説のエリクサを1個",
    desc:  () => "瀕死の英雄を救う秘薬を求められた。",
    spec: { itemId: "legend_elixir", count: 1, minQuality: "good" },
    duration: 5, gold: 3000, rep: 60 },
  { id: "hunt_phantom_warden_1", kind: "hunt", minTier: 3,
    title: () => "塔の主を討伐",
    desc:  () => "幻影使いを倒し、塔の閉門を解く。",
    spec: { mobId: "phantom_warden", count: 1 },
    duration: 5, gold: 2200, rep: 50 },
  { id: "gather_dragon_scale_3", kind: "gather", minTier: 3,
    title: () => "古竜の鱗を3枚集める",
    desc:  () => "竜鱗鎧の打ち直し依頼。",
    spec: { matId: "dragon_scale", count: 3 },
    duration: 5, gold: 1500, rep: 40 },
];
