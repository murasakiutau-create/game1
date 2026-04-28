# ヴィンテージ・メモリア（仮）

1920年代アンティーク風デッキ構築型RPG

## 遊び方

`index.html` をブラウザで開くだけで動作します。（ローカルサーバー不要）

## ゲームシステム

### 職業（ゲーム開始時に1つ選択）
| 職業 | 特性 |
|---|---|
| 骨董商 | 毎ターン開始時にMP+1 |
| 迷宮探偵 | 敵の行動を2ターン先まで予告表示 |
| 修繕屋 | ターン終了時ガード値30%持ち越し |

### デッキ
- デッキ枚数：15枚固定
- 同一カード：最大3枚まで
- 手札：毎ターン5枚ドロー
- カードは「攻撃・防御・補助」の3種別

### 戦闘
- 予告型：敵の次の行動が事前に表示される
- 複数体出現あり（ボス戦は確率が高め）
- ガード値：防御カードで積み上がり、ターン終了でリセット（修繕屋は30%持ち越し）
- MP最低保証：ターン開始時に5未満なら5まで自動回復

### 携帯食料
- ダンジョン入場時に最大HP分の食料を自動携帯
- 戦闘後に任意で使用してHP回復
- 食料が0になったらホームに強制送還

### カード入手・アレンジ
- 敵撃破後に古物をドロップ
- 「攻撃・防御・補助」のいずれかを選んでデッキに追加
- 選択しないと次へ進めない

### 素材・クラフト
- 敵から素材をドロップ
- ホームの「クラフト」で装備品を作成
- 武器：攻撃値UP / 防具：最大HP UP

### 強化・売却
- 余ったカード・素材をゴールドに売却
- ゴールドでカードを最大5段階強化（段階ごとに高額）
- ゴールドでキャラクターステータスを強化

## 画像の差し替え方

画像ファイルが存在しない場合は絵文字でフォールバックします。

### カード画像
`assets/images/cards/{cardId}.png`

カード画像は「カードID」単位で管理されています。同じ古物でも攻撃・防御・補助で別の画像を設定できます。

| カードID | カード名 | 画像ファイル名 |
|---|---|---|
| watch_attack | 懷中時計の打撃 | watch_attack.png |
| watch_defense | 時間鱈化 | watch_defense.png |
| watch_support | ゼンマイ巻き | watch_support.png |
| ink_attack | インク飛ばし | ink_attack.png |
| ink_defense | 目眩まし | ink_defense.png |
| ink_support | 記録 | ink_support.png |
| mirror_attack | 反射光 | mirror_attack.png |
| mirror_defense | 鏡の壁 | mirror_defense.png |
| mirror_support | 弱点露出 | mirror_support.png |
| lantern_attack | 熱波 | lantern_attack.png |
| lantern_defense | 煙幕 | lantern_defense.png |
| lantern_support | 燻し符印 | lantern_support.png |
| book_attack | 封印破り | book_attack.png |
| book_defense | 紙盾 | book_defense.png |
| book_support | 朗読 | book_support.png |
| music_attack | 不協和音 | music_attack.png |
| music_defense | 鹏尾小笥 | music_defense.png |
| music_support | 旋律 | music_support.png |

画像ファイルは `.jpg` `.png` `.webp` のいずれでも使用可能です。ファイルがない場合は自動的に絵文字で代替表示されます。g

### 敵画像
`assets/images/enemies/{enemyId}.png`
- stuffed_rabbit.png / broken_doll.png / dust_ghost.png / old_clock.png
- ink_blot.png / paper_golem.png / attic_boss.png / library_boss.png

### 素材画像
`assets/images/materials/{materialId}.png`
- rusty_screw.png / bronze_gear.png / glass_shard.png / thick_cloth.png
- velvet_ribbon.png / dried_herb.png / old_ink.png / faded_leather.png

### 装備画像
`assets/images/equips/{equipId}.png`
- sword_watch.png / staff_ink.png / dagger_mirror.png / staff_lantern.png
- coat_cloth.png / vest_leather.png / coat_vintage.png

### ステージ背景
`assets/images/stages/{stageId}.png`
- attic.png / library.png

### UIアイコン
`assets/images/ui/player.png`（プレイヤーアイコン）
