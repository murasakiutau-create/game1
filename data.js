// ============================================================
// data.js  — ゲームコアデータ定義
// ============================================================

// ── ゲーム状態 ──────────────────────────────────────────────
const G = {
  hp: 80, maxHp: 80,
  gold: 350,
  karma: 10,
  san: 80,
  luck: 50.0,
  art: 0,
  cleanliness: 50,
  toiletUrgency: 0,
  hunger: 100,
  turn: 0,
  housing: 'inn',          // 'homeless'|'inn'|'rental'|'apartment'|'own'|'built'
  clothes: { head: true, upper: true, lower: true, feet: true, hands: true },
  bag: { type: 'none', capacity: 0 },
  landRights: null,
  oilDrillDepth: 0,
  selectedTarget: 'self',

  // 仕事・ギルド
  jobStatus: null,         // null | { employer: id, role: 'part'|'staff', days: 0, salary: 0 }
  guildMember: false,
  guildRank: 0,            // 0〜5
  guildRep: 0,
  guildFee: 0,             // 累計支払い済み登録料

  // 借金・貸し付け
  debts: [],               // [{ lender, amount, due, overdue }]
  loans: [],               // [{ borrower, amount, due }]

  // 刑務所
  inPrison: false,
  prisonTurns: 0,
  criminalRecord: false,

  // 行商・店
  stall: null,             // null | { items: [], location, permit: bool }
  ownedLands: [],          // [lot.id, ...]

  // コロシアム
  colosseum: { wins: 0, losses: 0, bets: [] },

  // 賞金首
  bountyHunter: { kills: 0, threat: 0 },
  capturedBounties: [],    // 捕縛済み賞金首IDリスト
  bountyCount: 0,          // 賞金首捕縛数
  completedQuests: [],     // 完了済みNPC依頼IDリスト
  suspiciousTenant: false, // 怪しい入居者がいるか
  buildingQuality: null,   // 'poor'|'good'|null
  ownShop: false,          // 自分の店を持っているか

  // デモ
  demoFollowers: 0,
  demoOpponents: 0,

  // 呪い（殺人数による）
  murderCount: 0,

  // モンスター戦闘
  currentBattle: null,     // null | { monster, tamed: bool }
  tamedMonsters: [],
  familiars: [],           // 使い魔（魔法で使役したモンスター）
  pets: [],                // ペット（調教したモンスター）
  // ギルド
  guild: { member:false, rank:0, exp:0, questsDone:0 },

  // 新興宗教
  cult: null,              // null | { name, members:[], funds:0, rank:0, doctrine:'' }
  cultMembership: null,    // null | { orgName, rank:0, devotion:0 }

  // 手配・悪名
  wantedLevel: 0,          // 0～10（高いほど衛兵が動く）
  infamy: 0,               // 悪名度（建物爆破・犯行声明で上昇）
  timerBombs: [],          // [{ building, fuseAt }]
  jailTurns: 0,            // 禁固刑残りターン

  // 置屋・罠
  traps: [],               // [{ type, location, set:turn, triggered:bool }]
  // 科学・化学
  scienceLab: false,       // 研究室を持っているか
  clones: [],              // [{ sourceNpc, hp, loyalty }]
  humanTransmuteAttempts: 0,

  skills: {
    '戦闘':    { lv:1, exp:0 },
    '魔法':    { lv:1, exp:0 },
    '窃盗':    { lv:1, exp:0 },
    '交渉':    { lv:1, exp:0 },
    '演奏':    { lv:1, exp:0 },
    '料理':    { lv:1, exp:0 },
    '医術':    { lv:1, exp:0 },
    '信仰':    { lv:1, exp:0 },
    '採掘':    { lv:1, exp:0 },
    '建築':    { lv:1, exp:0 },
    '芸術':    { lv:1, exp:0 },
    '魅力':    { lv:1, exp:0 },
    '調教':    { lv:1, exp:0 },
    '行商':    { lv:1, exp:0 },
    '運動':    { lv:1, exp:0 },
    '弁舌':    { lv:1, exp:0 },
    '鍛冶':    { lv:1, exp:0 },
    '科学':    { lv:1, exp:0 },
    '化学':    { lv:1, exp:0 },
    '錬金術':  { lv:1, exp:0 },
  },
  inventory: [
    { id:'bread', qty:2 },
    { id:'potion', qty:1 },
    { id:'knife', qty:1 },
  ],
  // 罠在庫
  trapInventory: [],       // [{ type, qty }]
};

// ── NPC定義 ─────────────────────────────────────────────────
const NPCS = [
  {
    id: 'baker',
    name: 'パン屋のガルド',
    type: '商人 / 中立',
    hp: 30, maxHp: 30,
    attitude: 'neutral',
    statuses: [],
    goodwill: 0,
    desc: '太った中年男性。毎朝早起きしてパンを焼いている。',
    isOpen: true,
    dialogue: {
      greet: ['「いらっしゃい！今日も新鮮なパンが焼けてるよ！」','「何か買っていくかい？」','「今日は特売日だよ！」'],
      hostile: ['「な、何をするんだ！」','「衛兵を呼ぶぞ！」'],
      negotiate: ['「……まあ、常連さんなら少しだけ。」','「そんなに値切るなら、もう来なくていい。」'],
      preach: ['「神様より商売の神様を信じてるよ。」','「布教は他でやってくれ。」'],
      preach_convert: ['「……まあ、神に守られるなら悪くないか。」'],
      hire: ['「うちで働きたい？朝が早いけど、いいかい？」'],
    },
    shop: [
      { id:'bread', name:'パン', price:8, qty:10 },
      { id:'ale',   name:'エール酒', price:15, qty:5 },
    ],
    drops: ['bread'],
    karmaOnKill: -15,
    preachCount: 0,
    isBeliever: false,
    jobSlots: 1,
  },
  {
    id: 'guard',
    name: '衛兵のロック',
    type: '衛兵 / 中立',
    hp: 60, maxHp: 60,
    attitude: 'neutral',
    statuses: [],
    goodwill: 0,
    desc: '鎧を着た大柄な男。街の治安を守っている。',
    dialogue: {
      greet: ['「……何か用か。」','「怪しい動きをするなよ。」','「この辺りは俺が守っている。」'],
      hostile: ['「抵抗するな！」','「捕縛する！」'],
      negotiate: ['「……賄賂か。金額次第だな。」'],
      preach: ['「神の話か。勤務中だ。」'],
      preach_convert: ['「……まあ、神に守られた衛兵も悪くないか。」'],
      bounty: ['「手配書を持ってきたか。報酬を渡そう。」'],
    },
    drops: ['gold_coin'],
    karmaOnKill: -30,
    preachCount: 0,
    isBeliever: false,
  },
  {
    id: 'priest',
    name: '神官のシルヴィア',
    type: '神官 / 友好',
    hp: 25, maxHp: 25,
    attitude: 'friendly',
    statuses: [],
    goodwill: 50,
    desc: '白いローブを纏った女性神官。ヤヴィン神に仕えている。',
    dialogue: {
      greet: ['「ヤヴィン神のご加護を。」','「傷ついた魂を癒やすのが私の使命です。」'],
      hostile: ['「……あなたは道を踏み外した。」'],
      heal: ['「ヤヴィン神よ、この者に癒しを……」'],
      preach: ['「あなたも神の教えを説くのですか？崇めなことです」'],
      preach_convert: ['「……あなたの言葉には力がありますね。一緒に神を広めましょう」'],
    },
    drops: ['potion'],
    karmaOnKill: -30,
    preachCount: 0,
    isBeliever: false,
  },
  {
    id: 'thief',
    name: '怪しい男',
    type: '盗賊 / 敵対',
    hp: 35, maxHp: 35,
    attitude: 'hostile',
    statuses: [],
    goodwill: 0,
    desc: 'フードを深く被った男。目つきが鋭い。',
    dialogue: {
      greet: ['「……何の用だ。」','「近づくな。」'],
      hostile: ['「やるのか？望むところだ！」'],
      negotiate: ['「……面白い取引だな。乗ってやろう。」'],
      preach: ['「……死にたいのか？」'],
      preach_convert: ['「……まあ、神に頼ってみるか。どうせ失うものはないしな」'],
      fence: ['「盗品か？見せてみろ。」','「品質次第で値段が変わる。」'],
    },
    drops: ['knife', 'gold_coin'],
    karmaOnKill: 5,
    preachCount: 0,
    isBeliever: false,
    isFence: true,   // 盗品買取
    fenceGoodwill: 0,
  },
  {
    id: 'elder',
    name: '老人のマルコ',
    type: '村人 / 中立',
    hp: 15, maxHp: 15,
    attitude: 'neutral',
    statuses: [],
    goodwill: 0,
    desc: '白髪の老人。街の歴史に詳しいらしい。',
    dialogue: {
      greet: ['「ふむ、若い旅人か。」','「この街も昔はよかったのじゃが……」'],
      hostile: ['「わ、わしに何をする！」'],
      story: [
        '「昔この街には大きな神殿があってな……エーテルの嵐で崩れてしまったのじゃよ。」',
        '「北の森には古い祭壇がある。近づかん方がいい……いや、強い者なら宝があるかもしれんが。」',
      ],
      preach: ['「老い身にその話は耳が痛いのう」'],
      preach_convert: ['「……まあ、死ぬまでに一度くらい神に頼ってみるかのう」'],
    },
    drops: ['gold_coin'],
    karmaOnKill: -20,
    preachCount: 0,
    isBeliever: false,
  },
  {
    id: 'adventurer_shop',
    name: 'ガーナの冒険者店',
    type: '商人 / 中立',
    hp: 40, maxHp: 40,
    attitude: 'neutral',
    statuses: [],
    goodwill: 0,
    desc: '大柄な女性商人。冒険者向けの道具を売っている。',
    isOpen: true,
    dialogue: {
      greet: ['「何が要る？うちには何でもある。」','「冒険者なら装備はしっかりしろ。」'],
      hostile: ['「店で暴れるな！」'],
      negotiate: ['「……まあ、少しだけなら。」'],
      preach: ['「神様より商売の神様を信じてるよ。」'],
      preach_convert: ['「……まあ、神に守られるなら悪くないか。」'],
      hire: ['「うちで働きたい？悪くないね。でも今は人手が足りてる。」'],
    },
    shop: [
      { id:'potion',      name:'回復薬',       price:30,  qty:5 },
      { id:'rope',        name:'ロープ',       price:20,  qty:3 },
      { id:'torch',       name:'松明',         price:15,  qty:5 },
      { id:'bag',         name:'カバン',       price:80,  qty:2 },
      { id:'camera',      name:'カメラ',       price:200, qty:1 },
      { id:'microphone',  name:'マイク',       price:150, qty:1 },
      { id:'magic_bag',   name:'魔法のカバン', price:800, qty:1 },
      { id:'wet_sheet',   name:'ウェットシート', price:5, qty:10 },
      { id:'pickaxe',     name:'つるはし',     price:60,  qty:2 },
      { id:'fishing_rod', name:'釣り竿',       price:40,  qty:2 },
      { id:'seeds',       name:'種袋',         price:20,  qty:5 },
    ],
    drops: ['gold_coin', 'potion'],
    karmaOnKill: -20,
    preachCount: 0,
    isBeliever: false,
    jobSlots: 1,
  },
  {
    id: 'weapon_shop',
    name: 'ドワーフのドルグ',
    type: '武器商人 / 中立',
    hp: 55, maxHp: 55,
    attitude: 'neutral',
    statuses: [],
    goodwill: 0,
    desc: '小柄だが筋肉質なドワーフ。武器防具を専門に扱う。',
    isOpen: true,
    dialogue: {
      greet: ['「グルル……何が要る。」','「うちの武器は本物だ。」'],
      hostile: ['「戦いたいのか？望むところだ！」'],
      negotiate: ['「……仕方ない。少しだけ負けてやる。」'],
      preach: ['「神の話か？武器の方が頼りになる。」'],
      preach_convert: ['「……神に守られた武器か。悪くない考えだ。」'],
      hire: ['「鍛冶の腕があるなら話を聞こう。ないなら帰れ。」'],
    },
    shop: [
      { id:'knife',  name:'短剣',   price:50,  qty:3 },
      { id:'sword',  name:'剣',     price:200, qty:1 },
      { id:'armor',  name:'革鎧',   price:150, qty:2 },
      { id:'shield', name:'盾',     price:100, qty:2 },
      { id:'boots',  name:'革靴',   price:60,  qty:3 },
      { id:'gloves', name:'手袋',   price:40,  qty:3 },
      { id:'axe',    name:'斧',     price:180, qty:1 },
      { id:'bow',    name:'弓',     price:160, qty:1 },
    ],
    drops: ['knife'],
    karmaOnKill: -15,
    preachCount: 0,
    isBeliever: false,
    jobSlots: 1,
  },
  {
    id: 'medicine_shop',
    name: '薬屋のベルタ',
    type: '薬師 / 中立',
    hp: 20, maxHp: 20,
    attitude: 'neutral',
    statuses: [],
    goodwill: 0,
    desc: 'しわくちゃの老婆。薬草の知識は街一番らしい。',
    isOpen: true,
    dialogue: {
      greet: ['「何が要るかね？」','「薬草は新鮮なうちに使うんだよ。」'],
      hostile: ['「こんな老婆を攻めるとは！」'],
      negotiate: ['「……まあ、常連さんには少し安くしてあげよう。」'],
      preach: ['「神様より薬草の方が確かだよ。」'],
      preach_convert: ['「……そうかい。神様に守られながら薬を飲むのも悪くないね。」'],
      hire: ['「薬草の知識があるなら手伝ってもらえるかい？」'],
    },
    shop: [
      { id:'potion',      name:'回復薬',   price:25, qty:8 },
      { id:'antidote',    name:'解毒薬',   price:20, qty:4 },
      { id:'sleep_herb',  name:'眠り草',   price:30, qty:3 },
      { id:'bread',       name:'パン',     price:8,  qty:5 },
      { id:'wet_sheet',   name:'ウェットシート', price:5, qty:5 },
    ],
    drops: ['potion'],
    karmaOnKill: -25,
    preachCount: 0,
    isBeliever: false,
    jobSlots: 1,
  },
  {
    id: 'guild_master',
    name: 'ギルドマスターのヴェル',
    type: 'ギルド / 中立',
    hp: 70, maxHp: 70,
    attitude: 'neutral',
    statuses: [],
    goodwill: 0,
    desc: '白髪交じりの壮年男性。冒険者ギルドを取り仕切っている。',
    dialogue: {
      greet: ['「ギルドへようこそ。依頼はあるか？」','「ランクが上がれば、より良い依頼が来る。」'],
      hostile: ['「ギルドに刃を向けるとは……覚悟はできているな？」'],
      negotiate: ['「……特例として認めよう。」'],
      preach: ['「神の話は礼拝堂でやってくれ。」'],
      preach_convert: ['「……まあ、神の加護があれば依頼も成功しやすいか。」'],
      guild_join: ['「登録料は100G。年会費は50G。それでいいか？」'],
      guild_quest: ['「今ある依頼はこれだ。どれを受ける？」'],
    },
    drops: ['gold_coin'],
    karmaOnKill: -25,
    preachCount: 0,
    isBeliever: false,
  },
  {
    id: 'loan_shark',
    name: '金貸しのグリード',
    type: '金融業者 / 中立',
    hp: 45, maxHp: 45,
    attitude: 'neutral',
    statuses: [],
    goodwill: 0,
    desc: '油ぎった太った男。にこにこしているが目が笑っていない。',
    dialogue: {
      greet: ['「お金に困ってるかい？何でも貸すよ。」','「利子は……まあ、後で話し合おう。」'],
      hostile: ['「……後悔するぞ。」'],
      negotiate: ['「利子の交渉か。まあ、いいだろう。」'],
      preach: ['「神様より金の方が頼りになる。」'],
      preach_convert: ['「……神様に守られた金貸しか。面白い。」'],
      collect: ['「返済日だぞ。金を出せ。」','「逃げようとしても無駄だ。」'],
    },
    drops: ['gold_coin'],
    karmaOnKill: 3,
    preachCount: 0,
    isBeliever: false,
  },
  {
    id: 'colosseum_master',
    name: 'コロシアムの主催者',
    type: '興行師 / 中立',
    hp: 50, maxHp: 50,
    attitude: 'neutral',
    statuses: [],
    goodwill: 0,
    desc: '派手な衣装の男。コロシアムの試合を取り仕切っている。',
    dialogue: {
      greet: ['「コロシアムへようこそ！今日も熱い戦いが待っているぞ！」'],
      hostile: ['「ここで暴れるとは！」'],
      negotiate: ['「……特別参加か。面白い。」'],
      preach: ['「神より剣だ。ここでは強さが全て。」'],
      preach_convert: ['「……神に守られた戦士か。観客が喜ぶかもしれん。」'],
    },
    drops: ['gold_coin'],
    karmaOnKill: -10,
    preachCount: 0,
    isBeliever: false,
  },
];

// ── モンスター定義 ──────────────────────────────────────────
const MONSTERS = [
  {
    id: 'slime',
    name: 'スライム',
    hp: 15, maxHp: 15,
    atk: 3, def: 0,
    exp: 10, gold: 5,
    drops: [{ id:'slime_core', rate:0.7 }],
    tameable: true, tameReq: 1,
    desc: 'ぷよぷよした緑色の生き物。弱いが群れると厄介。',
    skills: [],
  },
  {
    id: 'goblin',
    name: 'ゴブリン',
    hp: 25, maxHp: 25,
    atk: 7, def: 2,
    exp: 20, gold: 12,
    drops: [{ id:'goblin_ear', rate:0.6 }, { id:'knife', rate:0.3 }],
    tameable: true, tameReq: 2,
    desc: '小柄な緑色の人型モンスター。知恵があり集団行動をとる。',
    skills: ['石投げ'],
  },
  {
    id: 'wolf',
    name: '野生の狼',
    hp: 35, maxHp: 35,
    atk: 12, def: 3,
    exp: 35, gold: 8,
    drops: [{ id:'wolf_pelt', rate:0.8 }, { id:'wolf_fang', rate:0.4 }],
    tameable: true, tameReq: 3,
    desc: '森に生息する大型の狼。牙は鋭く、素早い。',
    skills: ['噛みつき'],
  },
  {
    id: 'orc',
    name: 'オーク',
    hp: 60, maxHp: 60,
    atk: 18, def: 8,
    exp: 60, gold: 25,
    drops: [{ id:'orc_hide', rate:0.7 }, { id:'club', rate:0.2 }],
    tameable: true, tameReq: 5,
    desc: '大柄で筋肉質な人型モンスター。力は強いが鈍い。',
    skills: ['強打'],
  },
  {
    id: 'skeleton',
    name: 'スケルトン',
    hp: 30, maxHp: 30,
    atk: 10, def: 5,
    exp: 40, gold: 15,
    drops: [{ id:'bone', rate:0.9 }, { id:'rusty_sword', rate:0.2 }],
    tameable: false,
    desc: '動く骸骨。魔法で動かされており、炎に弱い。',
    skills: ['骨投げ'],
  },
  {
    id: 'giant_spider',
    name: '大蜘蛛',
    hp: 45, maxHp: 45,
    atk: 14, def: 4,
    exp: 50, gold: 18,
    drops: [{ id:'spider_silk', rate:0.8 }, { id:'venom_sac', rate:0.5 }],
    tameable: true, tameReq: 4,
    desc: '人の頭ほどの大きさの蜘蛛。毒を持つ。',
    skills: ['毒噛み', '糸を吐く'],
  },
  {
    id: 'troll',
    name: 'トロル',
    hp: 100, maxHp: 100,
    atk: 25, def: 12,
    exp: 120, gold: 50,
    drops: [{ id:'troll_hide', rate:0.6 }, { id:'troll_blood', rate:0.4 }],
    tameable: false,
    desc: '巨大な緑色の怪物。再生能力を持つ。',
    skills: ['叩きつけ', '再生'],
  },
  {
    id: 'bounty_target',
    name: '手配犯・ダガー',
    hp: 55, maxHp: 55,
    atk: 20, def: 6,
    exp: 80, gold: 0,
    drops: [{ id:'wanted_poster', rate:1.0 }],
    tameable: false,
    desc: '賞金首。捕縛すれば報酬がもらえる。',
    skills: ['二段斬り', '煙幕'],
    bounty: 200,
  },
];

// ── アイテム名テーブル ────────────────────────────────────────
const ITEM_NAMES = {
  bread:'パン', potion:'回復薬', knife:'短剣', gold_coin:'金貨',
  dead_rat:'ネズミの死体', ale:'エール酒', rope:'ロープ', torch:'松明',
  bag:'カバン', camera:'カメラ', microphone:'マイク', magic_bag:'魔法のカバン',
  rags:'ボロ布', sword:'剣', armor:'革鎧', shield:'盾', boots:'革靴',
  gloves:'手袋', antidote:'解毒薬', sleep_herb:'眠り草', bandage:'包帯',
  poison_potion:'毒薬', meal:'料理', photo_album:'写真集', trash:'ゴミ',
  lute:'古びたリュート', flower:'花', wet_sheet:'ウェットシート',
  slime_core:'スライムの核', goblin_ear:'ゴブリンの耳', wolf_pelt:'狼の毛皮',
  wolf_fang:'狼の牙', orc_hide:'オークの皮', club:'棍棒', bone:'骨',
  rusty_sword:'錆びた剣', spider_silk:'蜘蛛の糸', venom_sac:'毒嚢',
  troll_hide:'トロルの皮', troll_blood:'トロルの血', wanted_poster:'手配書',
  pickaxe:'つるはし', fishing_rod:'釣り竿', seeds:'種袋', axe:'斧', bow:'弓',
  stolen_goods:'盗品', trade_goods:'行商品', pamphlet:'ビラ',
  poison_herb:'毒草', lumber:'木材', stone:'石材',
  // 罠アイテム
  bear_trap:'熊罠', pitfall_kit:'落とし穴キット', wire_trap:'ワイヤー罠',
  alarm_trap:'警報罠', poison_trap:'毒針罠', sleep_trap:'眠り罠',
  // 科学・化学アイテム
  test_tube:'試験管', reagent:'試薬', catalyst:'触媒',
  explosive:'爆発物', acid:'強酸', smoke_bomb:'煙幕弾',
  truth_serum:'真実の血清', clone_pod:'クローンカプセル',
  philosopher_stone:'賢者の石', human_organ:'人体部位',
  // 宗教アイテム
  holy_text:'聖典', cult_robe:'教団の法衣', offering_box:'賽銭箱',
  idol:'御神体', cult_pamphlet:'布教パンフ',
};

// ── ギルド依頼テーブル ────────────────────────────────────────
const GUILD_QUESTS = [
  { id:'q1', title:'スライム退治', desc:'北の森でスライムを3匹倒せ', reward:80,  rankReq:0, target:'slime',  count:3 },
  { id:'q2', title:'ゴブリン討伐', desc:'ゴブリンを5匹倒せ',         reward:150, rankReq:1, target:'goblin', count:5 },
  { id:'q3', title:'荷物の護衛',   desc:'商人の荷物を市場まで護衛せよ', reward:120, rankReq:0, target:null, count:1, type:'escort' },
  { id:'q4', title:'薬草の採取',   desc:'薬草を10個採取せよ',         reward:100, rankReq:0, target:null, count:1, type:'gather' },
  { id:'q5', title:'狼の毛皮',     desc:'狼の毛皮を2枚持ってこい',    reward:200, rankReq:2, target:'wolf',   count:2 },
  { id:'q6', title:'賞金首の捕縛', desc:'手配犯ダガーを捕縛せよ',     reward:500, rankReq:3, target:'bounty_target', count:1 },
];

// ── 既存宗教団体 ─────────────────────────────────────────────
const EXISTING_CULTS = [
  { id:'yavine', name:'ヤヴィン教団', doctrine:'光と癒やしの神ヤヴィンを崇める', members:120, rank:3, joinFee:50, monthlyFee:20, benefits:['治療割引','衛兵との関係改善'] },
  { id:'darkone', name:'暗黒の使徒団', doctrine:'闇の力を崇め、力を追い求める', members:30, rank:1, joinFee:100, monthlyFee:0, benefits:['暗殺依頼','禁断の魔法'] },
  { id:'merchant', name:'商人ギルド神殿', doctrine:'商売の神マモンを崇める', members:80, rank:2, joinFee:200, monthlyFee:30, benefits:['取引値引き','情報売買'] },
];

// ── 罠種別 ────────────────────────────────────────────────────
const TRAP_TYPES = [
  { id:'bear_trap',    name:'熊罠',       cost:50,  sciReq:1, effect:'対象HP-30、移動不能', targetType:'npc' },
  { id:'pitfall_kit',  name:'落とし穴',   cost:80,  sciReq:2, effect:'対象HP-20、カルマ-5', targetType:'area' },
  { id:'wire_trap',    name:'ワイヤー罠', cost:30,  sciReq:1, effect:'対象移動不能3ターン', targetType:'npc' },
  { id:'alarm_trap',   name:'警報罠',     cost:20,  sciReq:1, effect:'侵入者を検知して通報', targetType:'area' },
  { id:'poison_trap',  name:'毒針罠',     cost:60,  sciReq:3, effect:'対象に毒状態付与', targetType:'npc' },
  { id:'sleep_trap',   name:'眠り罠',     cost:70,  sciReq:3, effect:'対象を眠り状態にする', targetType:'npc' },
];

// ── 地面状態 ─────────────────────────────────────────────────
const GROUND_STATE = {
  streetDug: false,
  flowerBedDug: false,
  flowerBedWatered: false,
  oilDepth: 0,
  oilFound: false,
  landOwner: 'public',
  landPermit: false,
  permitApplied: false,
  permitTurn: 0,
};
