// ============================================================
// engine.js  — ゲームコアエンジン
// ============================================================

// ── ユーティリティ ───────────────────────────────────────────
function hasItem(id) { return G.inventory.some(i=>i.id===id && i.qty>0); }
function itemCount(id) { const i=G.inventory.find(x=>x.id===id); return i?i.qty:0; }
function addItem(id, qty=1) {
  const i=G.inventory.find(x=>x.id===id);
  if(i) i.qty+=qty; else G.inventory.push({id,qty});
  updateUI();
}
function removeItem(id, qty=1) {
  const i=G.inventory.find(x=>x.id===id);
  if(i){ i.qty-=qty; if(i.qty<=0) G.inventory=G.inventory.filter(x=>x.id!==id); }
  updateUI();
}
function itemName(id) { return ITEM_NAMES[id]||id; }
function attitudeLabel(a) {
  return {friendly:'友好',neutral:'中立',hostile:'敵対',charmed:'魅了',believer:'信者'}[a]||a;
}
function rnd(n) { return Math.floor(Math.random()*n); }
function pick(arr) { return arr[rnd(arr.length)]; }
function pct(p) { return Math.random()<p; } // p=0〜1

// ── カルマ・SAN・清潔・運 ─────────────────────────────────────
function changeKarma(delta) {
  G.karma = Math.max(-100, Math.min(100, G.karma+delta));
  // 殺人呪い
  if(G.murderCount>=3) changeLuck(-0.5);
  updateKarmaDisplay();
  updateUI();
}
function changeSan(delta) {
  G.san = Math.max(0, Math.min(100, G.san+delta));
  if(G.san<=20) addLog('⚠️ 精神が限界に近い……幻覚が見える。','warn');
  updateUI();
}
function changeLuck(delta) {
  G.luck = Math.max(0, Math.min(100, G.luck+delta));
  updateUI();
}
function changeCleanliness(delta) {
  G.cleanliness = Math.max(0, Math.min(100, G.cleanliness+delta));
  updateUI();
}
function changeHp(delta) {
  G.hp = Math.max(0, Math.min(G.maxHp, G.hp+delta));
  if(G.hp<=0) { addLog('💀 あなたは力尽きた……','death'); }
  updateUI();
}

// ── スキル経験値 ─────────────────────────────────────────────
function gainSkillExp(name, exp) {
  if(!G.skills[name]) return;
  const s=G.skills[name];
  s.exp+=exp;
  const need=s.lv*100;
  if(s.exp>=need){ s.lv++; s.exp-=need; addLog(`✨ 【${name}】がLv.${s.lv}になった！`,'level'); }
  updateUI();
}

// ── ターン進行 ────────────────────────────────────────────────
function advanceTurn(n=1) {
  G.turn+=n;
  // 空腹
  G.hunger=Math.max(0,G.hunger-n*2);
  if(G.hunger<=0) changeHp(-2*n);
  // 清潔度自然低下
  G.cleanliness=Math.max(0,G.cleanliness-n);
  // トイレ切迫
  G.toiletUrgency=Math.min(100,G.toiletUrgency+n*3);
  if(G.toiletUrgency>=100){ doToiletAccident(); }
  // 住居費（50ターンごと）
  if(G.turn%50===0){
    const cost={inn:20,rental:30,apartment:40,own:0,built:0,homeless:0}[G.housing]||0;
    if(cost>0){
      if(G.gold>=cost){ G.gold-=cost; addLog(`🏠 住居費 ${cost}G を支払った。`,'info'); }
      else { addLog('⚠️ 住居費が払えない！追い出されそうだ。','warn'); }
    }
  }
  // 借金返済チェック（100ターンごと）
  if(G.turn%100===0){ checkDebtRepayment(); }
  // 仕事の給料（30ターンごと）
  if(G.jobStatus && G.turn%30===0){ payJobSalary(); }
  // 死体腐敗チェック
  checkCorpseDecay();
  // 時限爆弾起爆チェック
  if(typeof checkTimerBombs==='function') checkTimerBombs();
  // 禁固刑処理
  if(G.jailTurns>0){
    G.jailTurns-=n;
    if(G.jailTurns<=0){
      G.jailTurns=0; G.inPrison=false;
      addLog('⛓️ 釈放された。後ろ指を指されながらも、また街へ戻る。','good');
    }
  }
  // 手配レベル自然減少（20ターンごと）
  if(G.turn%20===0 && G.wantedLevel>0){
    G.wantedLevel=Math.max(0,G.wantedLevel-1);
    if(G.wantedLevel===0) addLog('🟢 手配が解除された。衛兵の追跡が止まった。','good');
  }
  updateUI();
}

function doToiletAccident() {
  G.toiletUrgency=0;
  changeCleanliness(-20);
  changeSan(-10);
  addLog('💦 我慢の限界を超えてしまった……衣服が汚れた。周囲の視線が刺さる。','bad');
}

function checkCorpseDecay() {
  if(!G.corpse) return;
  G.corpse.turns=(G.corpse.turns||0)+1;
  if(G.corpse.turns>=10){
    addLog('🚨 腐臭騒ぎが起きた！衛兵が調査にやってきた。','event');
    G.corpse=null;
    openModal('衛兵の調査',
      '腐臭の通報を受けた衛兵が調査にやってきた。',
      [
        {label:'素直に認める（逮捕）', fn:()=>{ addLog('あなたは逮捕された。','bad'); doPrison(30); }},
        {label:'知らないふりをする', fn:()=>{
          if(pct(0.4)){ addLog('衛兵は疑いながらも立ち去った。','result'); }
          else { addLog('嘘がバレた！逮捕された。','bad'); doPrison(20); }
        }},
      ]
    );
  }
}

function checkDebtRepayment() {
  G.debts.forEach(d=>{
    if(!d.overdue){
      addLog(`⚠️ 借金の返済日が来た。${d.lender}に${d.amount}G返済する必要がある。`,'warn');
      d.overdue=true;
    } else {
      addLog(`🚨 ${d.lender}が取り立てにやってきた！`,'event');
      // 強制取り立て
      const take=Math.min(G.gold, d.amount);
      G.gold-=take; d.amount-=take;
      if(d.amount<=0){
        G.debts=G.debts.filter(x=>x!==d);
        addLog('借金を完済した。','good');
      } else {
        addLog(`${take}G取られた。残り${d.amount}G。`,'bad');
        changeKarma(-5); changeSan(-5);
      }
    }
  });
}

function payJobSalary() {
  const j=G.jobStatus;
  if(!j) return;
  G.gold+=j.salary;
  addLog(`💰 給料 ${j.salary}G を受け取った。（${j.role==='staff'?'社員':'バイト'}）`,'good');
  j.days++;
  // バイト→社員昇格
  if(j.role==='part' && j.days>=5 && pct(0.3)){
    j.role='staff'; j.salary=Math.floor(j.salary*1.5);
    addLog(`🎉 ${j.employer}に社員として採用された！給料が上がった。`,'level');
  }
}

// ── NPC態度変化 ──────────────────────────────────────────────
function changeGoodwill(npc, delta) {
  npc.goodwill=(npc.goodwill||0)+delta;
  if(npc.attitude==='hostile' && npc.goodwill>=100){
    npc.attitude='neutral'; npc.goodwill=0;
    addLog(`${npc.name}の態度が【中立】に戻った。`,'good');
  } else if(npc.attitude==='neutral' && npc.goodwill>=50){
    npc.attitude='friendly'; npc.goodwill=0;
    addLog(`${npc.name}が【友好】になった！`,'level');
  }
  renderNpcList();
}

// ── 刑務所 ───────────────────────────────────────────────────
function doPrison(turns) {
  G.inPrison=true; G.prisonTurns=turns; G.criminalRecord=true;
  addLog(`🔒 ${turns}ターン間、刑務所に収監された。`,'bad');
  changeKarma(-10);
  openModal('収監',
    `あなたは${turns}ターン間、刑務所に収監された。\n前科が付いた。`,
    [{label:'時間を過ごす', fn:()=>{ advanceTurn(turns); G.inPrison=false; addLog('刑務所から出所した。','info'); }}]
  );
}

// ── 基本コマンド（NPC対象） ──────────────────────────────────
function doExamine(npc) {
  addLog(`🔍 ${npc.name}を観察する。${npc.desc}`,'result');
  addLog(`HP: ${npc.hp}/${npc.maxHp} | 態度: ${attitudeLabel(npc.attitude)} | 好感度: ${npc.goodwill}`,'info');
  gainSkillExp('芸術',2); advanceTurn();
}
function doTalk(npc) {
  const d=npc.dialogue.greet;
  addLog(`💬 ${npc.name}「${pick(d)}」`,'result');
  gainSkillExp('交渉',3); advanceTurn();
}
function doGreet(npc) {
  addLog(`👋 ${npc.name}に挨拶する。`,'result');
  if(npc.attitude==='hostile'){
    npc.goodwill=(npc.goodwill||0)+2;
    addLog(`${npc.name}は無視した。（好感度+2 / 必要: ${npc.attitude==='hostile'?100:50}）`,'dim');
    if(npc.goodwill>=100){ npc.attitude='neutral'; npc.goodwill=0; addLog(`${npc.name}の態度が【中立】に戻った。`,'good'); }
  } else {
    changeGoodwill(npc,3);
    addLog(`${npc.name}「やあ。」`,'result');
  }
  gainSkillExp('交渉',2); advanceTurn();
}
function doCompliment(npc) {
  addLog(`😊 ${npc.name}を褒める。`,'result');
  if(npc.attitude==='hostile'){
    npc.goodwill=(npc.goodwill||0)+3;
    addLog(`${npc.name}は鼻で笑った。（好感度+3 / 必要: 100）`,'dim');
    if(npc.goodwill>=100){ npc.attitude='neutral'; npc.goodwill=0; addLog(`${npc.name}の態度が【中立】に戻った。`,'good'); }
  } else {
    changeGoodwill(npc,8);
    addLog(`${npc.name}「ありがとう、嬉しいよ。」`,'result');
  }
  gainSkillExp('交渉',5); advanceTurn();
}
function doInsult(npc) {
  addLog(`😤 ${npc.name}を侮辱する。`,'result');
  npc.attitude='hostile'; npc.goodwill=0;
  addLog(`${npc.name}は激怒した！`,'bad');
  gainSkillExp('交渉',1); advanceTurn();
}
function doAttack(npc, weapon='素手') {
  const atk = {素手:5, 短剣:12, 剣:20, 斧:18, 弓:15}[weapon]||5;
  const bonus = Math.floor(G.skills['戦闘'].lv*1.5);
  const dmg = atk+bonus+rnd(5);
  npc.hp=Math.max(0,npc.hp-dmg);
  npc.attitude='hostile';
  addLog(`⚔️ ${weapon}で${npc.name}に${dmg}ダメージ！（残HP: ${npc.hp}/${npc.maxHp}）`,'combat');
  if(npc.hp<=0){
    addLog(`💀 ${npc.name}を倒した！`,'combat');
    changeKarma(npc.karmaOnKill||0);
    G.murderCount++;
    if(G.murderCount>=3) addLog('⚠️ 血の呪いが降りかかる……運が下がった。','warn');
    changeLuck(-1);
    // ドロップ
    (npc.drops||[]).forEach(id=>{ if(pct(0.5)){ addItem(id); addLog(`  → ${itemName(id)}を入手！`,'item'); }});
    G.corpse={name:npc.name, turns:0};
    npc.hp=0;
  } else {
    // 反撃
    const counterDmg=Math.max(1,Math.floor((npc.maxHp/10)+rnd(5)));
    changeHp(-counterDmg);
    addLog(`  → ${npc.name}の反撃！${counterDmg}ダメージを受けた。`,'bad');
  }
  gainSkillExp('戦闘',8); advanceTurn();
}
function doFlee(npc) {
  if(pct(0.6)){
    addLog(`🏃 ${npc.name}から逃げた！`,'result');
  } else {
    addLog(`🏃 逃げようとしたが失敗！${npc.name}に殴られた。`,'bad');
    changeHp(-rnd(10)-3);
  }
  advanceTurn();
}
function doThreaten(npc) {
  const lv=G.skills['交渉'].lv;
  if(pct(0.2+lv*0.05)){
    const gold=rnd(30)+10;
    G.gold+=gold; addLog(`😈 ${npc.name}を脅した。${gold}G を奪った。`,'crime');
    changeKarma(-8); npc.attitude='hostile';
  } else {
    addLog(`😈 脅したが、${npc.name}は屈しなかった。`,'bad');
    npc.attitude='hostile';
  }
  gainSkillExp('交渉',5); advanceTurn();
}
function doBribe(npc) {
  const amount=50;
  if(!hasItem('gold_coin') && G.gold<amount){ addLog('お金が足りない。','bad'); return; }
  G.gold-=amount;
  addLog(`💰 ${npc.name}に${amount}G渡した。`,'result');
  changeGoodwill(npc,20);
  if(npc.id==='guard') addLog('衛兵は懐に金をしまい、見て見ぬふりをした。','result');
  gainSkillExp('交渉',5); advanceTurn();
}
function doNegotiate(npc) {
  const lv=G.skills['交渉'].lv;
  if(pct(0.2+lv*0.08)){
    addLog(`🤝 ${npc.name}との交渉が成立した！`,'good');
    changeGoodwill(npc,10);
    gainSkillExp('交渉',10);
  } else {
    addLog(`🤝 ${npc.name}との交渉は決裂した。`,'bad');
  }
  advanceTurn();
}
function doPerform(npc) {
  const lv=G.skills['演奏'].lv;
  const quality=['音程が外れた','まあまあの','なかなかの','素晴らしい'][Math.min(3,lv-1)];
  addLog(`🎵 ${quality}演奏をした。`,'result');
  if(lv>=3){ G.gold+=rnd(20)+5; addLog('  → 観客からチップをもらった！','good'); }
  changeGoodwill(npc,5);
  gainSkillExp('演奏',8); advanceTurn();
}
function doCookGive(npc) {
  if(!hasItem('bread')){ addLog('食材がない。','bad'); return; }
  removeItem('bread');
  addLog(`🍞 ${npc.name}に料理を振る舞った。`,'result');
  changeGoodwill(npc,12);
  gainSkillExp('料理',8); advanceTurn();
}
function doHeal(npc) {
  const lv=G.skills['医術'].lv;
  const heal=lv*5+rnd(10);
  npc.hp=Math.min(npc.maxHp, npc.hp+heal);
  addLog(`💊 ${npc.name}を治療した。HP+${heal}。`,'good');
  changeGoodwill(npc,15);
  gainSkillExp('医術',10); advanceTurn();
}
function doCastFire(npc) {
  const lv=G.skills['魔法'].lv;
  if(lv<2){ addLog('魔法スキルが足りない（Lv.2必要）。','bad'); return; }
  const dmg=lv*8+rnd(10);
  npc.hp=Math.max(0,npc.hp-dmg);
  npc.attitude='hostile';
  addLog(`🔥 炎魔法！${npc.name}に${dmg}ダメージ！`,'combat');
  if(npc.hp<=0){ addLog(`💀 ${npc.name}を倒した！`,'combat'); changeKarma(npc.karmaOnKill||0); G.murderCount++; }
  gainSkillExp('魔法',10); advanceTurn();
}
function doCastCharm(npc) {
  const lv=G.skills['魅力'].lv;
  if(lv<3){ addLog('魅力スキルが足りない（Lv.3必要）。','bad'); return; }
  if(pct(0.2+lv*0.08)){
    npc.attitude='charmed';
    addLog(`💜 ${npc.name}に魅了魔法が成功！命令できるようになった。`,'magic');
  } else {
    addLog(`💜 ${npc.name}は魅了に抵抗した。`,'bad');
  }
  gainSkillExp('魅力',12); advanceTurn();
}
function doPickpocket(npc) {
  const lv=G.skills['窃盗'].lv;
  const success=pct(0.1+lv*0.08);
  if(success){
    const gold=rnd(30)+5;
    G.gold+=gold;
    addLog(`🤏 ${npc.name}のスリに成功！${gold}G入手。`,'crime');
    changeKarma(-5);
  } else {
    addLog(`🤏 ${npc.name}のスリに失敗！見つかった！`,'bad');
    npc.attitude='hostile'; changeKarma(-8);
    if(npc.id==='guard') doPrison(5);
  }
  gainSkillExp('窃盗',8); advanceTurn();
}
function doPoisonFood(npc) {
  if(!hasItem('poison_herb') && !hasItem('poison_potion')){ addLog('毒がない。','bad'); return; }
  if(hasItem('poison_potion')) removeItem('poison_potion');
  else removeItem('poison_herb');
  addLog(`☠️ ${npc.name}の食事に毒を盛った。`,'crime');
  changeKarma(-15);
  setTimeout(()=>{
    npc.hp=Math.max(0,npc.hp-rnd(20)-10);
    addLog(`☠️ 毒が回った！${npc.name}のHPが減った。`,'bad');
    if(npc.hp<=0){ addLog(`💀 ${npc.name}は毒で死んだ。`,'combat'); G.murderCount++; }
    updateUI();
  },3000);
  gainSkillExp('医術',5); advanceTurn();
}
function doDissect(npc) {
  if(npc.hp>0){ addLog('生きているNPCは解体できない。','bad'); return; }
  addLog(`🔪 ${npc.name}の死体を解体した。`,'crime');
  addItem('bone'); addItem('slime_core');
  changeKarma(-10); changeSan(-5);
  G.corpse=null;
  gainSkillExp('医術',15); advanceTurn();
}
function doPrayFor(npc) {
  addLog(`🙏 ${npc.name}のために祈った。`,'faith');
  changeGoodwill(npc,5); changeKarma(2);
  gainSkillExp('信仰',5); advanceTurn();
}
function doOfferItem(npc) {
  openItemModal('捧げるアイテムを選択', (id)=>{
    removeItem(id);
    addLog(`🎁 ${npc.name}に${itemName(id)}を捧げた。`,'faith');
    changeGoodwill(npc,15); changeKarma(3);
    gainSkillExp('信仰',8); advanceTurn();
  });
}
function doGiveItem(npc) {
  openItemModal('渡すアイテムを選択', (id)=>{
    removeItem(id);
    addLog(`🎁 ${npc.name}に${itemName(id)}を渡した。`,'result');
    changeGoodwill(npc,10); advanceTurn();
  });
}
function doBuy(npc) {
  if(!npc.shop){ addLog('ここでは何も売っていない。','bad'); return; }
  const items=npc.shop.filter(s=>s.qty>0);
  if(!items.length){ addLog('在庫がない。','bad'); return; }
  const body=items.map(s=>`${s.name} — ${s.price}G`).join('\n');
  openModal('購入',body, items.map(s=>({
    label:`${s.name}（${s.price}G）`,
    fn:()=>{
      if(G.gold<s.price){ addLog('お金が足りない。','bad'); return; }
      G.gold-=s.price; s.qty--; addItem(s.id);
      addLog(`🛒 ${s.name}を${s.price}Gで購入した。`,'item');
      updateUI();
    }
  })));
}
function doUsePotion() {
  if(!hasItem('potion')){ addLog('回復薬がない。','bad'); return; }
  removeItem('potion');
  const heal=rnd(20)+15;
  changeHp(heal);
  addLog(`💊 回復薬を使った。HP+${heal}。`,'good');
  advanceTurn();
}
function doAskStory(npc) {
  const d=npc.dialogue.story;
  if(!d||!d.length){ addLog(`${npc.name}は特に話すことがないようだ。`,'dim'); return; }
  addLog(`📖 ${npc.name}「${pick(d)}」`,'result');
  gainSkillExp('交渉',3); advanceTurn();
}
function doAskHeal(npc) {
  if(npc.id!=='priest'){ addLog('この人物には治療を頼めない。','bad'); return; }
  const cost=30;
  if(G.gold<cost){ addLog('お金が足りない。','bad'); return; }
  G.gold-=cost;
  const heal=rnd(30)+20;
  changeHp(heal);
  addLog(`💊 ${npc.name}に治療してもらった。HP+${heal}。（${cost}G）`,'good');
  advanceTurn();
}
function doConfess(npc) {
  if(npc.id!=='priest'){ addLog('この人物には懺悔できない。','bad'); return; }
  addLog(`🙏 ${npc.name}に懺悔した。`,'faith');
  changeKarma(5); changeSan(5);
  gainSkillExp('信仰',5); advanceTurn();
}
function doAskInfo(npc) {
  addLog(`🗣️ ${npc.name}に情報を聞いた。`,'result');
  const infos=[
    '「北の森にゴブリンの巣があるらしい。」',
    '「最近、街の外で賞金首が目撃されたそうだ。」',
    '「コロシアムで大きな試合があるらしい。」',
    '「ギルドで新しい依頼が出たと聞いた。」',
    '「金貸しのグリードには気をつけろ。利子が恐ろしい。」',
  ];
  addLog(pick(infos),'result');
  gainSkillExp('交渉',3); advanceTurn();
}
function doSurrender(npc) {
  if(npc.id!=='guard'){ addLog('この人物には自首できない。','bad'); return; }
  addLog('🚔 衛兵に自首した。','result');
  changeKarma(5);
  doPrison(10);
}
function doJoinCrime(npc) {
  if(npc.id!=='thief'){ addLog('この人物には犯罪の依頼を頼めない。','bad'); return; }
  addLog(`🦹 ${npc.name}に犯罪の依頼を頼んだ。`,'crime');
  if(pct(0.5)){
    const gold=rnd(80)+50;
    G.gold+=gold; changeKarma(-20);
    addLog(`  → 成功！${gold}G入手。`,'good');
  } else {
    addLog('  → 失敗。衛兵に通報された！','bad');
    doPrison(15);
  }
  gainSkillExp('窃盗',10); advanceTurn();
}
function doSellStolen(npc) {
  if(!npc.isFence){ addLog('この人物は盗品を買い取らない。','bad'); return; }
  if(!hasItem('stolen_goods')){ addLog('盗品がない。','bad'); return; }
  removeItem('stolen_goods');
  const price=rnd(40)+20;
  G.gold+=price;
  addLog(`💰 盗品を${price}Gで売った。`,'crime');
  changeKarma(-3); advanceTurn();
}
function doNegotiatePrice(npc) {
  if(!npc.shop){ addLog('ここでは交渉できない。','bad'); return; }
  const lv=G.skills['交渉'].lv;
  if(pct(0.15+lv*0.07)){
    addLog(`🤝 ${npc.name}との値引き交渉が成功！次の購入が10%引きになった。`,'good');
    npc._discount=0.1;
  } else {
    addLog(`🤝 ${npc.name}は値引きを断った。`,'bad');
  }
  gainSkillExp('交渉',6); advanceTurn();
}
function doAskHire(npc) {
  if(!npc.jobSlots){ addLog('ここでは雇ってもらえない。','bad'); return; }
  if(G.jobStatus){ addLog('すでに仕事をしている。','bad'); return; }
  addLog(`💼 ${npc.name}に雇ってほしいと頼んだ。`,'result');
  const d=npc.dialogue.hire;
  if(d) addLog(`${npc.name}「${pick(d)}」`,'result');
  if(pct(0.5)){
    G.jobStatus={employer:npc.name, role:'part', days:0, salary:30};
    addLog(`✅ バイトとして雇われた！30ターンごとに30G給料が入る。`,'good');
  } else {
    addLog('今は人手が足りているようだ。','dim');
  }
  advanceTurn();
}
function doEnterShop(npc) {
  if(npc.isOpen===false){ addLog(`${npc.name}の店は閉まっている。`,'dim'); return; }
  addLog(`🚪 ${npc.name}の店に入った。`,'result');
  doBuy(npc);
  advanceTurn();
}
function doStealFromShop(npc) {
  if(!npc.shop){ addLog('ここでは盗めない。','bad'); return; }
  const lv=G.skills['窃盗'].lv;
  if(pct(0.1+lv*0.07)){
    const item=npc.shop[rnd(npc.shop.length)];
    addItem(item.id);
    addLog(`🤏 ${npc.name}の店から${item.name}を盗んだ！`,'crime');
    changeKarma(-10);
  } else {
    addLog(`🤏 ${npc.name}の店での万引きが失敗！見つかった！`,'bad');
    npc.attitude='hostile'; changeKarma(-15);
    doPrison(8);
  }
  gainSkillExp('窃盗',10); advanceTurn();
}
function doGraffitiShop(npc) {
  addLog(`✏️ ${npc.name}の店に落書きをした。`,'crime');
  changeKarma(-3); npc.goodwill=(npc.goodwill||0)-10;
  gainSkillExp('芸術',3); advanceTurn();
}
function doCleanShop(npc) {
  addLog(`🧹 ${npc.name}の店を掃除した。`,'good');
  changeKarma(3); changeGoodwill(npc,10);
  gainSkillExp('交渉',3); advanceTurn();
}
function doFireShop(npc) {
  const lv=G.skills['魔法'].lv;
  if(lv<1){ addLog('魔法スキルが足りない。','bad'); return; }
  addLog(`🔥 ${npc.name}の店に火をつけた！`,'crime');
  changeKarma(-30); changeSan(-10);
  npc.isOpen=false;
  addLog('店が燃えた！衛兵が駆けつけてきた。','event');
  doPrison(30);
  gainSkillExp('魔法',5); advanceTurn();
}
function doBreakShop(npc) {
  addLog(`🔨 ${npc.name}の店を壊した。`,'crime');
  changeKarma(-20); npc.isOpen=false;
  addLog('衛兵が来た！','event');
  doPrison(15);
  gainSkillExp('戦闘',5); advanceTurn();
}

// ── 伝道コマンド ─────────────────────────────────────────────
function doPreach(npc) {
  const lv=G.skills['信仰'].lv;
  npc.preachCount=(npc.preachCount||0)+1;
  const d=npc.dialogue.preach;
  if(d) addLog(`📢 ${npc.name}に神の教えを説いた。\n${npc.name}「${pick(d)}」`,'faith');
  const convertChance=0.05+lv*0.03;
  if(!npc.isBeliever && pct(convertChance)){
    npc.isBeliever=true; npc.attitude='believer';
    const d2=npc.dialogue.preach_convert;
    if(d2) addLog(`✨ ${npc.name}「${pick(d2)}」\n${npc.name}は信者になった！`,'level');
    changeKarma(10);
  } else {
    addLog(`（信者化まで: ${Math.max(0,Math.ceil((1-convertChance*npc.preachCount)*20))}回程度）`,'dim');
  }
  gainSkillExp('信仰',5); gainSkillExp('弁舌',5); advanceTurn();
}

// ── 信者命令 ─────────────────────────────────────────────────
function doOrderSpread(npc) {
  if(!npc.isBeliever){ addLog('信者でないと命令できない。','bad'); return; }
  addLog(`📢 ${npc.name}に布教させた。`,'faith');
  const newBeliever=pct(0.3);
  if(newBeliever){ addLog('  → 新たな信者が生まれた！','level'); changeKarma(5); }
  gainSkillExp('信仰',8); advanceTurn();
}
function doOrderTithe(npc) {
  if(!npc.isBeliever){ addLog('信者でないと命令できない。','bad'); return; }
  const gold=rnd(30)+10;
  G.gold+=gold;
  addLog(`💰 ${npc.name}から上納金${gold}Gを受け取った。`,'faith');
  gainSkillExp('信仰',5); advanceTurn();
}
function doOrderFamily(npc) {
  if(!npc.isBeliever){ addLog('信者でないと命令できない。','bad'); return; }
  addLog(`👨‍👩‍👧 ${npc.name}に家族を入信させるよう命じた。`,'faith');
  if(pct(0.4)){ addLog('  → 家族も信者になった！','level'); changeKarma(8); }
  else { addLog('  → 家族は入信を断ったようだ。','dim'); }
  gainSkillExp('信仰',6); advanceTurn();
}
function doOrderOffering(npc) {
  if(!npc.isBeliever){ addLog('信者でないと命令できない。','bad'); return; }
  const offerings=['パン','金貨','花','ロープ'];
  const item=pick(offerings);
  addLog(`🎁 ${npc.name}が${item}を捧げ物として持ってきた。`,'faith');
  addItem(item==='金貨'?'gold_coin':item==='パン'?'bread':item==='花'?'flower':'rope');
  gainSkillExp('信仰',5); advanceTurn();
}
function doOrderSuicide(npc) {
  if(!npc.isBeliever){ addLog('信者でないと命令できない。','bad'); return; }
  const lv=G.skills['信仰'].lv;
  if(lv<8){ addLog('信仰スキルが足りない（Lv.8必要）。','bad'); return; }
  openModal('自害命令',
    `本当に${npc.name}に自害を命じますか？\nこれは取り消せません。カルマが大きく変動します。`,
    [
      {label:'命じる', fn:()=>{
        npc.hp=0; G.murderCount++;
        addLog(`💀 ${npc.name}は神への捧げ物として自ら命を絶った……`,'death');
        changeKarma(-50); changeSan(-20);
        G.corpse={name:npc.name, turns:0};
      }},
      {label:'やめる', fn:()=>{ addLog('命令を取り消した。','dim'); }},
    ]
  );
}

// ── 魅了命令 ─────────────────────────────────────────────────
function doCharmOrderFollow(npc) {
  if(npc.attitude!=='charmed'){ addLog('魅了状態でないと命令できない。','bad'); return; }
  addLog(`💜 ${npc.name}についてこさせた。`,'magic');
  advanceTurn();
}
function doCharmOrderGive(npc) {
  if(npc.attitude!=='charmed'){ addLog('魅了状態でないと命令できない。','bad'); return; }
  const gold=rnd(50)+20;
  G.gold+=gold;
  addLog(`💜 ${npc.name}は魅了されて持ち物を渡してきた。${gold}G入手。`,'magic');
  changeKarma(-5); advanceTurn();
}
function doCharmOrderAttack(npc) {
  if(npc.attitude!=='charmed'){ addLog('魅了状態でないと命令できない。','bad'); return; }
  addLog(`💜 ${npc.name}に他のNPCを攻撃させた。`,'magic');
  changeKarma(-10); advanceTurn();
}
function doCharmOrderUndress(npc) {
  if(npc.attitude!=='charmed'){ addLog('魅了状態でないと命令できない。','bad'); return; }
  addLog(`💜 ${npc.name}に服を脱ぐよう命じた。${npc.name}は従った……`,'magic');
  changeSan(-5); changeKarma(-8); advanceTurn();
}

// ── 掲示板コマンド ────────────────────────────────────────────
const BOARD_STATE = { condition:'normal', infoLevel:0 };
function buildBoardCommands() {
  return [
    {label:'掲示を読む',       color:'dim',    fn:()=>doBoardRead()},
    {label:'デタラメ情報を書く', color:'crime',  fn:()=>doBoardFake()},
    {label:'落書きをする',     color:'crime',  fn:()=>doBoardGraffiti()},
    {label:'掲示板を壊す',     color:'combat', fn:()=>doBoardBreak()},
    {label:'掲示板を修繕する', color:'good',   fn:()=>doBoardRepair()},
    {label:'掲示板に火をつける',color:'combat', fn:()=>doBoardFire()},
    {label:'担当の張り紙を出す',color:'item',   fn:()=>doBoardPost()},
    {label:'芸術作品を貼る',   color:'skill',  fn:()=>doBoardArt()},
    {label:'手配書を確認する', color:'dim',    fn:()=>doBoardBounty()},
    {label:'求人情報を見る',   color:'dim',    fn:()=>doBoardJob()},
    {label:'情報を消す',       color:'crime',  fn:()=>doBoardErase()},
    {label:'掲示板を磨く',     color:'good',   fn:()=>doBoardPolish()},
    {label:'ビラを貼る',       color:'skill',  fn:()=>doBoardFlyer()},
    {label:'掲示板を写真に撮る',color:'skill',  fn:()=>doBoardPhoto()},
    {label:'掲示板を調べる',   color:'dim',    fn:()=>doExamineBoard()},
  ];
}
function doBoardRead() {
  const msgs=['「本日の市場：野菜が豊作。」','「賞金首：ダガー、報酬200G。」','「ギルドで新規依頼受付中。」','「コロシアム大会、明日開催！」'];
  addLog(`📋 掲示板を読んだ。\n${pick(msgs)}`,'result');
  gainSkillExp('交渉',2); advanceTurn();
}
function doBoardFake() {
  addLog('📋 掲示板にデタラメな情報を書いた。','crime');
  changeKarma(-5); BOARD_STATE.condition='dirty';
  gainSkillExp('弁舌',3); advanceTurn();
}
function doBoardGraffiti() {
  addLog('✏️ 掲示板に落書きをした。','crime');
  changeKarma(-3); BOARD_STATE.condition='dirty';
  gainSkillExp('芸術',3); advanceTurn();
}
function doBoardBreak() {
  addLog('🔨 掲示板を壊した！','crime');
  changeKarma(-8); BOARD_STATE.condition='broken';
  gainSkillExp('戦闘',5); advanceTurn();
}
function doBoardRepair() {
  if(BOARD_STATE.condition==='normal'){ addLog('掲示板は壊れていない。','dim'); return; }
  addLog('🔧 掲示板を修繕した。','good');
  changeKarma(5); BOARD_STATE.condition='normal';
  gainSkillExp('建築',5); advanceTurn();
}
function doBoardFire() {
  if(G.skills['魔法'].lv<1){ addLog('魔法スキルが足りない。','bad'); return; }
  addLog('🔥 掲示板に火をつけた！','crime');
  changeKarma(-12); BOARD_STATE.condition='broken';
  addLog('衛兵が駆けつけてきた！','event');
  doPrison(10);
  gainSkillExp('魔法',5); advanceTurn();
}
function doBoardPost() {
  if(G.gold<20){ addLog('お金が足りない（20G必要）。','bad'); return; }
  G.gold-=20; changeKarma(3);
  addLog('📋 担当の張り紙を出した。（20G）','good');
  advanceTurn();
}
function doBoardArt() {
  if(G.skills['演奏'].lv<2){ addLog('演奏スキルが足りない（Lv.2必要）。','bad'); return; }
  G.gold+=3; changeKarma(2);
  addLog('🎨 芸術作品を掲示板に貼った。3G入手。','good');
  gainSkillExp('芸術',8); advanceTurn();
}
function doBoardBounty() {
  addLog('🎯 手配書を確認した。\n「ダガー（剣士）— 報酬200G、生死不問」','result');
  advanceTurn();
}
function doBoardJob() {
  addLog('💼 求人情報を見た。\n「荷運びバイト募集 — 日給25G」\n「護衛依頼 — 報酬100G」','result');
  advanceTurn();
}
function doBoardErase() {
  addLog('🗑️ 掲示板の情報を消した。','crime');
  changeKarma(-4); advanceTurn();
}
function doBoardPolish() {
  addLog('✨ 掲示板を磨いた。','good');
  changeKarma(2); gainSkillExp('建築',2); advanceTurn();
}
function doBoardFlyer() {
  if(!hasItem('pamphlet')){ addLog('ビラがない。','bad'); return; }
  removeItem('pamphlet');
  addLog('📄 ビラを掲示板に貼った。','result');
  gainSkillExp('弁舌',5); advanceTurn();
}
function doBoardPhoto() {
  if(!hasItem('camera')){ addLog('カメラがない。','bad'); return; }
  addLog('📷 掲示板を写真に撮った。','result');
  gainSkillExp('芸術',3); advanceTurn();
}
function doExamineBoard() {
  addLog(`🔍 掲示板を調べた。状態: ${BOARD_STATE.condition}`,'result');
  advanceTurn();
}

// ── 自分自身コマンド ──────────────────────────────────────────
function buildSelfCommands() {
  return [
    // 食事・飲み物
    {label:'パンを食べる',     color:'item',   fn:()=>doEatBread()},
    {label:'エールを飲む',     color:'item',   fn:()=>doDrinkAle()},
    {label:'回復薬を飲む',     color:'item',   fn:()=>doUsePotion()},
    // 戦闘・危険
    {label:'自傷する',         color:'combat', fn:()=>doSelfHarm()},
    {label:'自害する',         color:'combat', fn:()=>doSuicide()},
    // スキル練習
    {label:'身体を鍛える',     color:'skill',  fn:()=>doExercise()},
    {label:'魔法を練習する',   color:'skill',  fn:()=>doPracticeMagic()},
    {label:'リュートを練習する',color:'skill', fn:()=>doPracticeLute()},
    {label:'料理を練習する',   color:'skill',  fn:()=>doPracticeCook()},
    {label:'窃盗を練習する',   color:'skill',  fn:()=>doPracticeTheft()},
    {label:'解剖を練習する',   color:'skill',  fn:()=>doPracticeAnatomy()},
    {label:'弁舌を練習する',   color:'skill',  fn:()=>doPracticeSpeech()},
    {label:'鍛冶を練習する',   color:'skill',  fn:()=>doPracticeSmith()},
    // 信仰・精神
    {label:'瞑想する',         color:'faith',  fn:()=>doMeditate()},
    {label:'一人で神に祈る',   color:'faith',  fn:()=>doPrayAlone()},
    // 基本行動
    {label:'休憩する',         color:'dim',    fn:()=>doRest()},
    {label:'眠る',             color:'dim',    fn:()=>doSleep()},
    {label:'周囲を見回す',     color:'dim',    fn:()=>doLookAround()},
    {label:'日記を書く',       color:'dim',    fn:()=>doWriteDiary()},
    {label:'所持金を数える',   color:'dim',    fn:()=>doCountGold()},
    // 社会行動
    {label:'大声で叫ぶ',       color:'result', fn:()=>doShout()},
    {label:'コインを投げる',   color:'item',   fn:()=>doTossCoin()},
    {label:'落ちているものを拾う',color:'dim', fn:()=>doPickup()},
    {label:'大声で歌う',       color:'skill',  fn:()=>doSingInStreet(true)},
    {label:'踊る',             color:'skill',  fn:()=>doDance()},
    {label:'演説する',         color:'skill',  fn:()=>doSpeech(hasItem('microphone'))},
    {label:'通行人にぶつかる', color:'crime',  fn:()=>doBumpIntoStranger()},
    {label:'人混みでスリ',     color:'crime',  fn:()=>doPickpocketCrowd()},
    // ゴミ
    {label:'ゴミを拾う',       color:'good',   fn:()=>doPickupTrash()},
    {label:'ゴミを捨てる',     color:'crime',  fn:()=>doThrowTrash()},
    {label:'ゴミを燃やす',     color:'crime',  fn:()=>doBurnTrash()},
    {label:'ゴミ箱に捨てる',   color:'good',   fn:()=>doPutTrashInBin()},
    // 服装
    {label:'上着を脱ぐ',       color:'dim',    fn:()=>doUndress('upper')},
    {label:'ズボンを脱ぐ',     color:'dim',    fn:()=>doUndress('lower')},
    {label:'靴を脱ぐ',         color:'dim',    fn:()=>doUndress('feet')},
    {label:'帽子を脱ぐ',       color:'dim',    fn:()=>doUndress('head')},
    {label:'手袋を脱ぐ',       color:'dim',    fn:()=>doUndress('hands')},
    {label:'物乞いをする',     color:'crime',  fn:()=>doBeg()},
    {label:'全裸で歩く',       color:'crime',  fn:()=>doWalkNaked()},
    // トイレ
    {label:'公衆トイレに行く', color:'dim',    fn:()=>doToiletPublic()},
    {label:'路地裏で用を足す', color:'crime',  fn:()=>doToiletOutdoorHidden()},
    {label:'街中で堂々と用を足す',color:'crime',fn:()=>doToiletOutdoorPublic()},
    // 風呂・清潔
    {label:'自宅でお風呂',     color:'dim',    fn:()=>doBathHome()},
    {label:'宿屋のシャワー',   color:'dim',    fn:()=>doShowerInn()},
    {label:'野外で入浴する',   color:'crime',  fn:()=>doBathOutdoor()},
    {label:'噴水で沐浴する',   color:'crime',  fn:()=>doWashFountain()},
    {label:'ウェットシートで拭く',color:'dim', fn:()=>doWipeWetSheet()},
    // 掘削・花壇
    {label:'石畳を掘る',       color:'skill',  fn:()=>doDigStreet()},
    {label:'花壇を掘り返す',   color:'crime',  fn:()=>doDigFlowerBed()},
    {label:'花壇に水をあげる', color:'good',   fn:()=>doWaterFlowerBed()},
    {label:'花壇の花を摘む',   color:'dim',    fn:()=>doPickFlower()},
    {label:'石油を掘る',       color:'skill',  fn:()=>doDigOil()},
    // カメラ
    {label:'写真を撮る',       color:'skill',  fn:()=>doTakePhoto('風景')},
    {label:'盗撮する',         color:'crime',  fn:()=>doTakePhoto('盗撮')},
    {label:'写真を売る',       color:'item',   fn:()=>doSellPhoto()},
    // クラフト
    {label:'包帯を作る',       color:'skill',  fn:()=>doCraft('bandage')},
    {label:'毒薬を作る',       color:'crime',  fn:()=>doCraft('poison_potion')},
    {label:'料理を作る',       color:'skill',  fn:()=>doCraft('meal')},
    {label:'松明を作る',       color:'skill',  fn:()=>doCraft('torch')},
    {label:'写真集を作る',     color:'skill',  fn:()=>doCraft('photo_album')},
    // 死体処理
    {label:'死体を解体する',   color:'crime',  fn:()=>doDisposeCorpse('dissect')},
    {label:'山に遺棄する',     color:'crime',  fn:()=>doDisposeCorpse('mountain')},
    {label:'海に沈める',       color:'crime',  fn:()=>doDisposeCorpse('sea')},
    // 宗教・教団
    {label:'宗教・教団メニュー',   color:'faith',  fn:()=>openCultMenu()},
    {label:'宗教団体に入る',     color:'faith',  fn:()=>openJoinCultMenu()},
    {label:'新興宗教を立ち上げる', color:'faith', fn:()=>openFoundCultMenu(), req:()=>G.skills['信仰'].lv>=3},
    {label:'教団を管理する',     color:'faith',  fn:()=>openOwnCultMenu(),    req:()=>!!G.cult},
    // 罠
    {label:'罠メニュー',         color:'skill',  fn:()=>openTrapMenu()},
    {label:'罠を作る',           color:'skill',  fn:()=>openCraftTrapMenu()},
    {label:'罠を買う',           color:'item',   fn:()=>openBuyTrapMenu()},
    {label:'罠を仕掛ける',       color:'crime',  fn:()=>openSetTrapMenu(),    req:()=>G.trapInventory.length>0},
    {label:'仕掛けた罠を確認',   color:'dim',    fn:()=>checkMyTraps()},
    {label:'罠を回収する',       color:'dim',    fn:()=>retrieveTraps(),      req:()=>G.traps.length>0},
    // 科学・化学
    {label:'科学・化学メニュー',   color:'skill',  fn:()=>openScienceMenu()},
    {label:'研究室を作る',       color:'skill',  fn:()=>buildLab(),           req:()=>G.skills['建築'].lv>=3&&!G.scienceLab},
    {label:'化学実験をする',     color:'skill',  fn:()=>openChemMenu(),       req:()=>G.skills['化学'].lv>=1},
    {label:'爆発物を製造',       color:'combat', fn:()=>craftExplosive(),     req:()=>G.skills['科学'].lv>=3},
    {label:'クローンを生成する',   color:'skill',  fn:()=>openCloneMenu(),      req:()=>G.scienceLab&&G.skills['科学'].lv>=6},
    {label:'人体錬成を試みる',   color:'combat', fn:()=>doHumanTransmutation(),req:()=>G.skills['錬金術'].lv>=5},
    {label:'賢者の石を探求',   color:'faith',  fn:()=>doPhilosopherStone(), req:()=>G.skills['錬金術'].lv>=8},
    // クローンに命令する
    {label:'クローンに命令',       color:'skill',  fn:()=>openCloneOrderMenu(), req:()=>G.clones.length>0},
    // 建物爆破・犯行声明
    {label:'建物に爆発物を仕掛ける', color:'combat', fn:()=>openBuildingBombMenu(), req:()=>hasItem('explosive')||hasItem('timer_bomb')},
    {label:'犯行声明を送る',       color:'crime',  fn:()=>openCriminalStatementMenu()},
    {label:'脅迫状を送る',         color:'crime',  fn:()=>openThreatLetterMenu()},
    {label:'手配レベルを確認',   color:'dim',    fn:()=>addLog(`🚨 手配レベル: Lv.${G.wantedLevel||0}。${(G.wantedLevel||0)===0?'安全。':(G.wantedLevel||0)<4?'要注意。':(G.wantedLevel||0)<8?'危険！衛兵が動いている。':'極度の危機！即時逃亡を。'}`,'warn')},
    {label:'変装する',           color:'skill',  fn:()=>doDisguise(),         req:()=>(G.wantedLevel||0)>0&&G.skills['窃盗'].lv>=3},
    {label:'街から逃亡する',     color:'combat', fn:()=>doFleeCity(),         req:()=>(G.wantedLevel||0)>0},
  ];
}

// ── 自分コマンド実装 ──────────────────────────────────────────
function doEatBread() {
  if(!hasItem('bread')){ addLog('パンがない。','bad'); return; }
  removeItem('bread');
  G.hunger=Math.min(100,G.hunger+30);
  addLog('🍞 パンを食べた。空腹が和らいだ。','item');
  advanceTurn();
}
function doDrinkAle() {
  if(!hasItem('ale')){ addLog('エールがない。','bad'); return; }
  removeItem('ale');
  G.hunger=Math.min(100,G.hunger+10);
  changeSan(5);
  addLog('🍺 エールを飲んだ。ほろ酔いになった。','item');
  advanceTurn();
}
function doSelfHarm() {
  const dmg=rnd(8)+3;
  changeHp(-dmg);
  changeSan(-10);
  addLog(`🩸 自傷した。${dmg}ダメージ。精神が削られる……`,'bad');
  advanceTurn();
}
function doSuicide() {
  openModal('自害',
    '本当に自害しますか？ゲームオーバーになります。',
    [
      {label:'実行する', fn:()=>{ G.hp=0; addLog('💀 あなたは自ら命を絶った。','death'); updateUI(); }},
      {label:'やめる', fn:()=>{ addLog('踏みとどまった。','dim'); }},
    ]
  );
}
function doExercise() {
  G.maxHp=Math.min(200,G.maxHp+1);
  changeSan(3);
  addLog('💪 身体を鍛えた。最大HPが少し上がった。','skill');
  gainSkillExp('戦闘',5); gainSkillExp('運動',8); advanceTurn();
}
function doPracticeMagic() {
  addLog('✨ 魔法を練習した。','skill');
  gainSkillExp('魔法',8); advanceTurn();
}
function doPracticeLute() {
  addLog('🎵 リュートを練習した。','skill');
  gainSkillExp('演奏',8); advanceTurn();
}
function doPracticeCook() {
  addLog('🍳 料理を練習した。','skill');
  gainSkillExp('料理',8); advanceTurn();
}
function doPracticeTheft() {
  addLog('🤏 窃盗技術を練習した。','skill');
  gainSkillExp('窃盗',8); advanceTurn();
}
function doPracticeAnatomy() {
  addLog('🔬 解剖学を練習した。','skill');
  gainSkillExp('医術',8); advanceTurn();
}
function doPracticeSpeech() {
  addLog('🗣️ 弁舌を練習した。','skill');
  gainSkillExp('弁舌',8); advanceTurn();
}
function doPracticeSmith() {
  addLog('⚒️ 鍛冶を練習した。','skill');
  gainSkillExp('鍛冶',8); advanceTurn();
}
function doMeditate() {
  changeSan(8); changeKarma(2);
  addLog('🧘 瞑想した。精神が安らいだ。','faith');
  gainSkillExp('信仰',5); advanceTurn();
}
function doPrayAlone() {
  changeSan(5); changeKarma(3); changeLuck(0.5);
  addLog('🙏 一人で神に祈った。','faith');
  gainSkillExp('信仰',5); advanceTurn();
}
function doRest() {
  const heal={homeless:3,inn:8,rental:6,apartment:7,own:10,built:10}[G.housing]||5;
  changeHp(heal); changeSan(3);
  addLog(`😴 休憩した。HP+${heal}。`,'dim');
  advanceTurn(3);
}
function doSleep() {
  const heal={homeless:5,inn:20,rental:15,apartment:18,own:25,built:25}[G.housing]||10;
  if(G.san<20 && pct(0.4)){
    changeHp(-rnd(10)-5); changeSan(-5);
    addLog('😱 悪夢を見た！眠れなかった。','bad');
  } else {
    changeHp(heal); changeSan(10);
    addLog(`💤 眠った。HP+${heal}、SAN+10。`,'dim');
  }
  if(G.housing==='homeless' && pct(0.2)){
    const stolen=rnd(30)+10;
    G.gold=Math.max(0,G.gold-stolen);
    addLog(`⚠️ 眠っている間に${stolen}G盗まれた！`,'bad');
  }
  advanceTurn(6);
}
function doLookAround() {
  const events=['何も変わったことはない。','遠くで衛兵が巡回している。','怪しい人物が路地に消えた。','子供が走り回っている。','商人が荷物を運んでいる。'];
  addLog(`👀 周囲を見回した。${pick(events)}`,'result');
  advanceTurn();
}
function doWriteDiary() {
  changeSan(5);
  addLog('📓 日記を書いた。気持ちが整理された。','dim');
  gainSkillExp('芸術',3); advanceTurn();
}
function doCountGold() {
  addLog(`💰 所持金を数えた。${G.gold}G。`,'dim');
  advanceTurn();
}
function doShout() {
  addLog('📣 大声で叫んだ。周囲の人々が振り返る。','result');
  changeSan(-3);
  if(pct(0.2)){ addLog('衛兵が近づいてきた。','warn'); }
  advanceTurn();
}
function doTossCoin() {
  if(G.gold<1){ addLog('お金がない。','bad'); return; }
  G.gold--;
  const result=pct(0.5)?'表':'裏';
  addLog(`🪙 コインを投げた。${result}。`,'dim');
  if(result==='表') changeLuck(0.2); else changeLuck(-0.1);
  advanceTurn();
}
function doPickup() {
  const items=['gold_coin','bread','trash','rope','bone'];
  const weights=[0.15,0.2,0.4,0.1,0.15];
  let r=Math.random(), cum=0, found='trash';
  for(let i=0;i<items.length;i++){ cum+=weights[i]; if(r<cum){found=items[i];break;} }
  addItem(found);
  addLog(`🔍 落ちているものを拾った。${itemName(found)}を入手！`,'item');
  advanceTurn();
}
function doSingInStreet(loud) {
  const lv=G.skills['演奏'].lv;
  if(loud && lv>=2){ G.gold+=rnd(15)+5; addLog('🎤 大声で歌った。チップをもらった！','good'); }
  else { addLog('🎤 歌った。','result'); }
  gainSkillExp('演奏',6); advanceTurn();
}
function doDance() {
  addLog('💃 踊った。','result');
  if(G.skills['演奏'].lv>=2){ G.gold+=rnd(10)+3; addLog('チップをもらった！','good'); }
  gainSkillExp('演奏',5); gainSkillExp('運動',3); advanceTurn();
}
function doSpeech(hasMic) {
  const lv=G.skills['弁舌'].lv;
  addLog(`📢 ${hasMic?'マイクで':'大声で'}演説した。`,'result');
  const followers=Math.floor(lv*2+rnd(5));
  const opponents=Math.floor(rnd(3));
  G.demoFollowers=(G.demoFollowers||0)+followers;
  G.demoOpponents=(G.demoOpponents||0)+opponents;
  addLog(`  → 支持者+${followers}、反対者+${opponents}。（累計支持: ${G.demoFollowers}）`,'result');
  if(G.demoFollowers>=20 && pct(0.3)){ addLog('🎉 デモ行進が始まった！一部の市民が熱狂的に支持している。','level'); }
  if(G.demoOpponents>=10){ addLog('⚠️ 反感を買っている人々がいる。','warn'); }
  gainSkillExp('弁舌',8); advanceTurn();
}
function doBumpIntoStranger() {
  addLog('💥 通行人にぶつかった。','result');
  if(pct(0.4)){
    const gold=rnd(20)+5;
    G.gold+=gold; changeKarma(-5);
    addLog(`  → スリに成功！${gold}G入手。`,'crime');
    gainSkillExp('窃盗',5);
  } else {
    addLog('  → 相手に怒鳴られた。','bad');
    changeSan(-3);
  }
  advanceTurn();
}
function doPickpocketCrowd() {
  const lv=G.skills['窃盗'].lv;
  if(pct(0.15+lv*0.06)){
    const gold=rnd(40)+10;
    G.gold+=gold; changeKarma(-8);
    addLog(`🤏 人混みでスリに成功！${gold}G入手。`,'crime');
    gainSkillExp('窃盗',10);
  } else {
    addLog('🤏 スリが失敗！衛兵に通報された！','bad');
    changeKarma(-15); doPrison(8);
  }
  advanceTurn();
}
function doPickupTrash() {
  addLog('♻️ ゴミを拾った。','good');
  addItem('trash'); changeKarma(2); advanceTurn();
}
function doThrowTrash() {
  if(!hasItem('trash')){ addLog('ゴミがない。','bad'); return; }
  removeItem('trash');
  addLog('🗑️ ゴミを捨てた。','crime');
  changeKarma(-3);
  if(pct(0.2)){ addLog('衛兵に見られた！','warn'); doPrison(3); }
  advanceTurn();
}
function doBurnTrash() {
  if(!hasItem('trash')){ addLog('ゴミがない。','bad'); return; }
  removeItem('trash');
  addLog('🔥 ゴミを燃やした。','crime');
  changeKarma(-5);
  if(pct(0.3)){ addLog('衛兵が来た！','event'); doPrison(5); }
  advanceTurn();
}
function doPutTrashInBin() {
  if(!hasItem('trash')){ addLog('ゴミがない。','bad'); return; }
  removeItem('trash');
  addLog('♻️ ゴミをゴミ箱に捨てた。','good');
  changeKarma(1); advanceTurn();
}
function doUndress(slot) {
  const names={head:'帽子',upper:'上着',lower:'ズボン',feet:'靴',hands:'手袋'};
  if(!G.clothes[slot]){ addLog(`すでに${names[slot]}を脱いでいる。`,'dim'); return; }
  G.clothes[slot]=false;
  addLog(`👕 ${names[slot]}を脱いだ。`,'dim');
  const naked=Object.values(G.clothes).every(v=>!v);
  if(naked){ addLog('⚠️ 全裸になった！衛兵に見つかると逮捕される。','warn'); }
  advanceTurn();
}
function doBeg() {
  const allClothed=Object.values(G.clothes).every(v=>v);
  if(allClothed){ addLog('きちんと服を着ていると物乞いの効果が薄い。','dim'); }
  const gold=rnd(5)+1;
  G.gold+=gold; changeKarma(-2); changeSan(-5);
  addLog(`🙏 物乞いをした。${gold}G恵んでもらった。`,'result');
  advanceTurn();
}
function doWalkNaked() {
  const naked=!Object.values(G.clothes).some(v=>v);
  if(!naked){ addLog('服を着ている。全裸になってから試してください。','dim'); return; }
  addLog('🚶 全裸で歩いた。','crime');
  if(pct(0.7)){ addLog('衛兵に捕まった！罰金50G。','bad'); G.gold=Math.max(0,G.gold-50); doPrison(5); }
  else { addLog('誰にも見られなかった……今回は。','dim'); }
  advanceTurn();
}
function doToiletPublic() {
  G.toiletUrgency=Math.max(0,G.toiletUrgency-80);
  changeCleanliness(3);
  addLog('🚽 公衆トイレに行った。','dim');
  advanceTurn();
}
function doToiletOutdoorHidden() {
  G.toiletUrgency=Math.max(0,G.toiletUrgency-80);
  changeCleanliness(-5); changeKarma(-3);
  addLog('🌿 路地裏でこっそり用を足した。','crime');
  if(pct(0.3)){
    addLog('目撃された！','warn');
    openModal('目撃された',
      '路地裏での行為を目撃された。どうする？',
      [
        {label:'逃げる', fn:()=>{ addLog('逃げた。','result'); }},
        {label:'買収する（20G）', fn:()=>{ if(G.gold>=20){G.gold-=20;addLog('買収した。','result');}else addLog('お金が足りない。','bad'); }},
        {label:'脅す', fn:()=>{ if(pct(0.5)) addLog('脅して黙らせた。','result'); else { addLog('失敗！通報された。','bad'); doPrison(5); } }},
      ]
    );
  }
  advanceTurn();
}
function doToiletOutdoorPublic() {
  G.toiletUrgency=0;
  changeCleanliness(-10); changeKarma(-8); changeSan(-10);
  addLog('😳 街中で堂々と用を足した。通報された！','crime');
  doPrison(5);
  advanceTurn();
}
function doBathHome() {
  if(G.housing==='homeless'){ addLog('家がない。','bad'); return; }
  changeCleanliness(40); changeSan(8);
  addLog('🛁 自宅でお風呂に入った。さっぱりした。','dim');
  advanceTurn(3);
}
function doShowerInn() {
  if(G.housing!=='inn'){ addLog('宿屋に泊まっていない。','bad'); return; }
  changeCleanliness(30); changeSan(5);
  addLog('🚿 宿屋のシャワーを浴びた。','dim');
  advanceTurn(2);
}
function doBathOutdoor() {
  changeCleanliness(20); changeSan(5);
  addLog('🌊 野外で入浴した。','crime');
  if(pct(0.4)){
    addLog('目撃された！','warn');
    openModal('目撃された',
      '野外入浴を目撃された。どうする？',
      [
        {label:'逃げる', fn:()=>{ addLog('逃げた。','result'); }},
        {label:'買収する（20G）', fn:()=>{ if(G.gold>=20){G.gold-=20;addLog('買収した。','result');}else addLog('お金が足りない。','bad'); }},
        {label:'脅す', fn:()=>{ if(pct(0.5)) addLog('脅して黙らせた。','result'); else { addLog('失敗！通報された。','bad'); doPrison(5); } }},
        {label:'消す', fn:()=>{ addLog('……目撃者を消した。','crime'); changeKarma(-20); G.murderCount++; }},
      ]
    );
  }
  advanceTurn(3);
}
function doWashFountain() {
  changeCleanliness(25); changeSan(5);
  addLog('⛲ 噴水で沐浴した。','crime');
  if(pct(0.5)){
    addLog('通行人に見られた！','warn');
    openModal('目撃された',
      '噴水での沐浴を目撃された。どうする？',
      [
        {label:'逃げる', fn:()=>{ addLog('逃げた。','result'); }},
        {label:'買収する（20G）', fn:()=>{ if(G.gold>=20){G.gold-=20;addLog('買収した。','result');}else addLog('お金が足りない。','bad'); }},
        {label:'脅す', fn:()=>{ if(pct(0.5)) addLog('脅して黙らせた。','result'); else { addLog('失敗！通報された。','bad'); doPrison(5); } }},
      ]
    );
  }
  advanceTurn(2);
}
function doWipeWetSheet() {
  if(!hasItem('wet_sheet')){ addLog('ウェットシートがない。','bad'); return; }
  removeItem('wet_sheet');
  changeCleanliness(10);
  addLog('🧻 ウェットシートで体を拭いた。','dim');
  advanceTurn();
}
function doDigStreet() {
  const lv=G.skills['採掘'].lv;
  addLog('⛏️ 石畳を掘った。','skill');
  changeKarma(-5);
  if(pct(0.05+lv*0.02)){
    const finds=['gold_coin','bone','rope','slime_core'];
    const f=pick(finds); addItem(f);
    addLog(`  → ${itemName(f)}を発見！`,'item');
  }
  gainSkillExp('採掘',8); advanceTurn();
}
function doDigFlowerBed() {
  addLog('🌸 花壇を掘り返した。','crime');
  changeKarma(-5);
  if(pct(0.3)){ addLog('近隣住民に怒鳴られた！','bad'); changeSan(-3); }
  gainSkillExp('採掘',3); advanceTurn();
}
function doWaterFlowerBed() {
  addLog('💧 花壇に水をあげた。','good');
  changeKarma(3); GROUND_STATE.flowerBedWatered=true;
  gainSkillExp('料理',2); advanceTurn();
}
function doPickFlower() {
  addLog('🌺 花壇の花を摘んだ。','dim');
  addItem('flower'); changeKarma(-1);
  advanceTurn();
}
function doGiveFlower(npc) {
  if(!hasItem('flower')){ addLog('花がない。','bad'); return; }
  removeItem('flower');
  addLog(`🌺 ${npc.name}に花を渡した。`,'result');
  changeGoodwill(npc,15); advanceTurn();
}
function doDigOil() {
  const lv=G.skills['採掘'].lv;
  const luck=G.luck;
  GROUND_STATE.oilDepth++;
  addLog(`⛏️ 深く掘った。（深度: ${GROUND_STATE.oilDepth}）`,'skill');
  if(GROUND_STATE.landOwner==='private' && !GROUND_STATE.landPermit){
    addLog('⚠️ ここは私有地だ。無断掘削は違法だ。','warn');
    if(pct(0.3)){ addLog('地主に見つかった！衛兵が来た。','event'); doPrison(10); return; }
  }
  const oilChance=0.005+lv*0.003+luck*0.001+GROUND_STATE.oilDepth*0.002;
  if(pct(oilChance)){
    GROUND_STATE.oilFound=true;
    addLog('🛢️ 石油が出た！！','level');
    if(!GROUND_STATE.landPermit){
      addLog('⚠️ しかし土地の権利がないため、没収される。','warn');
      openModal('石油発見',
        '石油が出たが、土地の権利がない。\n権利を持っていれば大金持ちになれたのに……',
        [{label:'悔しい……', fn:()=>{ addLog('石油は没収された。','bad'); }}]
      );
    } else {
      const profit=rnd(5000)+2000;
      G.gold+=profit;
      addLog(`  → 石油採掘権を行使！${profit}G入手！`,'level');
    }
  }
  gainSkillExp('採掘',10); advanceTurn();
}
function doTakePhoto(subject) {
  if(!hasItem('camera')){ addLog('カメラがない。','bad'); return; }
  const lv=G.skills['芸術'].lv;
  if(subject==='盗撮'){
    addLog('📷 盗撮した。','crime');
    changeKarma(-10);
    if(pct(0.3)){ addLog('見つかった！衛兵に通報された。','bad'); doPrison(10); return; }
    addItem('stolen_goods');
    addLog('  → 盗撮写真を入手。ゆすりに使えるかも。','crime');
  } else {
    const quality=['ピンボケ','普通','良い','素晴らしい'][Math.min(3,lv-1)];
    addLog(`📷 ${quality}写真を撮った。`,'skill');
    G.art+=lv*2;
  }
  gainSkillExp('芸術',5); advanceTurn();
}
function doSellPhoto() {
  const lv=G.skills['芸術'].lv;
  const price=lv*10+rnd(20);
  G.gold+=price;
  addLog(`📸 写真を${price}Gで売った。`,'item');
  advanceTurn();
}
function doCraft(id) {
  const recipes={
    bandage:    {needs:[{id:'rags',qty:1}],   result:'bandage',     exp:5},
    poison_potion:{needs:[{id:'poison_herb',qty:1}], result:'poison_potion', exp:8},
    meal:       {needs:[{id:'bread',qty:1}],  result:'meal',        exp:10},
    torch:      {needs:[{id:'rope',qty:1}],   result:'torch',       exp:5},
    photo_album:{needs:[],                    result:'photo_album', exp:15},
  };
  const r=recipes[id]; if(!r){ addLog('レシピがない。','bad'); return; }
  for(const n of r.needs){
    if(itemCount(n.id)<n.qty){ addLog(`${itemName(n.id)}が足りない。`,'bad'); return; }
  }
  for(const n of r.needs) removeItem(n.id,n.qty);
  const qty=pct(G.skills['鍛冶'].lv*0.05)?2:1;
  addItem(r.result,qty);
  addLog(`⚒️ ${itemName(r.result)}を${qty}個作った。`,'skill');
  gainSkillExp('鍛冶',r.exp); advanceTurn();
}
function doDisposeCorpse(method) {
  if(!G.corpse){ addLog('処理すべき死体がない。','bad'); return; }
  const msgs={
    dissect:'🔪 死体を解体した。証拠が消えた。',
    mountain:'🏔️ 死体を山に遺棄した。',
    sea:'🌊 死体を海に沈めた。',
  };
  addLog(msgs[method]||'死体を処理した。','crime');
  changeKarma(-5);
  G.corpse=null;
  advanceTurn();
}
