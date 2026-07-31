// 中文版海圖 / 邊界詞綴資料表
// 來源：實測遊戲貼上文字 + 玩家整理的 Deep Water Border Mods 完整列表（65 條）
// id 命名慣例：'b-' 開頭 = 邊界(Border)，'adj-' = 相鄰(chart implicit, adjacent scope)，
// 'voy-' = 航程(chart implicit, global/voyage scope)。
// family（用於獎勵權重分組，見 logic/rewards.ts）= id 去掉字首與結尾 "-數字"。

import type { BorderModDef, VoyageModDef } from '../types'

// ---------------------------------------------------------------------------
// 邊界詞綴（12 段邊界會從這個池子隨機擲出，每段對應 board 上一格）
// ---------------------------------------------------------------------------
export const BORDER_MODS: BorderModDef[] = [
  // --- 怪物群大小 ---
  { id: 'b-packsize-1', text: '增加 16% 相鄰區域的怪物群大小', textEn: "16% increased Pack Size in adjacent Areas", short: '+16% 怪物群大小', effects: [{ stat: 'packsize', percent: 16 }] },
  { id: 'b-packsize-2', text: '增加 24% 相鄰區域的怪物群大小', textEn: "24% increased Pack Size in adjacent Areas", short: '+24% 怪物群大小', effects: [{ stat: 'packsize', percent: 24 }] },
  { id: 'b-packsize-3', text: '增加 32% 相鄰區域的怪物群大小', textEn: "32% increased Pack Size in adjacent Areas", short: '+32% 怪物群大小', effects: [{ stat: 'packsize', percent: 32 }] },

  // --- 怪物稀有度下限 ---
  { id: 'b-magicmin', text: '相鄰區域的所有怪物至少為魔法', textEn: "Monsters in adjacent Areas are at least Magic", short: '怪物至少為魔法', effects: [{ stat: 'magicmonsters', percent: 100 }] },

  // --- 稀有怪物數量（Divine Border Rares 核心之一：border:rare） ---
  { id: 'b-rare-1', text: '增加 50% 相鄰區域找到的稀有怪物數量', textEn: "50% increased number of Rare Monsters in adjacent Areas", short: '+50% 稀有怪物', effects: [{ stat: 'rares', percent: 50 }] },
  { id: 'b-rare-2', text: '增加 75% 相鄰區域找到的稀有怪物數量', textEn: "75% increased number of Rare Monsters in adjacent Areas", short: '+75% 稀有怪物', effects: [{ stat: 'rares', percent: 75 }] },
  { id: 'b-rare-3', text: '增加 100% 相鄰區域找到的稀有怪物數量', textEn: "100% increased number of Rare Monsters in adjacent Areas", short: '+100% 稀有怪物', effects: [{ stat: 'rares', percent: 100 }] },

  // --- 特定生物群 ---
  { id: 'b-seabeast-1', text: '相鄰區域內含有額外8群海洋野獸', textEn: "Adjacent Areas contain 8 additional packs of Sea Beasts", short: '+8群 海洋野獸', effects: [{ stat: 'packsize', percent: 8 }] },
  { id: 'b-seabeast-2', text: '相鄰區域內含有額外12群海洋野獸', textEn: "Adjacent Areas contain 12 additional packs of Sea Beasts", short: '+12群 海洋野獸', effects: [{ stat: 'packsize', percent: 12 }] },
  { id: 'b-seabeast-3', text: '相鄰區域內含有額外16群海洋野獸', textEn: "Adjacent Areas contain 16 additional packs of Sea Beasts", short: '+16群 海洋野獸', effects: [{ stat: 'packsize', percent: 16 }] },
  { id: 'b-crab-1', text: '相鄰區域內含有額外8群螃蟹', textEn: "Adjacent Areas contain 8 additional packs of Crabs", short: '+8群 螃蟹', effects: [{ stat: 'packsize', percent: 8 }] },
  { id: 'b-crab-2', text: '相鄰區域內含有額外12群螃蟹', textEn: "Adjacent Areas contain 12 additional packs of Crabs", short: '+12群 螃蟹', effects: [{ stat: 'packsize', percent: 12 }] },
  { id: 'b-crab-3', text: '相鄰區域內含有額外16群螃蟹', textEn: "Adjacent Areas contain 16 additional packs of Crabs", short: '+16群 螃蟹', effects: [{ stat: 'packsize', percent: 16 }] },
  { id: 'b-drowned-1', text: '相鄰區域內含有額外8群浮屍', textEn: "Adjacent Areas contain 8 additional packs of the Drowned", short: '+8群 浮屍', effects: [{ stat: 'packsize', percent: 8 }] },
  { id: 'b-drowned-2', text: '相鄰區域內含有額外12群浮屍', textEn: "Adjacent Areas contain 12 additional packs of the Drowned", short: '+12群 浮屍', effects: [{ stat: 'packsize', percent: 12 }] },
  { id: 'b-drowned-3', text: '相鄰區域內含有額外16群浮屍', textEn: "Adjacent Areas contain 16 additional packs of the Drowned", short: '+16群 浮屍', effects: [{ stat: 'packsize', percent: 16 }] },

  // --- 固定詞綴幅度（放大該格圖表自身詞綴，非戰利品，用 magnitude 欄位處理） ---
  { id: 'b-magnitude-1', text: '相鄰區域增加 40% 固定詞綴幅度', textEn: "Adjacent Areas have 40% increased explicit modifier magnitudes", short: '+40% 詞綴幅度', effects: [], magnitude: 40 },
  { id: 'b-magnitude-2', text: '相鄰區域增加 60% 固定詞綴幅度', textEn: "Adjacent Areas have 60% increased explicit modifier magnitudes", short: '+60% 詞綴幅度', effects: [], magnitude: 60 },
  { id: 'b-magnitude-3', text: '相鄰區域增加 80% 固定詞綴幅度', textEn: "Adjacent Areas have 80% increased explicit modifier magnitudes", short: '+80% 詞綴幅度', effects: [], magnitude: 80 },

  // --- 圖表保留 ---
  { id: 'b-preserve-1', text: '相鄰海圖在啟航時有 30% 機率不會被消耗', textEn: "Adjacent Charts have 30% chance to not be consumed when beginning a Voyage", short: '30% 不消耗海圖', effects: [{ stat: 'preserve', percent: 30 }] },
  { id: 'b-preserve-2', text: '相鄰海圖在啟航時有 50% 機率不會被消耗', textEn: "Adjacent Charts have 50% chance to not be consumed when beginning a Voyage", short: '50% 不消耗海圖', effects: [{ stat: 'preserve', percent: 50 }] },

  // --- 特殊小怪 / 場景物件（風味為主，給小額 treasure 權重） ---
  { id: 'b-crabking', text: '相鄰區域內含有一個垢爪怪', textEn: "Adjacent Areas contain Filthscrabble", short: '垢爪怪', effects: [{ stat: 'treasure', percent: 10 }] },
  { id: 'b-lantern-nocost', text: '在相鄰區域放置燈籠時不會減少你的燈籠數量', textEn: "Placing Lanterns does not reduce your Lantern count in adjacent Areas", short: '燈籠不消耗', effects: [{ stat: 'treasure', percent: 15 }] },

  // --- 稀有怪掉落額外通貨（Divine Border Rares 核心：border:divine） ---
  { id: 'b-ancient', text: '相鄰區域內的稀有怪物掉落額外 1 個古變石', textEn: "Rare Monsters in adjacent Areas drop 1 additional Ancient Orbs", short: '稀有怪掉古變石', effects: [{ stat: 'currency', percent: 20 }] },
  { id: 'b-divine', text: '相鄰區域內的稀有怪物掉落額外 1 個神聖石', textEn: "Rare Monsters adjacent in Areas drop 1 additional Divine Orbs", short: '稀有怪掉神聖石', effects: [{ stat: 'currency', percent: 100 }] },
  { id: 'b-exalt', text: '相鄰區域內的稀有怪物掉落額外 1 個崇高石', textEn: "Rare Monsters in adjacent Areas drop 1 additional Exalted Orbs", short: '稀有怪掉崇高石', effects: [{ stat: 'currency', percent: 60 }] },
  { id: 'b-annul', text: '相鄰區域內的稀有怪物掉落額外 1 個無效石', textEn: "Rare Monsters in adjacent Areas drop 1 additional Orbs of Annulment", short: '稀有怪掉無效石', effects: [{ stat: 'currency', percent: 15 }] },
  { id: 'b-chaos', text: '相鄰區域內的稀有怪物掉落額外 1 個混沌石', textEn: "Rare Monsters in adjacent Areas drop 1 additional Chaos Orbs", short: '稀有怪掉混沌石', effects: [{ stat: 'currency', percent: 10 }] },
  { id: 'b-vaal', text: '相鄰區域內的稀有怪物掉落額外 1 個瓦爾寶珠', textEn: "Rare Monsters in adjacent Areas drop 1 additional Vaal Orbs", short: '稀有怪掉瓦爾寶珠', effects: [{ stat: 'currency', percent: 12 }] },
  { id: 'b-prism', text: '相鄰區域內的稀有怪物掉落額外 1 個寶石匠的稜鏡', textEn: "Rare Monsters in adjacent Areas drop 1 additional Gemcutter's Prisms", short: '稀有怪掉稜鏡', effects: [{ stat: 'currency', percent: 8 }] },
  { id: 'b-chromatic', text: '相鄰區域內的稀有怪物掉落額外 1 個幻色石', textEn: "Rare Monsters in adjacent Areas drop 1 additional Chromatic Orbs", short: '稀有怪掉幻色石', effects: [{ stat: 'currency', percent: 5 }] },
  { id: 'b-regret', text: '相鄰區域內的稀有怪物掉落額外 1 個後悔石', textEn: "Rare Monsters in adjacent Areas drop 1 additional Orbs of Regret", short: '稀有怪掉後悔石', effects: [{ stat: 'currency', percent: 5 }] },
  { id: 'b-blessed', text: '相鄰區域內的稀有怪物掉落額外 1 個祝福石', textEn: "Rare Monsters in adjacent Areas drop 1 additional Blessed Orbs", short: '稀有怪掉祝福石', effects: [{ stat: 'currency', percent: 5 }] },
  { id: 'b-exotic', text: '相鄰區域內的稀有怪物掉落額外 1 個富豪石', textEn: "Rare Monsters in adjacent Areas drop 1 additional Regal Orbs", short: '稀有怪掉富豪石', effects: [{ stat: 'currency', percent: 5 }] },
  { id: 'b-supportgem', text: '相鄰區域內的稀有怪物有 20% 機率掉落一個輔助寶石', textEn: "Rare Monsters in adjacent Areas have 20% chance to drop a Support Gem", short: '20% 掉輔助寶石', effects: [{ stat: 'currency', percent: 15 }] },

  // --- 場景寶物 ---
  { id: 'b-lockbox', text: '相鄰區域內含有一個失落的海盜鎖櫃', textEn: "Adjacent Areas contain a lost Pirate's Locker", short: '海盜鎖櫃', effects: [{ stat: 'treasure', percent: 20 }] },
  { id: 'b-bandits', text: '相鄰區域內含有一個布琳洛特洗劫團夥', textEn: "Adjacent Areas contain a Brinerot raiding party", short: '洗劫團夥', effects: [{ stat: 'treasure', percent: 20 }] },

  // --- 每連接數縮放（perConnEffects，family 仍歸類為 rare / quantity 以便共用權重） ---
  { id: 'b-rare-conn-1', text: '相鄰區域每與一個區域相連，即增加 50% 稀有怪物數量', textEn: "50% increased number of Rare monsters in adjacent Areas per connection", short: '每連接 +50% 稀有怪', effects: [], perConnEffects: [{ stat: 'rares', percent: 50 }] },
  { id: 'b-rare-conn-2', text: '相鄰區域每與一個區域相連，即增加 75% 稀有怪物數量', textEn: "75% increased number of Rare monsters in adjacent Areas per connection", short: '每連接 +75% 稀有怪', effects: [], perConnEffects: [{ stat: 'rares', percent: 75 }] },
  {
    id: 'b-quantconn-1',
    text: '相鄰區域每與一個區域相連，即減少 50% 找到的物品數量\n增加 120% 相鄰區域找到的物品數量', textEn: "50% reduced quantity of items found in adjacent Areas per connection\n120% increased Quantity of Items found in adjacent Areas",
    short: '每連接 +120% 物品數量',
    effects: [{ stat: 'quantity', percent: 120 }],
    perConnEffects: [{ stat: 'quantity', percent: -50 }],
  },
  {
    id: 'b-quantconn-2',
    text: '相鄰區域每與一個區域相連，即減少 50% 找到的物品數量\n增加 180% 相鄰區域找到的物品數量', textEn: "50% reduced quantity of items found in adjacent Areas per connection\n180% increased Quantity of Items found in adjacent Areas",
    short: '每連接 +180% 物品數量',
    effects: [{ stat: 'quantity', percent: 180 }],
    perConnEffects: [{ stat: 'quantity', percent: -50 }],
  },

  // --- 裝備轉金幣 ---
  { id: 'b-gold-1', text: '相鄰區域內的怪物掉落的裝備有 25% 會改為掉落金幣', textEn: "25% of Equipment dropped by monsters in adjacent Areas is converted to Gold", short: '25% 裝備轉金幣', effects: [{ stat: 'gold', percent: 25 }] },
  { id: 'b-gold-2', text: '相鄰區域內的怪物掉落的裝備有 50% 會改為掉落金幣', textEn: "50% of Equipment dropped by monsters in adjacent Areas is converted to Gold", short: '50% 裝備轉金幣', effects: [{ stat: 'gold', percent: 50 }] },
  { id: 'b-divcard', text: '相鄰區域內怪物所掉落的基礎通貨會改為豐裕牌組', textEn: "Basic Currency items dropped by Monsters in adjacent Areas will instead drop as Stacked Decks", short: '通貨改豐裕牌組', effects: [{ stat: 'divcards', percent: 30 }] },
  { id: 'b-scarab-drop', text: '相鄰區域內的稀有怪物掉落額外 1 個聖甲蟲', textEn: "Rare Monsters in adjacent Areas drop 1 additional Scarabs", short: '稀有怪掉聖甲蟲', effects: [{ stat: 'scarabs', percent: 20 }] },

  // --- 找到更多通貨/聖甲蟲/稀有度 ---
  { id: 'b-currency-1', text: '相鄰區域內找到 50% 更多通貨', textEn: "50% more Currency found in adjacent Areas", short: '+50% 更多通貨', effects: [{ stat: 'currency', percent: 50 }] },
  { id: 'b-currency-2', text: '相鄰區域內找到 75% 更多通貨', textEn: "75% more Currency found in adjacent Areas", short: '+75% 更多通貨', effects: [{ stat: 'currency', percent: 75 }] },
  { id: 'b-currency-3', text: '相鄰區域內找到 100% 更多通貨', textEn: "100% more Currency found in adjacent Areas", short: '+100% 更多通貨', effects: [{ stat: 'currency', percent: 100 }] },
  { id: 'b-scarabpct-1', text: '相鄰區域內找到 50% 更多聖甲蟲', textEn: "50% more Scarabs found in adjacent Areas", short: '+50% 更多聖甲蟲', effects: [{ stat: 'scarabs', percent: 50 }] },
  { id: 'b-scarabpct-2', text: '相鄰區域內找到 75% 更多聖甲蟲', textEn: "75% more Scarabs found in adjacent Areas", short: '+75% 更多聖甲蟲', effects: [{ stat: 'scarabs', percent: 75 }] },
  { id: 'b-scarabpct-3', text: '相鄰區域內找到 100% 更多聖甲蟲', textEn: "100% more Scarabs found in adjacent Areas", short: '+100% 更多聖甲蟲', effects: [{ stat: 'scarabs', percent: 100 }] },
  { id: 'b-rarity-1', text: '相鄰區域有 50% 更多找到的物品稀有度', textEn: "50% more Rarity of Items found in adjacent Areas", short: '+50% 更多物品稀有度', effects: [{ stat: 'rarity', percent: 50 }] },
  { id: 'b-rarity-2', text: '相鄰區域有 75% 更多找到的物品稀有度', textEn: "75% more Rarity of Items found in adjacent Areas", short: '+75% 更多物品稀有度', effects: [{ stat: 'rarity', percent: 75 }] },
  { id: 'b-rarity-3', text: '相鄰區域有 100% 更多找到的物品稀有度', textEn: "100% more Rarity of Items found in adjacent Areas", short: '+100% 更多物品稀有度', effects: [{ stat: 'rarity', percent: 100 }] },

  // --- 場景事件 / 經驗值 / 其他 ---
  { id: 'b-miniboss', text: '相鄰區域內含有一個船長之災', textEn: "Adjacent Areas contain Captainsbane", short: '船長之災', effects: [{ stat: 'treasure', percent: 25 }] },
  { id: 'b-exp-1', text: '相鄰區域內的玩家增加 100% 獲取的經驗值', textEn: "Players in adjacent Areas gain 100% increased Experience", short: '+100% 經驗值', effects: [{ stat: 'exp', percent: 100 }] },
  { id: 'b-exp-2', text: '相鄰區域內的玩家增加 150% 獲取的經驗值', textEn: "Players in adjacent Areas gain 150% increased Experience", short: '+150% 經驗值', effects: [{ stat: 'exp', percent: 150 }] },
  { id: 'b-exp-3', text: '相鄰區域內的玩家增加 200% 獲取的經驗值', textEn: "Players in adjacent Areas gain 200% increased Experience", short: '+200% 經驗值', effects: [{ stat: 'exp', percent: 200 }] },
  { id: 'b-magicaffix', text: '相鄰區域內的魔法怪物額外擁有一條詞綴', textEn: "Magic Monsters in adjacent Areas have an additional modifier", short: '魔法怪 +1 詞綴', effects: [{ stat: 'magicmonsters', percent: 30 }] },
  { id: 'b-anchor-1', text: '相鄰區域內含有額外 2 個寶藏船錨', textEn: "Adjacent Areas contain 2 additional Treasure Anchors", short: '+2 寶藏船錨', effects: [{ stat: 'treasure', percent: 20 }] },
  { id: 'b-anchor-2', text: '相鄰區域內含有額外 4 個寶藏船錨', textEn: "Adjacent Areas contain 4 additional Treasure Anchors", short: '+4 寶藏船錨', effects: [{ stat: 'treasure', percent: 35 }] },
  { id: 'b-sulphdrop', text: '相鄰區域內的稀有怪物被擊殺時會掉落亡者硫酸', textEn: "Rare Monsters in adjacent Areas drop Dead Man's Sulphur", short: '稀有怪掉亡者硫酸', effects: [{ stat: 'sulphur', percent: 30 }] },
  { id: 'b-lantern-4', text: '相鄰區域內含有額外 4 個黃金燈籠', textEn: "Adjacent Areas contain 4 additional Golden Lanterns", short: '+4 黃金燈籠', effects: [{ stat: 'treasure', percent: 40 }] },
  { id: 'b-altar', text: '相鄰區域內含有 2 座女神的祭壇', textEn: "Adjacent Areas contain 2 Altars to the Goddess", short: '2 座女神祭壇', effects: [{ stat: 'treasure', percent: 25 }] },
]

export const borderModById = new Map(BORDER_MODS.map((m) => [m.id, m]))

// ---------------------------------------------------------------------------
// 海圖固定詞綴（相鄰 adj- / 航程 voy-）
// 來源：玩家提供的完整「航程詞綴」清單（真實遊戲文字，含各階別數值），
// 2026-08 全數更新為確認文字。少數效果數值（傷害/機率換算成的內部權重分數）
// 是我自己抓的合理估值，不是遊戲原文的一部分，只影響求解器的排序不影響顯示文字。
// ---------------------------------------------------------------------------
export const VOYAGE_MODS: VoyageModDef[] = [
  // --- 被禁錮的怪物 ---
  { id: 'adj-captive-1', text: '相鄰區域內含有額外 (1—2) 名被禁錮的怪物', textEn: "Adjacent Areas contain (1-2) additional Imprisoned Monsters", short: '+1-2 被禁錮怪物', scope: 'adjacent', effects: [{ stat: 'treasure', percent: 10 }] },
  { id: 'adj-captive-2', text: '相鄰區域內含有額外 (2—4) 名被禁錮的怪物', textEn: "Adjacent Areas contain (2-4) additional Imprisoned Monsters", short: '+2-4 被禁錮怪物', scope: 'adjacent', effects: [{ stat: 'treasure', percent: 18 }] },
  { id: 'adj-captive-3', text: '相鄰區域內含有額外 5 名被禁錮的怪物', textEn: "Adjacent Areas contain 5 additional Imprisoned Monsters", short: '+5 被禁錮怪物', scope: 'adjacent', effects: [{ stat: 'treasure', percent: 25 }] },

  // --- 一般保險箱（家族 box，Divine Border Rares 的 adjacent:box 用這個） ---
  { id: 'adj-box-1', text: '相鄰區域內含有額外 1 個保險箱', textEn: "Adjacent Areas contain 1 additional Strongboxes", short: '+1 保險箱', scope: 'adjacent', effects: [{ stat: 'treasure', percent: 15 }] },
  { id: 'adj-box-2', text: '相鄰區域內含有額外 (2—4) 個保險箱', textEn: "Adjacent Areas contain (2-4) additional Strongboxes", short: '+2-4 保險箱', scope: 'adjacent', effects: [{ stat: 'treasure', percent: 25 }] },
  { id: 'adj-box-3', text: '相鄰區域內含有額外 5 個保險箱', textEn: "Adjacent Areas contain 5 additional Strongboxes", short: '+5 保險箱', scope: 'adjacent', effects: [{ stat: 'treasure', percent: 35 }] },

  // --- 章魚 / 螃蟹（相鄰版，跟邊界版是不同池子） ---
  { id: 'adj-octopus-1', text: '相鄰區域內含有額外(8—10)群章魚', textEn: "Adjacent Areas contains (8-10) additional packs of Octopi", short: '+8-10群 章魚', scope: 'adjacent', effects: [{ stat: 'packsize', percent: 8 }] },
  { id: 'adj-octopus-2', text: '相鄰區域內含有額外(11—14)群章魚', textEn: "Adjacent Areas contains (11-14) additional packs of Octopi", short: '+11-14群 章魚', scope: 'adjacent', effects: [{ stat: 'packsize', percent: 12 }] },
  { id: 'adj-crab-1', text: '相鄰區域內含有額外(8—10)群螃蟹', textEn: "Adjacent Areas contain (8-10) additional packs of Crabs", short: '+8-10群 螃蟹', scope: 'adjacent', effects: [{ stat: 'packsize', percent: 8 }] },
  { id: 'adj-crab-2', text: '相鄰區域內含有額外(11—14)群螃蟹', textEn: "Adjacent Areas contain (11-14) additional packs of Crabs", short: '+11-14群 螃蟹', scope: 'adjacent', effects: [{ stat: 'packsize', percent: 12 }] },

  // --- 魔法 / 稀有怪物數量（相鄰） ---
  { id: 'adj-magic-1', text: '增加 30% 相鄰區域找到的魔法怪物數量', textEn: "30% increased number of Magic Monsters in adjacent Areas", short: '+30% 魔法怪', scope: 'adjacent', effects: [{ stat: 'magicmonsters', percent: 30 }] },
  { id: 'adj-magic-2', text: '增加 60% 相鄰區域找到的魔法怪物數量', textEn: "60% increased number of Magic Monsters in adjacent Areas", short: '+60% 魔法怪', scope: 'adjacent', effects: [{ stat: 'magicmonsters', percent: 60 }] },
  { id: 'adj-rare-1', text: '增加 30% 相鄰區域找到的稀有怪物數量', textEn: "30% increased number of Rare Monsters in adjacent Areas", short: '+30% 稀有怪', scope: 'adjacent', effects: [{ stat: 'rares', percent: 30 }] },
  { id: 'adj-rare-2', text: '增加 60% 相鄰區域找到的稀有怪物數量', textEn: "60% increased number of Rare Monsters in adjacent Areas", short: '+60% 稀有怪', scope: 'adjacent', effects: [{ stat: 'rares', percent: 60 }] },

  // --- 瓶中信（Message in a Bottle，Speedrun Strongboxes 用） ---
  { id: 'adj-msg-1', text: '相鄰區域內含有額外 1 個瓶中信', textEn: "Adjacent Areas contain 1 additional Messages in Bottles", short: '+1 瓶中信', scope: 'adjacent', effects: [{ stat: 'treasure', percent: 40 }] },
  { id: 'adj-msg-2', text: '相鄰區域內含有額外 2 個瓶中信', textEn: "Adjacent Areas contain 2 additional Messages in Bottles", short: '+2 瓶中信', scope: 'adjacent', effects: [{ stat: 'treasure', percent: 60 }] },

  { id: 'adj-fish-1', text: '相鄰區域內含有高價且珍稀的魚類', textEn: "Adjacent Areas contain highly prized and exotic Fish", short: '珍稀魚類', scope: 'adjacent', effects: [{ stat: 'currency', percent: 20 }] },

  // --- 荒林妖精（Magic Ethereal 用） ---
  { id: 'adj-wisps-1', text: '怪物有機率受到 2000 個荒林妖精強化', textEn: "Monsters have a chance to be Empowered by 2000 Wildwood Wisps", short: '2000 荒林妖精', scope: 'adjacent', effects: [{ stat: 'wisps', percent: 20 }] },
  { id: 'adj-wisps-2', text: '怪物有機率受到 4000 個荒林妖精強化', textEn: "Monsters have a chance to be Empowered by 4000 Wildwood Wisps", short: '4000 荒林妖精', scope: 'adjacent', effects: [{ stat: 'wisps', percent: 40 }] },

  { id: 'adj-azuri-1', text: '阿茲里之息', textEn: "Atziri's Influence", short: '阿茲里之息', scope: 'adjacent', effects: [{ stat: 'currency', percent: 25 }] },

  // --- 裝備轉金幣（相鄰版） ---
  { id: 'adj-gold-1', text: '相鄰區域內的怪物掉落的裝備有 40% 會改為掉落金幣', textEn: "40% of Equipment dropped by monsters in adjacent Areas is converted to Gold", short: '40% 裝備轉金幣', scope: 'adjacent', effects: [{ stat: 'gold', percent: 40 }] },
  { id: 'adj-gold-2', text: '相鄰區域內的怪物掉落的裝備有 80% 會改為掉落金幣', textEn: "80% of Equipment dropped by monsters in adjacent Areas is converted to Gold", short: '80% 裝備轉金幣', scope: 'adjacent', effects: [{ stat: 'gold', percent: 80 }] },

  { id: 'adj-prison-1', text: '相鄰區域內含有額外 1 個關滿罪魂的囚牢', textEn: "Adjacent Areas contain 1 additional cages of Tormented Spirits", short: '+1 罪魂囚牢', scope: 'adjacent', effects: [{ stat: 'treasure', percent: 25 }] },
  { id: 'adj-prison-2', text: '相鄰區域內含有額外 2 個關滿罪魂的囚牢', textEn: "Adjacent Areas contain 2 additional cages of Tormented Spirits", short: '+2 罪魂囚牢', scope: 'adjacent', effects: [{ stat: 'treasure', percent: 40 }] },

  // --- 命運的保險箱（✅ 確認對應 Diviner's Strongbox） ---
  { id: 'adj-divbox-1', text: '相鄰區域內含有額外 2 個命運的保險箱', textEn: "Adjacent Areas contain 2 additional Diviner's Strongboxes", short: '+2 命運保險箱', scope: 'adjacent', effects: [{ stat: 'treasure', percent: 45 }] },
  { id: 'adj-divbox-2', text: '相鄰區域內含有額外 3 個命運的保險箱', textEn: "Adjacent Areas contain 3 additional Diviner's Strongboxes", short: '+3 命運保險箱', scope: 'adjacent', effects: [{ stat: 'treasure', percent: 60 }] },

  { id: 'adj-arcanistbox-1', text: '相鄰區域內含有額外 2 個奧術師的保險箱', textEn: "Adjacent Areas contain 2 additional Arcanist's Strongboxes", short: '+2 奧術師保險箱', scope: 'adjacent', effects: [{ stat: 'treasure', percent: 45 }] },
  { id: 'adj-arcanistbox-2', text: '相鄰區域內含有額外 3 個奧術師的保險箱', textEn: "Adjacent Areas contain 3 additional Arcanist's Strongboxes", short: '+3 奧術師保險箱', scope: 'adjacent', effects: [{ stat: 'treasure', percent: 60 }] },

  // --- 特工的保險箱（Operative's Strongbox，Speedrun Strongboxes 主力） ---
  { id: 'adj-opbox-1', text: '相鄰區域內含有額外 2 個特工的保險箱', textEn: "Adjacent Areas contain 2 additional Operative's Strongboxes", short: '+2 特工保險箱', scope: 'adjacent', effects: [{ stat: 'treasure', percent: 55 }] },
  { id: 'adj-opbox-2', text: '相鄰區域內含有額外 3 個特工的保險箱', textEn: "Adjacent Areas contain 3 additional Operative's Strongboxes", short: '+3 特工保險箱', scope: 'adjacent', effects: [{ stat: 'treasure', percent: 70 }] },

  // --- 木桶堆 ---
  { id: 'adj-barrels-1', text: '相鄰區域內含有額外 (12—15) 堆木桶', textEn: "Adjacent Areas contain (12-15) additional Clusters of Barrels", short: '木桶堆 12-15', scope: 'adjacent', effects: [{ stat: 'treasure', percent: 12 }] },
  { id: 'adj-barrels-2', text: '相鄰區域內含有額外 (16—20) 堆木桶', textEn: "Adjacent Areas contain (16-20) additional Clusters of Barrels", short: '木桶堆 16-20', scope: 'adjacent', effects: [{ stat: 'treasure', percent: 18 }] },

  // --- 巨大海星（星魚，Meatfish / Divine Border Rares 用） ---
  { id: 'adj-star-1', text: '相鄰區域內含有額外(4—5)群巨大海星', textEn: "Adjacent Areas contains (4-5) additional Giant Starfish", short: '+4-5群 巨大海星', scope: 'adjacent', effects: [{ stat: 'rares', percent: 40 }] },
  { id: 'adj-star-2', text: '相鄰區域內含有額外(6—7)群巨大海星', textEn: "Adjacent Areas contains (6-7) additional Giant Starfish", short: '+6-7群 巨大海星', scope: 'adjacent', effects: [{ stat: 'rares', percent: 55 }] },

  { id: 'adj-itemfracture-1', text: '相鄰區域內掉落的物品有 2% 機率為破裂物品', textEn: "Items dropped in adjacent Areas have 2% chance to be Fractured", short: '2% 物品破裂', scope: 'adjacent', effects: [{ stat: 'currency', percent: 15 }] },

  // --- 黃金燈籠 ---
  { id: 'adj-lantern-1', text: '相鄰區域內含有額外 4 個黃金燈籠', textEn: "Adjacent Areas contain 4 additional Golden Lanterns", short: '+4 黃金燈籠', scope: 'adjacent', effects: [{ stat: 'treasure', percent: 40 }] },

  // --- 眾神殿詞綴（神憑附，Meatfish 用） ---
  { id: 'adj-pantheon-1', text: '相鄰區域內的稀有怪物擁有一條眾神殿詞綴', textEn: "Rare Monsters in adjacent Areas will have a Pantheon Modifier", short: '稀有怪+眾神殿詞綴', scope: 'adjacent', effects: [{ stat: 'rares', percent: 45 }] },

  // --- 傳奇裝備掉落機率（戒指 / 項鍊 / 腰帶） ---
  { id: 'adj-uniquering-1', text: '相鄰區域內掉落的戒指有 10% 機率改為掉落一個傳奇戒指', textEn: "Rings dropped in adjacent Areas have 10% chance to instead drop as a Unique Ring", short: '10% 戒指變傳奇', scope: 'adjacent', effects: [{ stat: 'uniques', percent: 30 }] },
  { id: 'adj-uniquering-2', text: '相鄰區域內掉落的戒指有 20% 機率改為掉落一個傳奇戒指', textEn: "Rings dropped in adjacent Areas have 20% chance to instead drop as a Unique Ring", short: '20% 戒指變傳奇', scope: 'adjacent', effects: [{ stat: 'uniques', percent: 50 }] },
  { id: 'adj-uniqueneck-1', text: '相鄰區域內掉落的項鍊有 10% 機率改為掉落一條傳奇項鍊', textEn: "Amulets dropped in adjacent Areas have 10% chance to instead drop as a Unique Amulet", short: '10% 項鍊變傳奇', scope: 'adjacent', effects: [{ stat: 'uniques', percent: 30 }] },
  { id: 'adj-uniqueneck-2', text: '相鄰區域內掉落的項鍊有 20% 機率改為掉落一條傳奇項鍊', textEn: "Amulets dropped in adjacent Areas have 20% chance to instead drop as a Unique Amulet", short: '20% 項鍊變傳奇', scope: 'adjacent', effects: [{ stat: 'uniques', percent: 50 }] },
  { id: 'adj-uniquebelt-1', text: '相鄰區域內掉落的腰帶有 10% 機率改為掉落一條傳奇腰帶', textEn: "Belts dropped in adjacent Areas have 10% chance to instead drop as a Unique Belt", short: '10% 腰帶變傳奇', scope: 'adjacent', effects: [{ stat: 'uniques', percent: 30 }] },
  { id: 'adj-uniquebelt-2', text: '相鄰區域內掉落的腰帶有 20% 機率改為掉落一條傳奇腰帶', textEn: "Belts dropped in adjacent Areas have 20% chance to instead drop as a Unique Belt", short: '20% 腰帶變傳奇', scope: 'adjacent', effects: [{ stat: 'uniques', percent: 50 }] },

  { id: 'adj-jellyfish-1', text: '相鄰區域內含有一隻友善的水母', textEn: "All Voyage Areas contain Friendly Jellyfish", short: '友善的水母', scope: 'adjacent', effects: [{ stat: 'treasure', percent: 5 }] },

  // ===========================================================================
  // 航程（global scope，效果作用於整趟航程的所有區域）
  // ===========================================================================
  { id: 'voy-souleater-1', text: '玩家在航程中所有區域時擁有噬魂者', textEn: "Players in all Voyage Areas have Soul Eater", short: '航程 噬魂者', scope: 'global', effects: [{ stat: 'treasure', percent: 10 }] },

  { id: 'voy-packsize-1', text: '增加 5% 航程中所有區域的怪物群大小', textEn: "5% increased Pack Size in all Voyage Areas", short: '航程 +5% 怪物群大小', scope: 'global', effects: [{ stat: 'packsize', percent: 5 }] },
  { id: 'voy-packsize-2', text: '增加 7% 航程中所有區域的怪物群大小', textEn: "7% increased Pack Size in all Voyage Areas", short: '航程 +7% 怪物群大小', scope: 'global', effects: [{ stat: 'packsize', percent: 7 }] },

  { id: 'voy-quant-1', text: '增加 8% 航程中所有區域找到的物品數量', textEn: "8% increased Qauntity of Items found in all Voyage Areas", short: '航程 +8% 物品數量', scope: 'global', effects: [{ stat: 'quantity', percent: 8 }] },
  { id: 'voy-quant-2', text: '增加 10% 航程中所有區域找到的物品數量', textEn: "10% increased Qauntity of Items found in all Voyage Areas", short: '航程 +10% 物品數量', scope: 'global', effects: [{ stat: 'quantity', percent: 10 }] },

  { id: 'voy-rarity-1', text: '增加 7% 航程中所有區域找到的物品稀有度', textEn: "7% increased Rarity of Items found in all Voyage Areas", short: '航程 +7% 物品稀有度', scope: 'global', effects: [{ stat: 'rarity', percent: 7 }] },
  { id: 'voy-rarity-2', text: '增加 9% 航程中所有區域找到的物品稀有度', textEn: "9% increased Rarity of Items found in all Voyage Areas", short: '航程 +9% 物品稀有度', scope: 'global', effects: [{ stat: 'rarity', percent: 9 }] },

  { id: 'voy-sulph-1', text: '增加 15% 航程中所有區域內找到的亡者硫酸', textEn: "15% increased Dead Man's Sulphur found in all Voyage Areas", short: '航程 +15% 亡者硫酸', scope: 'global', effects: [{ stat: 'sulphur', percent: 15 }] },
  { id: 'voy-sulph-2', text: '增加 20% 航程中所有區域內找到的亡者硫酸', textEn: "20% increased Dead Man's Sulphur found in all Voyage Areas", short: '航程 +20% 亡者硫酸', scope: 'global', effects: [{ stat: 'sulphur', percent: 20 }] },
  { id: 'voy-sulph-3', text: '增加 25% 航程中所有區域內找到的亡者硫酸', textEn: "25% increased Dead Man's Sulphur found in all Voyage Areas", short: '航程 +25% 亡者硫酸', scope: 'global', effects: [{ stat: 'sulphur', percent: 25 }] },

  { id: 'voy-rare-1', text: '增加 25% 航程中所有區域找到的稀有怪物數量', textEn: "25% increased number of Rare Monsters in all Voyage Areas", short: '航程 +25% 稀有怪', scope: 'global', effects: [{ stat: 'rares', percent: 25 }] },
  { id: 'voy-magic-1', text: '增加 25% 航程中所有區域找到的魔法怪物數量', textEn: "25% increased number of Magic Monsters in all Voyage Areas", short: '航程 +25% 魔法怪', scope: 'global', effects: [{ stat: 'magicmonsters', percent: 25 }] },

  { id: 'voy-noequip-1', text: '怪物無法掉落裝備、藥劑、或萃取物', textEn: "Monsters in all Voyage Areas cannot drop Equipment, Flasks or Tinctures", short: '怪物不掉裝備/藥劑', scope: 'global', effects: [{ stat: 'currency', percent: 30 }] },
  { id: 'voy-minmagic-1', text: '航程中所有區域的所有怪物為魔法', textEn: "Monsters in all Voyage Areas are at least Magic", short: '航程怪物全為魔法', scope: 'global', effects: [{ stat: 'magicmonsters', percent: 100 }] },

  // --- 附身 / 破裂（Meatfish / Divine Border Rares 核心） ---
  { id: 'voy-possess-1', text: '航程中所有區域的稀有怪物有 100% 機率被附身', textEn: "100% chance for Rare Monsters in all Voyage Areas to be Possessed", short: '稀有怪 100% 被附身', scope: 'global', effects: [{ stat: 'rares', percent: 60 }] },
  { id: 'voy-essence-1', text: '航程中所有區域的原生稀有怪物受到精髓囚禁', textEn: "Rare monsters that are natural inhabitants of all Voyage Areas are imprisoned by Essences", short: '原生稀有怪受精髓囚禁', scope: 'global', effects: [{ stat: 'rares', percent: 30 }] },
  { id: 'voy-fracture-1', text: '航程內的稀有怪物有 50% 機率於死亡時散裂', textEn: "Rare Monsters in all Voyage Areas have 50% chance to Fracture on death", short: '稀有怪 50% 死亡散裂', scope: 'global', effects: [{ stat: 'rares', percent: 45 }] },

  { id: 'voy-flaskquality-1', text: '航程中所有區域內找到的藥劑有 100% 機率擁有 20% 品質', textEn: "Flasks found in all Voyage Areas have 100% chance to have 20% Quality", short: '藥劑 100% 20%品質', scope: 'global', effects: [{ stat: 'currency', percent: 10 }] },
]

export const voyageModById = new Map(VOYAGE_MODS.map((m) => [m.id, m]))
