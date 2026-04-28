// ============================================================
// systems.js  — 拡張システム群
// ============================================================

// ── 日雇い労働 ───────────────────────────────────────────────
const JOBS = [
  {id:'porter',   name:'荷運び',   pay:25, skill:'戦闘',  exp:5,  failSan:-3},
  {id:'farm',     name:'農作業',   pay:20, skill:'料理',  exp:5,  failSan:-2},
  {id:'clean',    name:'清掃',     pay:15, skill:'建築',  exp:3,  failSan:-2},
  {id:'guard',    name:'護衛',     pay:40, skill:'戦闘',  exp:10, failSan:-5},
  {id:'delivery', name:'配達',     pay:22, skill:'交渉',  exp:4,  failSan:-2},
];

function openJobBoard() {
  const opts = JOBS.map(j=>({
    label:`${j.name}（${j.pay}G / 5ターン）`,
    fn:()=>doHireJob(j),
  }));
  openModal('日雇い求人板', '仕事を選んでください。', opts);
}

function doHireJob(job) {
  if(G.jobStatus){ addLog('すでに仕事をしている。','bad'); return; }
  addLog(`💼 ${job.name}の仕事を始めた。`,'result');
  advanceTurn(5);
  const lv = G.skills[job.skill]?.lv||1;
  if(pct(0.3+lv*0.07)){
    // 失敗
    addLog(`😓 ${job.name}の仕事で失敗した！上司に怒鳴られた。`,'bad');
    changeSan(job.failSan);
    G.gold += Math.floor(job.pay*0.5);
    addLog(`  → 半額の${Math.floor(job.pay*0.5)}Gしかもらえなかった。`,'bad');
  } else {
    G.gold += job.pay;
    addLog(`✅ ${job.name}の仕事を完了した。${job.pay}G入手。`,'good');
    gainSkillExp(job.skill, job.exp);
    // 継続雇用チェック
    if(pct(0.3)){
      G.jobStatus = {employer:job.name+'の雇用主', role:'part', days:0, salary:job.pay};
      addLog(`🎉 継続雇用のオファーが来た！バイトとして採用された。`,'level');
    }
  }
}

// ── ギルドシステム ────────────────────────────────────────
const GUILD_RANKS = ['見習い','銅','銀','金','白金','伝説'];

function openGuildMenu() {
  const g = G.guild;
  if(!g.member){
    openModal('冒険者ギルド',
      `ギルドに入会しますか？\n登録料: 100G\n入会すると依頼を受けられ、ランクに応じた特典が得られます。`,
      [
        {label:'入会する（100G）', fn:()=>{
          if(G.gold<100){ addLog('お金が足りない。','bad'); return; }
          G.gold-=100; g.member=true; g.rank=0; g.exp=0;
          addLog('🏛️ 冒険者ギルドに入会した！ランク: 見習い','level');
        }},
        {label:'やめる', fn:()=>{}},
      ]
    );
  } else {
    const rank=GUILD_RANKS[g.rank]||'見習い';
    const available=GUILD_QUESTS.filter(q=>q.rankReq<=g.rank);
    const opts=available.map(q=>({
      label:`${q.name}（報酬${q.reward}G）`,
      fn:()=>doGuildQuest(q),
    }));
    opts.push({label:'更新料を払う（50G/月）', fn:()=>{
      if(G.gold<50){ addLog('お金が足りない。','bad'); return; }
      G.gold-=50; addLog('ギルドの更新料50Gを払った。','info');
    }});
    openModal(`ギルド（ランク: ${rank} | EXP: ${g.exp}）`, '依頼を選んでください。', opts);
  }
}

function doGuildQuest(quest) {
  addLog(`📜 ギルド依頼「${quest.name}」を受けた。`,'result');
  advanceTurn(10);
  const lv=G.skills['戦闘'].lv;
  const successRate=0.5+lv*0.05-quest.danger;
  if(pct(Math.max(0.1,successRate))){
    const bonus=pct(0.2)?Math.floor(quest.reward*0.5):0;
    G.gold+=quest.reward+bonus;
    G.guild.exp+=quest.rankReq*10+20;
    addLog(`✅ 依頼「${quest.name}」を達成！${quest.reward+bonus}G入手。`,'good');
    if(bonus>0) addLog(`  → ボーナス+${bonus}G！`,'level');
    // ランクアップ
    const nextRankExp=(G.guild.rank+1)*100;
    if(G.guild.exp>=nextRankExp && G.guild.rank<GUILD_RANKS.length-1){
      G.guild.rank++;
      addLog(`🏆 ギルドランクが【${GUILD_RANKS[G.guild.rank]}】に上がった！`,'level');
      if(G.guild.rank>=2) addLog('  → 宿屋料金が割引になった。','info');
    }
    gainSkillExp('戦闘',15);
  } else {
    addLog(`❌ 依頼「${quest.name}」に失敗した。`,'bad');
    const dmg=rnd(20)+10;
    changeHp(-dmg);
    addLog(`  → ${dmg}ダメージを受けた。`,'bad');
  }
}

// ── 賭け事 ────────────────────────────────────────────────────
function openGambleMenu() {
  openModal('賭け場', '何で賭けますか？', [
    {label:'サイコロ賭博（10〜100G）', fn:()=>doDiceGamble()},
    {label:'カード賭博（20〜200G）',   fn:()=>doCardGamble()},
    {label:'闘鶏を観戦する',           fn:()=>doCockfight()},
  ]);
}

function doDiceGamble() {
  openModal('サイコロ賭博', '賭け金を選んでください。', [
    {label:'10G', fn:()=>resolveDice(10)},
    {label:'30G', fn:()=>resolveDice(30)},
    {label:'50G', fn:()=>resolveDice(50)},
    {label:'100G', fn:()=>resolveDice(100)},
  ]);
}
function resolveDice(bet) {
  if(G.gold<bet){ addLog('お金が足りない。','bad'); return; }
  G.gold-=bet;
  const player=rnd(6)+1+rnd(6)+1;
  const house=rnd(6)+1+rnd(6)+1;
  addLog(`🎲 サイコロ: あなた${player} vs 胴元${house}`,'result');
  if(player>house){
    G.gold+=bet*2; addLog(`  → 勝利！${bet*2}G入手。`,'good'); changeLuck(0.3);
  } else if(player===house){
    G.gold+=bet; addLog('  → 引き分け。賭け金が返ってきた。','dim');
  } else {
    addLog(`  → 負け。${bet}G失った。`,'bad'); changeLuck(-0.2);
  }
  gainSkillExp('交渉',3); advanceTurn(2);
}

function doCardGamble() {
  openModal('カード賭博', '賭け金を選んでください。', [
    {label:'20G', fn:()=>resolveCard(20)},
    {label:'50G', fn:()=>resolveCard(50)},
    {label:'100G', fn:()=>resolveCard(100)},
    {label:'200G', fn:()=>resolveCard(200)},
  ]);
}
function resolveCard(bet) {
  if(G.gold<bet){ addLog('お金が足りない。','bad'); return; }
  G.gold-=bet;
  const lv=G.skills['交渉'].lv;
  const winRate=0.45+lv*0.02+G.luck*0.002;
  if(pct(winRate)){
    G.gold+=bet*2; addLog(`🃏 カード勝負に勝った！${bet*2}G入手。`,'good'); changeLuck(0.5);
  } else {
    addLog(`🃏 カード勝負に負けた。${bet}G失った。`,'bad'); changeLuck(-0.3);
  }
  gainSkillExp('交渉',5); advanceTurn(3);
}

function doCockfight() {
  openModal('闘鶏', '鶏に賭けますか？', [
    {label:'赤鶏に50G賭ける', fn:()=>resolveCockfight('red',50)},
    {label:'青鶏に50G賭ける', fn:()=>resolveCockfight('blue',50)},
    {label:'見るだけ',         fn:()=>{ addLog('🐓 闘鶏を観戦した。','result'); advanceTurn(2); }},
  ]);
}
function resolveCockfight(pick_color, bet) {
  if(G.gold<bet){ addLog('お金が足りない。','bad'); return; }
  G.gold-=bet;
  const winner=pct(0.5)?'red':'blue';
  addLog(`🐓 闘鶏の結果: ${winner==='red'?'赤鶏':'青鶏'}が勝った！`,'result');
  if(winner===pick_color){
    G.gold+=bet*2; addLog(`  → 当たり！${bet*2}G入手。`,'good');
  } else {
    addLog(`  → 外れ。${bet}G失った。`,'bad');
  }
  advanceTurn(3);
}

// ── 金貸し・借金 ─────────────────────────────────────────────
function openLoanMenu() {
  openModal('金貸しグリード', `現在の借金: ${G.debts.reduce((a,d)=>a+d.amount,0)}G\n何をしますか？`, [
    {label:'50Gを借りる（利子20%）',  fn:()=>takeLoan(50)},
    {label:'100Gを借りる（利子20%）', fn:()=>takeLoan(100)},
    {label:'200Gを借りる（利子20%）', fn:()=>takeLoan(200)},
    {label:'返済する',                fn:()=>repayLoan()},
  ]);
}
function takeLoan(amount) {
  G.gold+=amount;
  const total=Math.floor(amount*1.2);
  G.debts.push({lender:'グリード', amount:total, overdue:false});
  addLog(`💸 ${amount}G借りた。返済額: ${total}G（100ターン以内）`,'warn');
  advanceTurn();
}
function repayLoan() {
  if(!G.debts.length){ addLog('借金はない。','dim'); return; }
  const d=G.debts[0];
  if(G.gold<d.amount){ addLog(`お金が足りない。（必要: ${d.amount}G）`,'bad'); return; }
  G.gold-=d.amount;
  G.debts.shift();
  addLog(`✅ ${d.lender}への借金${d.amount}Gを完済した。`,'good');
  changeKarma(3);
}

// ── 行商システム ──────────────────────────────────────────────
const TRADE_ITEMS = [
  {id:'bread',        buyAt:5,  sellAt:8},
  {id:'ale',          buyAt:8,  sellAt:12},
  {id:'potion',       buyAt:30, sellAt:45},
  {id:'flower',       buyAt:2,  sellAt:5},
  {id:'bone',         buyAt:3,  sellAt:6},
  {id:'slime_core',   buyAt:10, sellAt:18},
  {id:'torch',        buyAt:8,  sellAt:14},
  {id:'meal',         buyAt:12, sellAt:20},
];

function openTradeMenu() {
  const lv=G.skills['交渉'].lv;
  addLog('🛒 行商を始めた。安い場所で買い、高い場所で売ろう。','result');
  const opts=TRADE_ITEMS.map(t=>({
    label:`${itemName(t.id)} — 仕入${t.buyAt}G → 売値${t.sellAt}G`,
    fn:()=>doTradeBuy(t),
  }));
  openModal('行商（仕入れ）', '何を仕入れますか？', opts);
}

function doTradeBuy(item) {
  const qty=3;
  const cost=item.buyAt*qty;
  if(G.gold<cost){ addLog(`お金が足りない（${cost}G必要）。`,'bad'); return; }
  G.gold-=cost;
  addItem(item.id, qty);
  addLog(`🛒 ${itemName(item.id)}を${qty}個仕入れた。（${cost}G）`,'item');
  advanceTurn(5);
  // 別の場所で売る
  const lv=G.skills['交渉'].lv;
  const sellPrice=Math.floor(item.sellAt*(1+lv*0.05));
  const revenue=sellPrice*qty;
  G.gold+=revenue;
  for(let i=0;i<qty;i++) removeItem(item.id);
  addLog(`  → 別の場所で${revenue}G（${sellPrice}G×${qty}個）で売れた。利益: ${revenue-cost}G`,'good');
  gainSkillExp('交渉',8);
}

// ── 土地・不動産 ──────────────────────────────────────────────
const LAND_LOTS = [
  {id:'lot_a', name:'市場近くの土地', price:500,  income:30,  riskBad:0.1},
  {id:'lot_b', name:'郊外の土地',     price:300,  income:15,  riskBad:0.05},
  {id:'lot_c', name:'港近くの土地',   price:800,  income:50,  riskBad:0.15},
];

function openRealEstateMenu() {
  const owned=G.ownedLands.map(id=>LAND_LOTS.find(l=>l.id===id)).filter(Boolean);
  const available=LAND_LOTS.filter(l=>!G.ownedLands.includes(l.id));
  const opts=[
    ...available.map(l=>({
      label:`購入: ${l.name}（${l.price}G）`,
      fn:()=>buyLand(l),
    })),
    ...owned.map(l=>({
      label:`${l.name}を賃貸に出す（${l.income}G/月）`,
      fn:()=>rentOutLand(l),
    })),
    {label:'建物を建てる（建築スキル必要）', fn:()=>buildBuilding()},
    {label:'店を開く（土地が必要）', fn:()=>openShopOnLand()},
  ];
  openModal('不動産', `所有地: ${owned.map(l=>l.name).join(', ')||'なし'}`, opts);
}

function buyLand(lot) {
  if(G.gold<lot.price){ addLog(`お金が足りない（${lot.price}G必要）。`,'bad'); return; }
  G.gold-=lot.price;
  G.ownedLands.push(lot.id);
  addLog(`🏗️ ${lot.name}を${lot.price}Gで購入した。`,'good');
  GROUND_STATE.landOwner='self'; GROUND_STATE.landPermit=true;
}

function rentOutLand(lot) {
  addLog(`🏠 ${lot.name}を賃貸に出した。毎月${lot.income}G入る予定。`,'good');
  // 入居者の質チェック
  if(pct(lot.riskBad)){
    addLog('⚠️ 怪しい入居者が入った。将来的に問題が起きるかもしれない。','warn');
    G.suspiciousTenant=true;
  }
}

function buildBuilding() {
  const lv=G.skills['建築'].lv;
  if(!G.ownedLands.length){ addLog('土地を持っていない。','bad'); return; }
  if(lv<3){ addLog('建築スキルが足りない（Lv.3必要）。','bad'); return; }
  const cost=200;
  if(G.gold<cost){ addLog(`材料費が足りない（${cost}G必要）。`,'bad'); return; }
  G.gold-=cost;
  addLog(`🏗️ 建物を建てた。（材料費${cost}G）`,'good');
  if(lv<5){
    const defects=['壁が薄い','床が脆い','雨漏りがする'];
    addLog(`⚠️ 建築スキルが低いため: ${pick(defects)}。修繕費がかかるかも。`,'warn');
    G.buildingQuality='poor';
  } else {
    G.buildingQuality='good';
    addLog('  → 頑丈な建物が完成した。','level');
  }
  G.housing='built';
  gainSkillExp('建築',20);
}

function openShopOnLand() {
  if(!G.ownedLands.length){ addLog('土地を持っていない。','bad'); return; }
  addLog('🏪 土地に店を開いた。毎月収益が入る予定。','good');
  G.ownShop=true;
}

// ── コロシアム ────────────────────────────────────────────────
const COLOSSEUM_OPPONENTS = [
  {name:'新人ファイター',  hp:30,  maxHp:30,  atk:5,  reward:50,  rankReq:0},
  {name:'熟練の剣士',      hp:60,  maxHp:60,  atk:10, reward:100, rankReq:1},
  {name:'鎧の戦士',        hp:100, maxHp:100, atk:15, reward:200, rankReq:2},
  {name:'チャンピオン',    hp:150, maxHp:150, atk:20, reward:500, rankReq:3},
  {name:'伝説の剣聖',      hp:250, maxHp:250, atk:30, reward:1000,rankReq:4},
];

function openColosseumMenu() {
  const available=COLOSSEUM_OPPONENTS.filter(o=>o.rankReq<=(G.colosseumRank||0));
  const opts=available.map(o=>({
    label:`${o.name}（報酬${o.reward}G）`,
    fn:()=>doColosseumFight(o),
  }));
  opts.push({label:'観客として観戦する（5G）', fn:()=>{
    if(G.gold<5){ addLog('お金が足りない。','bad'); return; }
    G.gold-=5; addLog('🏟️ コロシアムを観戦した。','result'); advanceTurn(3);
  }});
  openModal('コロシアム', `あなたのランク: ${G.colosseumRank||0}`, opts);
}

function doColosseumFight(opponent) {
  addLog(`⚔️ コロシアムで${opponent.name}と戦う！`,'combat');
  let playerHp=G.hp, enemyHp=opponent.hp;
  let rounds=0;
  while(playerHp>0 && enemyHp>0 && rounds<20){
    const lv=G.skills['戦闘'].lv;
    const pdmg=lv*3+rnd(8)+5;
    const edm=opponent.atk+rnd(5);
    enemyHp-=pdmg; playerHp-=edm;
    rounds++;
  }
  if(playerHp>0){
    G.hp=Math.max(1,playerHp);
    G.gold+=opponent.reward;
    G.colosseumRank=(G.colosseumRank||0)+1;
    addLog(`🏆 ${opponent.name}を倒した！${opponent.reward}G獲得！`,'level');
    gainSkillExp('戦闘',20);
  } else {
    G.hp=Math.max(1,Math.floor(G.maxHp*0.1));
    addLog(`💀 ${opponent.name}に敗れた……瀕死で運ばれた。`,'bad');
    changeSan(-10);
  }
  updateUI(); advanceTurn(5);
}

// ── 賞金首システム ────────────────────────────────────────────
const BOUNTY_TARGETS = [
  {id:'b1', name:'スリのダガー',   reward:200, hp:40,  maxHp:40,  atk:12, danger:0.3, warningAt:2},
  {id:'b2', name:'強盗のブルート', reward:400, hp:80,  maxHp:80,  atk:20, danger:0.5, warningAt:3},
  {id:'b3', name:'殺し屋のシャド', reward:800, hp:120, maxHp:120, atk:30, danger:0.7, warningAt:4},
];

function openBountyMenu() {
  const opts=BOUNTY_TARGETS.filter(t=>!G.capturedBounties.includes(t.id)).map(t=>({
    label:`${t.name}（報酬${t.reward}G）`,
    fn:()=>doBountyHunt(t),
  }));
  if(!opts.length){ openModal('賞金首', '現在、賞金首はいない。', [{label:'閉じる',fn:()=>{}}]); return; }
  openModal('賞金首一覧', '誰を追いますか？', opts);
}

function doBountyHunt(target) {
  addLog(`🎯 賞金首「${target.name}」を追った。`,'result');
  advanceTurn(8);
  const lv=G.skills['戦闘'].lv;
  if(pct(0.3+lv*0.05-target.danger)){
    G.gold+=target.reward;
    G.capturedBounties.push(target.id);
    addLog(`✅ 賞金首「${target.name}」を捕縛した！${target.reward}G獲得！`,'level');
    gainSkillExp('戦闘',20);
    // 報復リスク
    G.bountyCount=(G.bountyCount||0)+1;
    if(G.bountyCount>=target.warningAt){
      addLog('⚠️ 犯罪者達から警戒されている。いつ襲撃されてもおかしくない。','warn');
      if(pct(0.3)){
        const dmg=rnd(30)+20;
        changeHp(-dmg);
        addLog(`🗡️ 犯罪者の仲間に襲撃された！${dmg}ダメージ。`,'bad');
        changeLuck(-1);
      }
    }
  } else {
    const dmg=rnd(20)+10;
    changeHp(-dmg);
    addLog(`❌ 賞金首「${target.name}」を取り逃がした。${dmg}ダメージ。`,'bad');
  }
}

// ── NPC依頼システム ───────────────────────────────────────────
const NPC_QUESTS = [
  {id:'nq1', name:'パンを届けてほしい', reward:30,  penalty:0,   turns:3,  success:0.9},
  {id:'nq2', name:'護衛を頼みたい',     reward:80,  penalty:0,   turns:8,  success:0.7},
  {id:'nq3', name:'薬草を集めてほしい', reward:50,  penalty:0,   turns:5,  success:0.8},
  {id:'nq4', name:'借金の取り立て',     reward:100, penalty:-20, turns:10, success:0.6},
  {id:'nq5', name:'秘密の手紙を届ける', reward:60,  penalty:-10, turns:6,  success:0.75},
];

function openNpcQuestMenu(npc) {
  const available=NPC_QUESTS.filter(q=>!G.completedQuests.includes(q.id));
  if(!available.length){ addLog(`${npc.name}には今、依頼がない。`,'dim'); return; }
  const q=pick(available);
  openModal(`${npc.name}からの依頼`,
    `「${q.name}」\n報酬: ${q.reward}G\n仲介なし（踏み倒しリスクあり）`,
    [
      {label:'引き受ける', fn:()=>doNpcQuest(npc,q)},
      {label:'断る', fn:()=>{ addLog('依頼を断った。','dim'); }},
    ]
  );
}

function doNpcQuest(npc, quest) {
  addLog(`📜 ${npc.name}から「${quest.name}」を引き受けた。`,'result');
  advanceTurn(quest.turns);
  if(pct(quest.success)){
    // 踏み倒しチェック
    if(pct(0.15)){
      addLog(`😡 ${npc.name}に報酬を踏み倒された！`,'bad');
      changeKarma(-2); changeSan(-5);
    } else {
      G.gold+=quest.reward;
      G.completedQuests.push(quest.id);
      addLog(`✅ 依頼「${quest.name}」を完了！${quest.reward}G入手。`,'good');
      changeGoodwill(npc,15);
    }
  } else {
    addLog(`❌ 依頼「${quest.name}」に失敗した。`,'bad');
    if(quest.penalty<0){ changeKarma(quest.penalty); }
  }
}


let G_BATTLE = null; // 現在の戦闘状態

function openForestMenu() {
  openModal('北の森', '何をしますか？', [
    {label:'モンスターを探す',       fn:()=>startRandomBattle()},
    {label:'特定のモンスターを探す', fn:()=>openMonsterHuntMenu()},
    {label:'採取する',               fn:()=>doForestGather()},
    {label:'野営する',               fn:()=>doForestCamp()},
    {label:'罠を仕掛ける',           fn:()=>doSetTrap()},
  ]);
}

function startRandomBattle() {
  const weights=[0.3,0.25,0.2,0.1,0.05,0.02,0.08,0.1];
  let r=Math.random(),cum=0,monster=MONSTERS[0];
  for(let i=0;i<MONSTERS.length;i++){ cum+=weights[i]; if(r<cum){monster=MONSTERS[i];break;} }
  startBattle({...monster, hp:monster.maxHp});
}

function openMonsterHuntMenu() {
  openModal('モンスター探索', 'どのモンスターを探しますか？',
    MONSTERS.map(m=>({label:m.name, fn:()=>startBattle({...m, hp:m.maxHp})}))
  );
}

function startBattle(monster) {
  G_BATTLE = {monster, playerTurn:true};
  addLog(`⚔️ ${monster.name}が現れた！（HP: ${monster.hp}/${monster.maxHp}）`,'combat');
  renderBattleCommands(monster);
}

function renderBattleCommands(monster) {
  const lv=G.skills['戦闘'].lv;
  const magicLv=G.skills['魔法'].lv;
  const charmLv=G.skills['魅力'].lv;
  const tameLv=G.skills['調教'].lv;
  const cmds=[
    {label:'素手で攻撃',     color:'combat', fn:()=>doBattleAttack(monster,'素手',5)},
    {label:'短剣で攻撃',     color:'combat', fn:()=>doBattleAttack(monster,'短剣',12), req:()=>hasItem('dagger')},
    {label:'剣で攻撃',       color:'combat', fn:()=>doBattleAttack(monster,'剣',20),   req:()=>hasItem('sword')},
    {label:'斧で攻撃',       color:'combat', fn:()=>doBattleAttack(monster,'斧',18),   req:()=>hasItem('axe')},
    {label:'弓で攻撃',       color:'combat', fn:()=>doBattleAttack(monster,'弓',15),   req:()=>hasItem('bow')},
    {label:'炎魔法',         color:'magic',  fn:()=>doBattleMagic(monster,'fire'),     req:()=>magicLv>=2},
    {label:'氷魔法',         color:'magic',  fn:()=>doBattleMagic(monster,'ice'),      req:()=>magicLv>=3},
    {label:'雷魔法',         color:'magic',  fn:()=>doBattleMagic(monster,'thunder'),  req:()=>magicLv>=4},
    {label:'回復魔法',       color:'good',   fn:()=>doBattleHeal(),                    req:()=>magicLv>=2},
    {label:'回復薬を使う',   color:'item',   fn:()=>doBattlePotion(),                  req:()=>hasItem('potion')},
    {label:'毒を盛る',       color:'crime',  fn:()=>doBattlePoison(monster),           req:()=>hasItem('poison_potion')},
    {label:'魅了魔法',       color:'magic',  fn:()=>doBattleCharm(monster),            req:()=>charmLv>=3 && monster.hp<=monster.maxHp*0.5},
    {label:'調教する',       color:'skill',  fn:()=>doBattleTame(monster),             req:()=>tameLv>=monster.tameSkill && monster.hp<=monster.maxHp*0.3 && monster.tameable},
    {label:'交渉する',       color:'dim',    fn:()=>doBattleNegotiate(monster)},
    {label:'脅す',           color:'crime',  fn:()=>doBattleThreaten(monster)},
    {label:'逃げる',         color:'dim',    fn:()=>doBattleFlee(monster)},
    {label:'捕縛する',       color:'good',   fn:()=>doBattleCapture(monster),          req:()=>hasItem('rope') && monster.hp<=monster.maxHp*0.3},
    {label:'観察する',       color:'dim',    fn:()=>doBattleObserve(monster)},
    {label:'挑発する',       color:'combat', fn:()=>doBattleProvoke(monster)},
    {label:'防御する',       color:'dim',    fn:()=>doBattleDefend()},
  ];
  renderCommandArea(cmds, `⚔️ 戦闘中: ${monster.name} HP ${monster.hp}/${monster.maxHp}`);
}

function doBattleAttack(monster, weapon, baseDmg) {
  if(weapon!=='素手' && !hasItem(weapon==='短剣'?'dagger':weapon==='剣'?'sword':weapon==='斧'?'axe':'bow')){
    addLog(`${weapon}を持っていない。`,'bad'); return;
  }
  const lv=G.skills['戦闘'].lv;
  const dmg=baseDmg+lv*2+rnd(5);
  monster.hp=Math.max(0,monster.hp-dmg);
  addLog(`⚔️ ${weapon}で攻撃！${monster.name}に${dmg}ダメージ。（残HP: ${monster.hp}/${monster.maxHp}）`,'combat');
  gainSkillExp('戦闘',5);
  if(monster.hp<=0){ endBattleWin(monster); return; }
  if(monster.hp<=monster.maxHp*0.3){
    addLog(`  → ${monster.name}はかなり弱っている！魅了・調教・捕縛が可能になった。`,'dim');
  }
  monsterCounterAttack(monster);
  renderBattleCommands(monster);
}

function doBattleMagic(monster, type) {
  const lv=G.skills['魔法'].lv;
  const dmgMap={fire:lv*8+rnd(10), ice:lv*7+rnd(8), thunder:lv*10+rnd(12)};
  const dmg=dmgMap[type]||lv*5;
  monster.hp=Math.max(0,monster.hp-dmg);
  const names={fire:'炎魔法🔥',ice:'氷魔法❄️',thunder:'雷魔法⚡'};
  addLog(`${names[type]}！${monster.name}に${dmg}ダメージ。`,'magic');
  gainSkillExp('魔法',8);
  if(monster.hp<=0){ endBattleWin(monster); return; }
  monsterCounterAttack(monster);
  renderBattleCommands(monster);
}

function doBattleHeal() {
  const lv=G.skills['魔法'].lv;
  const heal=lv*5+rnd(10);
  changeHp(heal);
  addLog(`💚 回復魔法！HP+${heal}。`,'good');
  gainSkillExp('魔法',5);
  if(G_BATTLE) monsterCounterAttack(G_BATTLE.monster);
  if(G_BATTLE) renderBattleCommands(G_BATTLE.monster);
}

function doBattlePotion() {
  removeItem('potion');
  const heal=rnd(20)+15;
  changeHp(heal);
  addLog(`💊 回復薬を使った。HP+${heal}。`,'item');
  if(G_BATTLE) monsterCounterAttack(G_BATTLE.monster);
  if(G_BATTLE) renderBattleCommands(G_BATTLE.monster);
}

function doBattlePoison(monster) {
  removeItem('poison_potion');
  addLog(`☠️ ${monster.name}に毒を盛った！`,'crime');
  setTimeout(()=>{
    const dmg=rnd(15)+10;
    monster.hp=Math.max(0,monster.hp-dmg);
    addLog(`  → 毒が回った！${dmg}ダメージ。`,'bad');
    if(monster.hp<=0) endBattleWin(monster);
    else renderBattleCommands(monster);
    updateUI();
  },2000);
  gainSkillExp('医術',5);
}

function doBattleCharm(monster) {
  const lv=G.skills['魅力'].lv;
  if(monster.hp>monster.maxHp*0.5){ addLog('HPが半分以下でないと魅了できない。','bad'); return; }
  if(pct(0.2+lv*0.06)){
    addLog(`💜 ${monster.name}を魅了した！使い魔にできる。`,'magic');
    G.familiars.push({...monster, attitude:'charmed'});
    G_BATTLE=null;
    addLog(`  → ${monster.name}が使い魔になった！`,'level');
    gainSkillExp('魅力',15);
    renderCommandArea(buildSelfCommands(),'自分自身');
  } else {
    addLog(`💜 魅了に失敗した！${monster.name}は激怒した。`,'bad');
    monsterCounterAttack(monster);
    renderBattleCommands(monster);
  }
}

function doBattleTame(monster) {
  const lv=G.skills['調教'].lv;
  if(!monster.tameable){ addLog('このモンスターは調教できない。','bad'); return; }
  if(monster.hp>monster.maxHp*0.3){ addLog('HPが30%以下でないと調教できない。','bad'); return; }
  if(pct(0.3+lv*0.07)){
    addLog(`🐾 ${monster.name}の調教に成功！ペットになった。`,'level');
    G.pets.push({...monster, attitude:'tamed'});
    G_BATTLE=null;
    gainSkillExp('調教',20);
    renderCommandArea(buildSelfCommands(),'自分自身');
  } else {
    addLog(`🐾 調教に失敗した。${monster.name}は怒っている。`,'bad');
    monsterCounterAttack(monster);
    renderBattleCommands(monster);
  }
}

function doBattleNegotiate(monster) {
  const lv=G.skills['交渉'].lv;
  if(pct(0.1+lv*0.05)){
    addLog(`🤝 ${monster.name}との交渉が成立！戦闘を終えた。`,'good');
    G_BATTLE=null;
    gainSkillExp('交渉',10);
    renderCommandArea(buildSelfCommands(),'自分自身');
  } else {
    addLog(`🤝 交渉失敗。${monster.name}は聞く耳を持たない。`,'bad');
    monsterCounterAttack(monster);
    renderBattleCommands(monster);
  }
}

function doBattleThreaten(monster) {
  const lv=G.skills['交渉'].lv;
  if(pct(0.15+lv*0.05)){
    addLog(`😈 ${monster.name}を脅した。逃げていった。`,'result');
    G_BATTLE=null;
    renderCommandArea(buildSelfCommands(),'自分自身');
  } else {
    addLog(`😈 脅しが効かなかった！${monster.name}は激怒した。`,'bad');
    monsterCounterAttack(monster);
    monsterCounterAttack(monster); // 激怒で2回攻撃
    renderBattleCommands(monster);
  }
}

function doBattleFlee(monster) {
  if(pct(0.6)){
    addLog(`🏃 ${monster.name}から逃げた！`,'result');
    G_BATTLE=null;
    renderCommandArea(buildSelfCommands(),'自分自身');
  } else {
    addLog(`🏃 逃げようとしたが失敗！`,'bad');
    monsterCounterAttack(monster);
    renderBattleCommands(monster);
  }
}

function doBattleCapture(monster) {
  if(!hasItem('rope')){ addLog('ロープがない。','bad'); return; }
  if(monster.hp>monster.maxHp*0.3){ addLog('HPが30%以下でないと捕縛できない。','bad'); return; }
  removeItem('rope');
  addLog(`🪢 ${monster.name}を捕縛した！`,'good');
  G.gold+=Math.floor(monster.gold*1.5);
  addLog(`  → 捕縛報酬: ${Math.floor(monster.gold*1.5)}G`,'good');
  G_BATTLE=null;
  gainSkillExp('戦闘',10);
  renderCommandArea(buildSelfCommands(),'自分自身');
}

function doBattleObserve(monster) {
  addLog(`🔍 ${monster.name}を観察した。\nHP: ${monster.hp}/${monster.maxHp} | 攻撃力: ${monster.atk} | 防御力: ${monster.def}`,'result');
  addLog(`  調教可能: ${monster.tameable?'はい（必要スキルLv.'+monster.tameSkill+'）':'いいえ'}`,'dim');
  gainSkillExp('医術',3); advanceTurn();
  renderBattleCommands(monster);
}

function doBattleProvoke(monster) {
  addLog(`😤 ${monster.name}を挑発した！`,'combat');
  const extraDmg=rnd(5)+3;
  monster.atk+=2;
  addLog(`  → ${monster.name}が激怒！攻撃力が上がった。次の自分の攻撃に+${extraDmg}ダメージ。`,'dim');
  gainSkillExp('戦闘',3);
  monsterCounterAttack(monster);
  renderBattleCommands(monster);
}

function doBattleDefend() {
  addLog('🛡️ 防御した。次の攻撃のダメージを半減する。','dim');
  G.defending=true;
  monsterCounterAttack(G_BATTLE.monster);
  G.defending=false;
  renderBattleCommands(G_BATTLE.monster);
}

function monsterCounterAttack(monster) {
  if(monster.hp<=0) return;
  const def=G.skills['戦闘'].lv;
  let dmg=Math.max(1,monster.atk-def+rnd(5));
  if(G.defending) dmg=Math.floor(dmg/2);
  changeHp(-dmg);
  addLog(`  → ${monster.name}の反撃！${dmg}ダメージを受けた。（残HP: ${G.hp}/${G.maxHp}）`,'bad');
  if(G.hp<=0){ addLog('💀 力尽きた……','death'); G_BATTLE=null; }
}

function endBattleWin(monster) {
  addLog(`🏆 ${monster.name}を倒した！`,'level');
  G.gold+=monster.gold;
  addLog(`  → ${monster.gold}G獲得。`,'good');
  gainSkillExp('戦闘',monster.exp);
  (monster.drops||[]).forEach(id=>{
    if(pct(0.5)){ addItem(id); addLog(`  → ${itemName(id)}をドロップ！`,'item'); }
  });
  changeKarma(monster.karmaOnKill||0);
  G_BATTLE=null;
  updateUI();
  renderCommandArea(buildSelfCommands(),'自分自身');
}

function doForestGather() {
  const lv=G.skills['採掘'].lv;
  const finds=['poison_herb','rags','rope','torch','flower'];
  const f=pick(finds); addItem(f);
  addLog(`🌿 森で採取した。${itemName(f)}を入手！`,'item');
  gainSkillExp('採掘',5); advanceTurn(3);
}

function doForestCamp() {
  const heal=10+G.skills['医術'].lv*2;
  changeHp(heal); changeSan(5);
  addLog(`⛺ 森で野営した。HP+${heal}、SAN+5。`,'dim');
  if(pct(0.2)){ addLog('夜中にモンスターが現れた！','event'); startRandomBattle(); }
  advanceTurn(6);
}

function doSetTrap() {
  if(!hasItem('rope')){ addLog('ロープがない。','bad'); return; }
  removeItem('rope');
  addLog('🪤 罠を仕掛けた。','skill');
  advanceTurn(5);
  if(pct(0.4)){
    const m=pick(MONSTERS.slice(0,4));
    addLog(`  → 罠に${m.name}がかかった！`,'level');
    G.gold+=m.gold; addItem(m.drops[0]||'bone');
    addLog(`  → ${m.gold}G + ${itemName(m.drops[0]||'bone')}入手。`,'good');
  } else {
    addLog('  → 罠には何もかかっていなかった。','dim');
  }
  gainSkillExp('採掘',5);
}

// ── 株・投資 ─────────────────────────────────────────────────
const STOCKS = [
  {id:'grain',  name:'穀物株',   price:100, volatility:0.15},
  {id:'iron',   name:'鉄鋼株',   price:200, volatility:0.2},
  {id:'magic',  name:'魔法石株', price:500, volatility:0.3},
];

function openStockMenu() {
  const portfolio=G.stocks||{};
  const opts=[
    ...STOCKS.map(s=>({
      label:`${s.name}を買う（${s.price}G）`,
      fn:()=>buyStock(s),
    })),
    ...STOCKS.filter(s=>portfolio[s.id]>0).map(s=>({
      label:`${s.name}を売る（保有: ${portfolio[s.id]||0}株）`,
      fn:()=>sellStock(s),
    })),
    {label:'市場の動向を見る', fn:()=>checkMarket()},
  ];
  openModal('株式市場', `所持金: ${G.gold}G`, opts);
}

function buyStock(stock) {
  if(G.gold<stock.price){ addLog('お金が足りない。','bad'); return; }
  G.gold-=stock.price;
  if(!G.stocks) G.stocks={};
  G.stocks[stock.id]=(G.stocks[stock.id]||0)+1;
  addLog(`📈 ${stock.name}を${stock.price}Gで1株購入した。`,'item');
  advanceTurn(2);
}

function sellStock(stock) {
  if(!G.stocks||!G.stocks[stock.id]){ addLog('この株を持っていない。','bad'); return; }
  const change=(Math.random()-0.5)*2*stock.volatility;
  const sellPrice=Math.floor(stock.price*(1+change));
  G.gold+=sellPrice;
  G.stocks[stock.id]--;
  const profit=sellPrice-stock.price;
  addLog(`📉 ${stock.name}を${sellPrice}Gで売却。${profit>=0?'利益':'損失'}: ${Math.abs(profit)}G`,'item');
  advanceTurn(2);
}

function checkMarket() {
  addLog('📊 市場の動向を確認した。\n「穀物は安定、鉄鋼は上昇傾向、魔法石は不安定。」','result');
  advanceTurn();
}

// ── 住居変更 ─────────────────────────────────────────────────
function openHousingMenu() {
  openModal('住居を変える', `現在: ${G.housing}`, [
    {label:'ホームレス（無料）',       fn:()=>changeHousing('homeless',0)},
    {label:'安宿に泊まる（20G/50T）',  fn:()=>changeHousing('inn',20)},
    {label:'借家を借りる（30G/50T）',  fn:()=>changeHousing('rental',30)},
    {label:'アパートを借りる（40G/50T）',fn:()=>changeHousing('apartment',40)},
    {label:'家を買う（1000G）',        fn:()=>changeHousing('own',1000)},
  ]);
}

function changeHousing(type, cost) {
  if(type==='own' && G.gold<cost){ addLog('お金が足りない（1000G必要）。','bad'); return; }
  if(type==='own') G.gold-=cost;
  G.housing=type;
  const names={homeless:'ホームレス',inn:'安宿',rental:'借家',apartment:'アパート',own:'自分の家',built:'自建の家'};
  addLog(`🏠 住居を【${names[type]}】に変えた。`,'good');
  updateUI();
}

// ============================================================
// 新興宗教システム
// ============================================================

function openCultMenu() {
  if(G.cult) {
    openOwnCultMenu();
  } else {
    openModal('宗教・信仰', '何をしますか？', [
      {label:'新興宗教を立ち上げる',     fn:()=>openFoundCultMenu()},
      {label:'既存の宗教団体に入る',     fn:()=>openJoinCultMenu()},
      {label:'宗教団体を調べる',         fn:()=>doInvestigateCults()},
    ]);
  }
}

function openFoundCultMenu() {
  if(G.skills['信仰'].lv < 3) {
    addLog('信仰スキルLv.3以上が必要だ。','bad'); return;
  }
  if(G.gold < 200) {
    addLog('設立費用200Gが必要だ。','bad'); return;
  }
  openModal('新興宗教を立ち上げる',
    '教義を決めてください。\n設立費用: 200G\n信仰スキルLv.3以上必要',
    [
      {label:'光の教え（善良・治癒系）',     fn:()=>foundCult('光の教会','光と愛の神を崇め、互いを助け合う')},
      {label:'力の教え（戦闘・支配系）',     fn:()=>foundCult('力の神殿','強さこそ正義。力ある者が世を治める')},
      {label:'富の教え（商業・繁栄系）',     fn:()=>foundCult('繁栄の祭壇','富と豊かさの神を崇め、財を積む')},
      {label:'混沌の教え（カオス・自由系）', fn:()=>foundCult('混沌の使徒','秩序を壊し、真の自由を手に入れる')},
      {label:'科学の教え（知識・錬金系）',   fn:()=>foundCult('知識の神殿','知識こそ神。科学と錬金術で世を変える')},
    ]
  );
}

function foundCult(name, doctrine) {
  G.gold -= 200;
  G.cult = {
    name, doctrine,
    members: [],
    funds: 0,
    rank: 0,       // 0=零細 1=小規模 2=中規模 3=大規模 4=国家規模
    reputation: 0,
    founded: G.turn,
  };
  addLog(`✨ 宗教団体【${name}】を設立した！`, 'faith');
  addLog(`教義：「${doctrine}」`, 'faith');
  addLog('信者を集め、教団を大きくしていこう。', 'dim');
  gainSkillExp('信仰', 50);
  changeKarma(G.cult.name.includes('混沌') ? -5 : 5);
  updateUI();
}

function openOwnCultMenu() {
  const c = G.cult;
  const rankNames = ['零細','小規模','中規模','大規模','国家規模'];
  openModal(`【${c.name}】の管理`,
    `教義: ${c.doctrine}\n信者数: ${c.members.length}人\n資金: ${c.funds}G\n規模: ${rankNames[c.rank]}`,
    [
      {label:'布教活動をする',           fn:()=>doCultPreach()},
      {label:'集会を開く',               fn:()=>doCultMeeting()},
      {label:'上納金を徴収する',         fn:()=>doCultCollectTithe()},
      {label:'教義を広める（ビラ配り）', fn:()=>doCultFlyer()},
      {label:'信者に命令する',           fn:()=>openCultOrderMenu()},
      {label:'教団を解散する',           fn:()=>dissolveCult()},
    ]
  );
}

function doCultPreach() {
  const lv = G.skills['信仰'].lv;
  const base = lv * 0.15 + (G.luck / 200);
  const success = Math.random() < base;
  gainSkillExp('信仰', 15);
  gainSkillExp('弁舌', 10);
  advanceTurn(2);
  if(success) {
    const newMember = pick(['通行人A','通行人B','農民','商人','若者','老人']);
    G.cult.members.push({ name: newMember, devotion: 10 });
    addLog(`✨ 布教に成功！【${newMember}】が信者になった。（信者数: ${G.cult.members.length}）`, 'faith');
    G.cult.funds += 5;
    if(G.cult.members.length >= 10 && G.cult.rank < 1) { G.cult.rank = 1; addLog('📈 教団が【小規模】に成長した！', 'level'); }
    if(G.cult.members.length >= 30 && G.cult.rank < 2) { G.cult.rank = 2; addLog('📈 教団が【中規模】に成長した！', 'level'); }
    if(G.cult.members.length >= 100 && G.cult.rank < 3) { G.cult.rank = 3; addLog('📈 教団が【大規模】に成長した！', 'level'); }
  } else {
    addLog('布教したが、誰も興味を持たなかった。', 'dim');
  }
  updateUI();
}

function doCultMeeting() {
  if(!G.cult.members.length) { addLog('信者がいないので集会を開けない。', 'bad'); return; }
  const gain = G.cult.members.length * 3;
  G.cult.funds += gain;
  G.cult.members.forEach(m => m.devotion = Math.min(100, m.devotion + 5));
  gainSkillExp('信仰', 20);
  gainSkillExp('弁舌', 15);
  advanceTurn(3);
  addLog(`🕯 集会を開いた。信者の信仰心が高まり、献金${gain}Gを集めた。`, 'faith');
  updateUI();
}

function doCultCollectTithe() {
  if(!G.cult.members.length) { addLog('信者がいない。', 'bad'); return; }
  const total = G.cult.members.reduce((s, m) => s + Math.floor(m.devotion / 10) * 5, 0);
  G.cult.funds -= total;
  G.gold += total;
  addLog(`💰 信者から上納金${total}Gを徴収した。（教団資金: ${G.cult.funds}G）`, 'faith');
  advanceTurn(1);
  updateUI();
}

function doCultFlyer() {
  if(!hasItem('cult_pamphlet') && !hasItem('pamphlet')) {
    addLog('ビラがない。先にクラフトするか購入しよう。', 'bad'); return;
  }
  removeItem(hasItem('cult_pamphlet') ? 'cult_pamphlet' : 'pamphlet', 1);
  const lv = G.skills['弁舌'].lv;
  const converts = Math.floor(Math.random() * lv) + 1;
  for(let i = 0; i < converts; i++) {
    G.cult.members.push({ name: `信者${G.cult.members.length+1}`, devotion: 5 });
  }
  gainSkillExp('弁舌', 10);
  addLog(`📄 ビラを配った。${converts}人が興味を持った。（信者数: ${G.cult.members.length}）`, 'faith');
  advanceTurn(2);
  updateUI();
}

function openCultOrderMenu() {
  if(!G.cult.members.length) { addLog('命令できる信者がいない。', 'bad'); return; }
  openModal('信者への命令', `信者数: ${G.cult.members.length}人`, [
    {label:'全員で布教させる',           fn:()=>orderAllPreach()},
    {label:'全員から上納金を集める',     fn:()=>orderAllTithe()},
    {label:'家族を入信させろ',           fn:()=>orderFamilyConvert()},
    {label:'信者を偵察に使う',           fn:()=>orderSpy()},
    {label:'信者に自害を命じる（要Lv.8）', fn:()=>orderMassSuicide()},
  ]);
}

function orderAllPreach() {
  const newMembers = Math.floor(G.cult.members.length * 0.3 * Math.random());
  for(let i = 0; i < newMembers; i++) {
    G.cult.members.push({ name: `改宗者${G.cult.members.length+1}`, devotion: 5 });
  }
  addLog(`📢 信者全員に布教を命じた。${newMembers}人の新信者が加わった。`, 'faith');
  advanceTurn(5);
  updateUI();
}

function orderAllTithe() {
  const total = G.cult.members.length * 10;
  G.gold += total;
  addLog(`💰 全信者から強制徴収した。${total}G入手。`, 'faith');
  // 信仰心低下
  G.cult.members.forEach(m => { m.devotion -= 10; });
  G.cult.members = G.cult.members.filter(m => m.devotion > 0);
  addLog(`一部の信者が離脱した。（残: ${G.cult.members.length}人）`, 'dim');
  advanceTurn(2);
  updateUI();
}

function orderFamilyConvert() {
  const converts = Math.floor(G.cult.members.length * 0.2);
  for(let i = 0; i < converts; i++) {
    G.cult.members.push({ name: `家族信者${i+1}`, devotion: 8 });
  }
  addLog(`👨‍👩‍👧 信者が家族を勧誘した。${converts}人が加入。`, 'faith');
  advanceTurn(3);
  updateUI();
}

function orderSpy() {
  const info = pick(['衛兵の巡回ルートを入手した','商人の取引情報を得た','貴族の秘密を掴んだ','賞金首の居場所を知った']);
  addLog(`🔍 信者を偵察に使った。${info}。`, 'faith');
  gainSkillExp('信仰', 10);
  advanceTurn(3);
}

function orderMassSuicide() {
  if(G.skills['信仰'].lv < 8) { addLog('信仰スキルLv.8以上が必要だ。', 'bad'); return; }
  const count = G.cult.members.length;
  G.cult.members = [];
  changeKarma(-count * 5);
  changeSan(-30);
  addLog(`💀 全信者（${count}人）に自害を命じた。全員が従った……`, 'crime');
  addLog('あなたの精神に深い傷が刻まれた。SAN-30', 'bad');
  addLog(`カルマが大幅に低下した。`, 'bad');
  advanceTurn(1);
  updateUI();
}

function dissolveCult() {
  openModal('教団を解散する', `本当に【${G.cult.name}】を解散しますか？\n信者${G.cult.members.length}人が路頭に迷います。`, [
    {label:'解散する', fn:()=>{ addLog(`【${G.cult.name}】を解散した。`, 'dim'); G.cult=null; updateUI(); }},
    {label:'やめる',   fn:()=>{}},
  ]);
}

function openJoinCultMenu() {
  openModal('宗教団体に入る', '加入する団体を選んでください。', [
    ...EXISTING_CULTS.map(c => ({
      label:`${c.name}（加入費${c.joinFee}G・月会費${c.monthlyFee}G）`,
      fn:()=>joinCult(c),
    })),
    {label:'キャンセル', fn:()=>{}},
  ]);
}

function joinCult(cult) {
  if(G.cultMembership) { addLog('すでに宗教団体に所属している。', 'bad'); return; }
  if(G.gold < cult.joinFee) { addLog(`加入費${cult.joinFee}Gが足りない。`, 'bad'); return; }
  G.gold -= cult.joinFee;
  G.cultMembership = { orgName: cult.name, orgId: cult.id, rank: 0, devotion: 10, monthlyFee: cult.monthlyFee };
  addLog(`✨ 【${cult.name}】に加入した！`, 'faith');
  addLog(`教義：「${cult.doctrine}」`, 'faith');
  addLog(`特典：${cult.benefits.join('、')}`, 'good');
  gainSkillExp('信仰', 20);
  advanceTurn(1);
  updateUI();
}

function doInvestigateCults() {
  addLog('街で宗教団体について調べた。', 'dim');
  EXISTING_CULTS.forEach(c => {
    addLog(`【${c.name}】信者数:${c.members} 加入費:${c.joinFee}G 教義:「${c.doctrine}」`, 'result');
  });
  gainSkillExp('科学', 5);
  advanceTurn(1);
}

// ============================================================
// 罠システム
// ============================================================

function openTrapMenu() {
  openModal('罠システム', '何をしますか？', [
    {label:'罠を作る（クラフト）',       fn:()=>openCraftTrapMenu()},
    {label:'罠を仕掛ける',               fn:()=>openSetTrapMenu()},
    {label:'仕掛けた罠を確認する',       fn:()=>checkMyTraps()},
    {label:'罠を回収する',               fn:()=>retrieveTraps()},
    {label:'罠を買う',                   fn:()=>openBuyTrapMenu()},
  ]);
}

function openCraftTrapMenu() {
  const lv = G.skills['科学'].lv;
  const available = TRAP_TYPES.filter(t => t.sciReq <= lv);
  if(!available.length) { addLog('科学スキルが足りない。Lv.1以上で熊罠が作れる。', 'bad'); return; }
  openModal('罠を作る', `科学スキルLv.${lv}`, [
    ...available.map(t => ({
      label:`${t.name}（材料費${Math.floor(t.cost*0.6)}G）`,
      fn:()=>craftTrap(t),
    })),
  ]);
}

function craftTrap(trapType) {
  const cost = Math.floor(trapType.cost * 0.6);
  if(G.gold < cost) { addLog(`材料費${cost}Gが足りない。`, 'bad'); return; }
  G.gold -= cost;
  const existing = G.trapInventory.find(t => t.type === trapType.id);
  if(existing) existing.qty++;
  else G.trapInventory.push({ type: trapType.id, qty: 1 });
  gainSkillExp('科学', 20);
  gainSkillExp('鍛冶', 10);
  addLog(`🔧 【${trapType.name}】を作成した。（材料費${cost}G）`, 'skill');
  advanceTurn(3);
  updateUI();
}

function openSetTrapMenu() {
  if(!G.trapInventory.length) { addLog('仕掛ける罠がない。', 'bad'); return; }
  openModal('罠を仕掛ける', '場所を選んでください。', [
    {label:'街の路地に仕掛ける',         fn:()=>setTrap('alley')},
    {label:'自宅の入口に仕掛ける',       fn:()=>setTrap('home'), req:G.housing==='own'||G.housing==='built'},
    {label:'森の入口に仕掛ける',         fn:()=>setTrap('forest')},
    {label:'特定NPCの近くに仕掛ける',    fn:()=>openSetTrapNpcMenu()},
  ]);
}

function openSetTrapNpcMenu() {
  openModal('NPCの近くに罠を仕掛ける', 'ターゲットを選んでください。', [
    ...NPCS.map(n => ({
      label:n.name,
      fn:()=>setTrapNear(n),
    })),
  ]);
}

function setTrap(location) {
  if(!G.trapInventory.length) { addLog('罠がない。', 'bad'); return; }
  const trapItem = G.trapInventory[0];
  const trapType = TRAP_TYPES.find(t => t.id === trapItem.type);
  trapItem.qty--;
  if(trapItem.qty <= 0) G.trapInventory.shift();
  G.traps.push({ type: trapItem.type, location, set: G.turn, triggered: false });
  addLog(`⚙ 【${trapType.name}】を【${location}】に仕掛けた。`, 'skill');
  gainSkillExp('科学', 10);
  advanceTurn(1);
  updateUI();
}

function setTrapNear(npc) {
  if(!G.trapInventory.length) { addLog('罠がない。', 'bad'); return; }
  const trapItem = G.trapInventory[0];
  const trapType = TRAP_TYPES.find(t => t.id === trapItem.type);
  trapItem.qty--;
  if(trapItem.qty <= 0) G.trapInventory.shift();
  // 罠発動判定
  const success = Math.random() < 0.6;
  if(success) {
    const dmg = trapType.id === 'bear_trap' ? 30 : trapType.id === 'pitfall_kit' ? 20 : 10;
    npc.hp = Math.max(0, npc.hp - dmg);
    addLog(`⚙ 【${trapType.name}】を${npc.name}の近くに仕掛けた。`, 'skill');
    addLog(`💥 罠が発動！${npc.name}に${dmg}ダメージ！（残HP: ${npc.hp}）`, 'combat');
    if(trapType.id === 'poison_trap') { npc.statuses.push('poison'); addLog(`${npc.name}は毒状態になった。`, 'crime'); }
    if(trapType.id === 'sleep_trap')  { npc.statuses.push('sleep');  addLog(`${npc.name}は眠り状態になった。`, 'magic'); }
    if(npc.hp <= 0) { addLog(`${npc.name}は倒れた。`, 'combat'); npc.attitude='dead'; }
    changeKarma(-8);
  } else {
    addLog(`⚙ 罠を仕掛けたが、${npc.name}に気づかれた！`, 'bad');
    npc.attitude = 'hostile';
    changeKarma(-3);
  }
  gainSkillExp('科学', 15);
  advanceTurn(2);
  updateUI();
}

function checkMyTraps() {
  if(!G.traps.length) { addLog('仕掛けた罠はない。', 'dim'); return; }
  G.traps.forEach(t => {
    const trapType = TRAP_TYPES.find(x => x.id === t.type);
    addLog(`📍 【${trapType ? trapType.name : t.type}】→ 場所:${t.location} 設置T:${t.set} 発動:${t.triggered?'済み':'未'}`, 'dim');
  });
}

function retrieveTraps() {
  if(!G.traps.length) { addLog('回収できる罠がない。', 'dim'); return; }
  const count = G.traps.length;
  G.traps.forEach(t => {
    if(!t.triggered) {
      const existing = G.trapInventory.find(x => x.type === t.type);
      if(existing) existing.qty++;
      else G.trapInventory.push({ type: t.type, qty: 1 });
    }
  });
  G.traps = [];
  addLog(`🔧 罠${count}個を回収した。`, 'skill');
  advanceTurn(2);
  updateUI();
}

function openBuyTrapMenu() {
  openModal('罠を買う', '種類を選んでください。', [
    ...TRAP_TYPES.map(t => ({
      label:`${t.name}（${t.cost}G）`,
      fn:()=>buyTrap(t),
    })),
  ]);
}

function buyTrap(trapType) {
  if(G.gold < trapType.cost) { addLog(`${trapType.cost}Gが足りない。`, 'bad'); return; }
  G.gold -= trapType.cost;
  const existing = G.trapInventory.find(t => t.type === trapType.id);
  if(existing) existing.qty++;
  else G.trapInventory.push({ type: trapType.id, qty: 1 });
  addLog(`🛒 【${trapType.name}】を購入した。（${trapType.cost}G）`, 'item');
  updateUI();
}

// ============================================================
// 科学・化学システム
// ============================================================

function openScienceMenu() {
  openModal('科学・化学研究', '何をしますか？', [
    {label:'研究室を作る（要建築Lv.3・500G）', fn:()=>buildLab()},
    {label:'化学実験をする',                   fn:()=>openChemMenu()},
    {label:'爆発物を製造する',                 fn:()=>craftExplosive()},
    {label:'真実の血清を作る',                 fn:()=>craftTruthSerum()},
    {label:'クローンを生成する',               fn:()=>openCloneMenu()},
    {label:'人体錬成を試みる',                 fn:()=>doHumanTransmutation()},
    {label:'賢者の石を探求する',               fn:()=>doPhilosopherStone()},
  ]);
}

function buildLab() {
  if(G.skills['建築'].lv < 3) { addLog('建築スキルLv.3以上が必要だ。', 'bad'); return; }
  if(G.gold < 500) { addLog('500Gが必要だ。', 'bad'); return; }
  if(G.scienceLab) { addLog('すでに研究室がある。', 'dim'); return; }
  G.gold -= 500;
  G.scienceLab = true;
  addLog('🔬 研究室を作った！化学実験・クローン生成が可能になった。', 'skill');
  gainSkillExp('建築', 30);
  advanceTurn(10);
  updateUI();
}

function openChemMenu() {
  openModal('化学実験', '何を作りますか？', [
    {label:'爆発物（試薬+触媒、科学Lv.3）',   fn:()=>craftExplosive()},
    {label:'強酸（試薬×2、科学Lv.2）',         fn:()=>craftAcid()},
    {label:'煙幕弾（試薬+布、科学Lv.2）',      fn:()=>craftSmokeBomb()},
    {label:'真実の血清（試薬×3、科学Lv.4）',   fn:()=>craftTruthSerum()},
    {label:'毒薬（毒草+試薬、化学Lv.2）',      fn:()=>craftPoisonPotion()},
    {label:'解毒薬（試薬+薬草、化学Lv.1）',    fn:()=>craftAntidote()},
  ]);
}

function craftExplosive() {
  if(G.skills['科学'].lv < 3) { addLog('科学スキルLv.3が必要だ。', 'bad'); return; }
  if(!hasItem('reagent') || !hasItem('catalyst')) { addLog('試薬と触媒が必要だ。', 'bad'); return; }
  removeItem('reagent', 1); removeItem('catalyst', 1);
  addItem('explosive', 1);
  gainSkillExp('科学', 25); gainSkillExp('化学', 20);
  addLog('💥 爆発物を製造した。取り扱いには注意しよう。', 'combat');
  advanceTurn(3);
  updateUI();
}

function craftAcid() {
  if(G.skills['科学'].lv < 2) { addLog('科学スキルLv.2が必要だ。', 'bad'); return; }
  if(itemCount('reagent') < 2) { addLog('試薬×2が必要だ。', 'bad'); return; }
  removeItem('reagent', 2);
  addItem('acid', 1);
  gainSkillExp('化学', 20);
  addLog('⚗ 強酸を製造した。鍵を溶かしたり、証拠を消したりできる。', 'skill');
  advanceTurn(2);
  updateUI();
}

function craftSmokeBomb() {
  if(G.skills['科学'].lv < 2) { addLog('科学スキルLv.2が必要だ。', 'bad'); return; }
  if(!hasItem('reagent')) { addLog('試薬が必要だ。', 'bad'); return; }
  removeItem('reagent', 1);
  addItem('smoke_bomb', 1);
  gainSkillExp('化学', 15);
  addLog('💨 煙幕弾を製造した。逃走や奇襲に使える。', 'skill');
  advanceTurn(2);
  updateUI();
}

function craftTruthSerum() {
  if(G.skills['科学'].lv < 4) { addLog('科学スキルLv.4が必要だ。', 'bad'); return; }
  if(itemCount('reagent') < 3) { addLog('試薬×3が必要だ。', 'bad'); return; }
  removeItem('reagent', 3);
  addItem('truth_serum', 1);
  gainSkillExp('科学', 30); gainSkillExp('化学', 25);
  addLog('💉 真実の血清を製造した。NPCに使うと本音を引き出せる。', 'skill');
  advanceTurn(4);
  updateUI();
}

function craftPoisonPotion() {
  if(G.skills['化学'].lv < 2) { addLog('化学スキルLv.2が必要だ。', 'bad'); return; }
  if(!hasItem('poison_herb') || !hasItem('reagent')) { addLog('毒草と試薬が必要だ。', 'bad'); return; }
  removeItem('poison_herb', 1); removeItem('reagent', 1);
  addItem('poison_potion', 2);
  gainSkillExp('化学', 20);
  addLog('☠ 毒薬を2本製造した。', 'crime');
  advanceTurn(2);
  updateUI();
}

function craftAntidote() {
  if(G.skills['化学'].lv < 1) { addLog('化学スキルLv.1が必要だ。', 'bad'); return; }
  if(!hasItem('reagent')) { addLog('試薬が必要だ。', 'bad'); return; }
  removeItem('reagent', 1);
  addItem('antidote', 2);
  gainSkillExp('化学', 15);
  addLog('💊 解毒薬を2本製造した。', 'good');
  advanceTurn(2);
  updateUI();
}

// 真実の血清をNPCに使う
function doUseTruthSerum(npc) {
  if(!hasItem('truth_serum')) { addLog('真実の血清がない。', 'bad'); return; }
  removeItem('truth_serum', 1);
  const secrets = [
    `${npc.name}「……実は、隣の商人と不倫関係にある。」`,
    `${npc.name}「……昔、人を殺したことがある。」`,
    `${npc.name}「……衛兵に賄賂を渡している。」`,
    `${npc.name}「……地下室に財宝を隠している。」`,
    `${npc.name}「……実は貴族の隠し子だ。」`,
    `${npc.name}「……犯罪組織のスパイをしている。」`,
  ];
  addLog(`💉 ${npc.name}に真実の血清を使った。`, 'magic');
  addLog(pick(secrets), 'faith');
  gainSkillExp('科学', 15);
  changeKarma(-5);
  advanceTurn(2);
}

// クローン生成
function openCloneMenu() {
  if(!G.scienceLab) { addLog('研究室が必要だ。先に研究室を建設しよう。', 'bad'); return; }
  if(G.skills['科学'].lv < 6) { addLog('科学スキルLv.6以上が必要だ。', 'bad'); return; }
  if(!hasItem('clone_pod')) { addLog('クローンカプセルが必要だ（冒険者店で購入）。', 'bad'); return; }
  openModal('クローン生成', 'クローンの元となるNPCを選んでください。\n（クローンカプセル消費・費用500G）', [
    ...NPCS.map(n => ({
      label:n.name,
      fn:()=>generateClone(n),
    })),
  ]);
}

function generateClone(npc) {
  if(G.gold < 500) { addLog('500Gが必要だ。', 'bad'); return; }
  if(!hasItem('clone_pod')) { addLog('クローンカプセルが必要だ。', 'bad'); return; }
  G.gold -= 500;
  removeItem('clone_pod', 1);
  const clone = {
    name: `${npc.name}（クローン）`,
    sourceNpc: npc.id,
    hp: npc.maxHp,
    loyalty: 50,
    created: G.turn,
  };
  G.clones.push(clone);
  gainSkillExp('科学', 50);
  changeSan(-10);
  addLog(`🧬 【${npc.name}】のクローンを生成した！`, 'skill');
  addLog(`クローンは命令に従う。ただし、精神的な負担がある。SAN-10`, 'bad');
  advanceTurn(10);
  updateUI();
}

// 人体錬成
function doHumanTransmutation() {
  if(G.skills['錬金術'].lv < 5) { addLog('錬金術スキルLv.5以上が必要だ。', 'bad'); return; }
  if(!G.scienceLab) { addLog('研究室が必要だ。', 'bad'); return; }
  G.humanTransmuteAttempts++;
  const attempt = G.humanTransmuteAttempts;

  openModal('人体錬成', `【警告】人体錬成は禁忌の術です。\n試行回数: ${attempt}回目\n\n大きな代償が伴います。それでも行いますか？`,
    [
      {label:'行う', fn:()=>executeHumanTransmutation()},
      {label:'やめる', fn:()=>{}},
    ]
  );
}

function executeHumanTransmutation() {
  const lv = G.skills['錬金術'].lv;
  const success = Math.random() < (lv * 0.05); // 最大25%

  gainSkillExp('錬金術', 100);
  changeSan(-40);
  changeKarma(-20);

  if(success) {
    // 成功しても代償は大きい
    const sacrifice = pick(['右腕の機能を失った','左目が見えなくなった','記憶の一部が消えた']);
    addLog('⚗ 人体錬成……成功した。しかし——', 'faith');
    addLog(`代償として【${sacrifice}】。`, 'bad');
    addLog('錬成した存在は不完全で、すぐに消えてしまった。', 'dim');
    G.maxHp = Math.max(20, G.maxHp - 20);
    addLog(`最大HP-20（現在: ${G.maxHp}）`, 'bad');
    if(G.skills['錬金術'].lv < 10) gainSkillExp('錬金術', 200);
  } else {
    // 失敗
    const penalty = pick(['爆発が起きてHPが大幅に減った','研究室が壊れた（再建費用500G）','近隣住民が通報した']);
    addLog('⚗ 人体錬成……失敗した。', 'bad');
    addLog(`【${penalty}】`, 'bad');
    changeHp(-30);
    if(penalty.includes('研究室')) { G.scienceLab = false; G.gold -= Math.min(G.gold, 500); }
    if(penalty.includes('通報')) { addLog('衛兵が調査に来た！', 'combat'); changeKarma(-10); }
  }
  advanceTurn(5);
  updateUI();
}

// 賢者の石の探求
function doPhilosopherStone() {
  if(G.skills['錬金術'].lv < 8) { addLog('錬金術スキルLv.8以上が必要だ。', 'bad'); return; }
  if(!G.scienceLab) { addLog('研究室が必要だ。', 'bad'); return; }
  if(itemCount('reagent') < 5 || !hasItem('catalyst') || !hasItem('philosopher_stone') && !hasItem('human_organ')) {
    addLog('材料が足りない。（試薬×5、触媒、人体部位が必要）', 'bad'); return;
  }
  removeItem('reagent', 5); removeItem('catalyst', 1);
  if(hasItem('human_organ')) removeItem('human_organ', 1);
  const success = Math.random() < 0.1; // 10%
  gainSkillExp('錬金術', 150);
  changeSan(-20);
  if(success) {
    addItem('philosopher_stone', 1);
    addLog('✨ 賢者の石の生成に成功した！！', 'level');
    addLog('賢者の石：あらゆる錬金術の効果を倍増させる。', 'faith');
    addLog('しかし、その代償として何かが変わった気がする……', 'dim');
    changeKarma(-30);
  } else {
    addLog('⚗ 賢者の石の生成に失敗した。材料が無駄になった。', 'bad');
    addLog('しかし、失敗から多くを学んだ。', 'dim');
  }
  advanceTurn(8);
  updateUI();
}

// 爆発物を使う（NPC対象）
function doUseExplosive(npc) {
  if(!hasItem('explosive')) { addLog('爆発物がない。', 'bad'); return; }
  removeItem('explosive', 1);
  const dmg = 40 + Math.floor(Math.random() * 20);
  npc.hp = Math.max(0, npc.hp - dmg);
  changeHp(-Math.floor(dmg * 0.3)); // 自分もダメージ
  changeKarma(-20);
  changeSan(-5);
  addLog(`💥 爆発物を使った！${npc.name}に${dmg}ダメージ！（自分も${Math.floor(dmg*0.3)}ダメージ）`, 'combat');
  if(npc.hp <= 0) { addLog(`${npc.name}は爆発で倒れた。`, 'combat'); npc.attitude='dead'; }
  addLog('周囲の人々が騒ぎ出した。衛兵が来るかもしれない。', 'bad');
  advanceTurn(1);
  updateUI();
}

// 強酸を使う（NPC対象）
function doUseAcid(npc) {
  if(!hasItem('acid')) { addLog('強酸がない。', 'bad'); return; }
  removeItem('acid', 1);
  const dmg = 20 + Math.floor(Math.random() * 15);
  npc.hp = Math.max(0, npc.hp - dmg);
  npc.statuses = npc.statuses || [];
  npc.statuses.push('acid_burn');
  changeKarma(-10);
  addLog(`⚗ 強酸を${npc.name}に浴びせた！${dmg}ダメージ＋継続ダメージ！`, 'combat');
  advanceTurn(1);
  updateUI();
}

// ============================================================
// 建物爆破・犯行声明システム
// ============================================================

// 爆破可能な建物リスト
const BUILDINGS = [
  { id:'bakery',    name:'パン屋（ガルドの店）',   npcId:'baker',   damage:80  },
  { id:'guard_hq',  name:'衛兵詰所',               npcId:'guard',   damage:120 },
  { id:'church',    name:'神殿',                   npcId:'priest',  damage:100 },
  { id:'guild_hq',  name:'冒険者ギルド本部',        npcId:null,      damage:90  },
  { id:'market',    name:'市場',                   npcId:null,      damage:70  },
  { id:'inn',       name:'宿屋',                   npcId:null,      damage:60  },
  { id:'weapon_shop',name:'武具屋（ドルグの店）',   npcId:'blacksmith',damage:85},
  { id:'pharmacy',  name:'薬屋（ベルタの店）',      npcId:'herbalist',damage:65 },
  { id:'town_hall', name:'市庁舎',                  npcId:null,      damage:150 },
  { id:'prison',    name:'牢獄',                   npcId:null,      damage:110 },
];

// 犯行声明の送り先
const STATEMENT_TARGETS = [
  { id:'newspaper', name:'王都新聞社' },
  { id:'guard',     name:'衛兵隊長' },
  { id:'guild',     name:'冒険者ギルド' },
  { id:'king',      name:'国王（王宮）' },
  { id:'anonymous', name:'匿名掲示板（街の掲示板）' },
];

// ── 建物に爆発物を仕掛けるメニュー ──────────────────────────
function openBuildingBombMenu() {
  if(!hasItem('explosive') && !hasItem('timer_bomb')) {
    addLog('💣 爆発物がない。まず爆発物か時限爆弾を入手しよう。','bad');
    return;
  }
  const opts = BUILDINGS.map(b => ({
    label: b.name,
    fn: () => openBombPlantOptions(b),
  }));
  opts.push({ label: 'キャンセル', fn: () => {} });
  openModal('💣 どの建物に仕掛けますか？',
    '爆発物を仕掛ける建物を選んでください。\n発覚リスクあり。目撃者がいると逮捕される可能性があります。',
    opts
  );
}

function openBombPlantOptions(building) {
  const hasNormal = hasItem('explosive');
  const hasTimer  = hasItem('timer_bomb');
  const opts = [];
  if(hasNormal) opts.push({
    label: `即時爆破（爆発物）`,
    fn: () => doBombBuilding(building, 'instant'),
  });
  if(hasTimer) opts.push({
    label: `時限爆弾を仕掛ける（タイマー）`,
    fn: () => doBombBuilding(building, 'timer'),
  });
  opts.push({ label: 'キャンセル', fn: () => {} });
  openModal(`💣 ${building.name}への工作`,
    `即時爆破か時限爆弾かを選んでください。\n時限爆弾は3ターン後に爆発します。その間に逃げることができます。`,
    opts
  );
}

function doBombBuilding(building, type) {
  const lv = G.skills;
  const detected = pct(0.4 - (lv['窃盗'].lv * 0.05)); // 窃盗スキルで発覚率低下

  if(type === 'instant') {
    removeItem('explosive');
    if(detected) {
      addLog(`🚨 爆発物を仕掛けようとしたところを目撃された！衛兵が来る！`, 'bad');
      changeKarma(-20);
      changeSan(-10);
      G.wantedLevel = (G.wantedLevel||0) + 3;
      addLog(`⚠️ 手配レベルが上昇した（Lv.${G.wantedLevel}）`, 'warn');
      advanceTurn();
      return;
    }
    addLog(`💥 ${building.name}に爆発物を仕掛け、起爆した！`, 'combat');
    addLog(`🔥 建物が爆発した！周囲のNPCが逃げ惑う！`, 'bad');
    changeKarma(-30);
    changeSan(-15);
    changeLuck(-2);
    G.wantedLevel = (G.wantedLevel||0) + 5;
    gainSkillExp('科学', 20);
    // 関連NPCに影響
    if(building.npcId) {
      const npc = NPCS.find(n => n.id === building.npcId);
      if(npc) {
        npc.hp = Math.max(0, npc.hp - building.damage);
        npc.attitude = 'hostile';
        addLog(`💀 ${npc.name}がダメージを受けた（HP: ${npc.hp}）`, 'bad');
      }
    }
    addLog(`🚨 手配レベル: Lv.${G.wantedLevel}（逃げるか自首するか）`, 'warn');
  } else {
    // タイマー爆弾
    removeItem('timer_bomb');
    if(detected) {
      addLog(`🚨 時限爆弾を仕掛けようとしたところを目撃された！`, 'bad');
      changeKarma(-15);
      G.wantedLevel = (G.wantedLevel||0) + 2;
      advanceTurn();
      return;
    }
    G.timerBombs = G.timerBombs || [];
    G.timerBombs.push({ building, fuseAt: G.turn + 3 });
    addLog(`⏱️ ${building.name}に時限爆弾を仕掛けた。3ターン後に爆発する。`, 'warn');
    addLog(`💡 今のうちに現場から離れておくと良い。`, 'dim');
  }
  advanceTurn();
  renderNpcList();
}

// ターン進行時に時限爆弾を起爆（advanceTurnから呼ばれる）
function checkTimerBombs() {
  if(!G.timerBombs || !G.timerBombs.length) return;
  const exploded = G.timerBombs.filter(b => b.fuseAt <= G.turn);
  G.timerBombs = G.timerBombs.filter(b => b.fuseAt > G.turn);
  exploded.forEach(b => {
    addLog(`💥 【爆発】${b.building.name}が爆発した！`, 'death');
    addLog(`🔥 爆煙と悲鳴が街に響き渡る……`, 'bad');
    changeKarma(-30);
    changeLuck(-3);
    G.wantedLevel = (G.wantedLevel||0) + 5;
    if(b.building.npcId) {
      const npc = NPCS.find(n => n.id === b.building.npcId);
      if(npc) {
        npc.hp = Math.max(0, npc.hp - b.building.damage);
        npc.attitude = 'hostile';
      }
    }
    addLog(`🚨 手配レベル: Lv.${G.wantedLevel}`, 'warn');
    renderNpcList();
  });
}

// ── 犯行声明システム ─────────────────────────────────────────
function openCriminalStatementMenu() {
  openModal('📜 犯行声明を送る',
    '声明を送る相手を選んでください。\n「虚偽声明」は実際に何もしていなくても送れます。\n本物の声明は手配レベルが上がりますが、名声（悪名）も上がります。',
    [
      { label: '本物の犯行声明を送る',   fn: () => openRealStatementMenu() },
      { label: '虚偽の犯行声明を送る',   fn: () => openFakeStatementMenu() },
      { label: '匿名で脅迫状を送る',     fn: () => openThreatLetterMenu() },
      { label: 'キャンセル',            fn: () => {} },
    ]
  );
}

function openRealStatementMenu() {
  const opts = STATEMENT_TARGETS.map(t => ({
    label: t.name,
    fn: () => doSendStatement(t, 'real'),
  }));
  opts.push({ label: 'キャンセル', fn: () => {} });
  openModal('📜 本物の犯行声明', '送り先を選んでください。\n手配レベルが大幅に上昇します。', opts);
}

function openFakeStatementMenu() {
  const opts = STATEMENT_TARGETS.map(t => ({
    label: t.name,
    fn: () => doSendStatement(t, 'fake'),
  }));
  opts.push({ label: 'キャンセル', fn: () => {} });
  openModal('📜 虚偽の犯行声明', '送り先を選んでください。\n何もしていなくても混乱を引き起こせます。', opts);
}

function openThreatLetterMenu() {
  const opts = STATEMENT_TARGETS.map(t => ({
    label: t.name,
    fn: () => doSendStatement(t, 'threat'),
  }));
  opts.push({ label: 'キャンセル', fn: () => {} });
  openModal('✉️ 匿名脅迫状', '脅迫状を送る相手を選んでください。', opts);
}

function doSendStatement(target, type) {
  const lv = G.skills;
  // 筆跡・証拠から足がつく確率（弁舌スキルで低下）
  const tracedChance = type === 'real' ? 0.6 - lv['弁舌'].lv * 0.08
                     : type === 'fake' ? 0.3 - lv['弁舌'].lv * 0.05
                     : 0.25 - lv['弁舌'].lv * 0.04;
  const traced = pct(Math.max(0.05, tracedChance));

  if(type === 'real') {
    addLog(`📜 ${target.name}に犯行声明を送った。`, 'warn');
    addLog(`「我こそが街を揺るがす者。次の標的は……」`, 'faith');
    changeKarma(-15);
    G.wantedLevel = (G.wantedLevel||0) + 4;
    G.infamy = (G.infamy||0) + 20; // 悪名
    gainSkillExp('弁舌', 10);
    if(traced) {
      addLog(`🚨 筆跡から足がついた！衛兵が自宅に向かっている！`, 'bad');
      G.wantedLevel += 2;
    } else {
      addLog(`✅ 足はつかなかった。街は恐怖に包まれている。`, 'dim');
    }
  } else if(type === 'fake') {
    addLog(`📜 ${target.name}に虚偽の犯行声明を送った。`, 'warn');
    addLog(`「私が○○事件の犯人だ……」（実際には何もしていない）`, 'dim');
    changeKarma(-5);
    G.wantedLevel = (G.wantedLevel||0) + 2;
    G.infamy = (G.infamy||0) + 8;
    gainSkillExp('弁舌', 5);
    if(traced) {
      addLog(`🚨 虚偽声明だが足がついた！衛兵が動き始めた！`, 'bad');
    } else {
      addLog(`✅ 街は混乱している。誰も真相を知らない。`, 'dim');
    }
    // 別の無実の人が疑われる可能性
    if(pct(0.4)) {
      const victims = ['通りすがりの旅人', '怪しい男', '老人のマルコ'];
      const v = pick(victims);
      addLog(`😱 ${v}が犯人として疑われ始めた……`, 'warn');
    }
  } else {
    // 脅迫状
    addLog(`✉️ ${target.name}に匿名の脅迫状を送った。`, 'warn');
    const demands = [
      '「金貨1000枚を広場の噴水に置け。さもなくば……」',
      '「○○を解放しろ。さもなくば次の爆発が起きる」',
      '「この街から立ち去れ。お前の命はない」',
      '「私の要求を飲まなければ、明日の夜明けに街が燃える」',
    ];
    addLog(pick(demands), 'faith');
    changeKarma(-8);
    G.wantedLevel = (G.wantedLevel||0) + 1;
    G.infamy = (G.infamy||0) + 5;
    gainSkillExp('弁舌', 8);
    if(traced) {
      addLog(`🚨 脅迫状の出所が特定された！衛兵が動き始めた！`, 'bad');
      G.wantedLevel += 2;
    } else {
      addLog(`✅ 匿名性は保たれた。相手は恐怖で震えている。`, 'dim');
    }
  }

  // 手配レベルが高いと逮捕イベント
  if(G.wantedLevel >= 8) {
    addLog(`🚨🚨 手配レベルが危険域！衛兵が本格的に捜索を開始した！`, 'death');
    openModal('⚠️ 緊急事態',
      `手配レベルが${G.wantedLevel}に達した。\n衛兵が街中で捜索している。\n\n逃げるか、自首するか、変装するか……`,
      [
        { label: '変装して逃げる（窃盗Lv.3必要）', fn: () => doDisguise() },
        { label: '街から逃亡する',                 fn: () => doFleeCity() },
        { label: '自首する',                       fn: () => doTurnSelf() },
        { label: 'そのまま街にいる（危険）',        fn: () => addLog('あなたは街に留まることにした。衛兵の目が光っている。','warn') },
      ]
    );
  }
  advanceTurn();
}

// 変装
function doDisguise() {
  if(G.skills['窃盗'].lv < 3) {
    addLog('窃盗スキルが足りず、うまく変装できなかった。', 'bad');
    return;
  }
  G.wantedLevel = Math.max(0, G.wantedLevel - 3);
  addLog('🎭 うまく変装した。手配レベルが下がった。', 'good');
  gainSkillExp('窃盗', 15);
  advanceTurn();
}

// 街から逃亡
function doFleeCity() {
  G.wantedLevel = Math.max(0, G.wantedLevel - 5);
  addLog('🏃 街の外へ逃げた。しばらくは安全だが、戻ると再び追われる。', 'warn');
  changeSan(-5);
  advanceTurn();
}

// 自首
function doTurnSelf() {
  const fine = G.wantedLevel * 50;
  const jailTurns = G.wantedLevel * 2;
  addLog(`🚔 自首した。罰金${fine}Gと${jailTurns}ターンの禁固刑。`, 'warn');
  G.gold = Math.max(0, G.gold - fine);
  G.wantedLevel = 0;
  changeKarma(10);
  G.jailTurns = (G.jailTurns||0) + jailTurns;
  addLog(`⛓️ 牢獄に入れられた。${jailTurns}ターン後に釈放される。`, 'bad');
  advanceTurn();
}

// ── クローン命令メニュー ──────────────────────────────────────
function openCloneOrderMenu() {
  if(!G.clones||G.clones.length===0){ addLog('クローンがいない。','bad'); return; }
  const opts = G.clones.map((c,i)=>({
    label:`クローン${i+1}（${c.sourceNpc||'不明'}、HP:${c.hp}、忠誠:${c.loyalty}）`,
    fn:()=>openCloneCommandMenu(c,i),
  }));
  openModal('クローンに命令する', 'どのクローンに命令しますか？', opts);
}
function openCloneCommandMenu(clone, idx) {
  openModal(`クローン${idx+1}への命令`, '何をさせますか？', [
    {label:'偵察させる', fn:()=>{
      addLog(`クローン${idx+1}が偵察に出た。`, 'result');
      advanceTurn(3);
      if(pct(0.6)) addLog('偵察成功。「北の森に強力なモンスターがいる」', 'result');
      else addLog('クローンが戻ってこなかった……消滅したようだ。', 'bad');
    }},
    {label:'戦わせる', fn:()=>{
      addLog(`クローン${idx+1}を戦闘に送り込んだ。`, 'combat');
      advanceTurn(5);
      const success = pct(0.5 + clone.loyalty/200);
      if(success){ const gain=rnd(50)+20; G.gold+=gain; addLog(`勝利！${gain}G相当の戦利品を持ち帰った。`, 'good'); }
      else { G.clones.splice(idx,1); addLog('クローンが戦闘で消滅した。', 'bad'); }
    }},
    {label:'お金を集めさせる', fn:()=>{
      const amt = rnd(30)+10;
      G.gold+=amt;
      addLog(`クローン${idx+1}が${amt}G集めてきた。`, 'good');
      advanceTurn(2);
    }},
    {label:'解体する', fn:()=>{
      G.clones.splice(idx,1);
      addLog(`クローン${idx+1}を解体した。医術スキルEXP+20。`, 'skill');
      gainSkillExp('医術',20);
    }},
  ]);
}
