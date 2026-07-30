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
  { id: 'b-packsize-1', text: '增加 16% 相鄰區域的怪物群大小', short: '+16% 怪物群大小', effects: [{ stat: 'packsize', percent: 16 }] },
  { id: 'b-packsize-2', text: '增加 24% 相鄰區域的怪物群大小', short: '+24% 怪物群大小', effects: [{ stat: 'packsize', percent: 24 }] },
  { id: 'b-packsize-3', text: '增加 32% 相鄰區域的怪物群大小', short: '+32% 怪物群大小', effects: [{ stat: 'packsize', percent: 32 }] },

  // --- 怪物稀有度下限 ---
  { id: 'b-magicmin', text: '相鄰區域的所有怪物至少為魔法', short: '怪物至少為魔法', effects: [{ stat: 'magicmonsters', percent: 100 }] },

  // --- 稀有怪物數量（Divine Border Rares 核心之一：border:rare） ---
  { id: 'b-rare-1', text: '增加 50% 相鄰區域找到的稀有怪物數量', short: '+50% 稀有怪物', effects: [{ stat: 'rares', percent: 50 }] },
  { id: 'b-rare-2', text: '增加 75% 相鄰區域找到的稀有怪物數量', short: '+75% 稀有怪物', effects: [{ stat: 'rares', percent: 75 }] },
  { id: 'b-rare-3', text: '增加 100% 相鄰區域找到的稀有怪物數量', short: '+100% 稀有怪物', effects: [{ stat: 'rares', percent: 100 }] },

  // --- 特定生物群 ---
  { id: 'b-seabeast-1', text: '相鄰區域內含有額外8群海洋野獸', short: '+8群 海洋野獸', effects: [{ stat: 'packsize', percent: 8 }] },
  { id: 'b-seabeast-2', text: '相鄰區域內含有額外12群海洋野獸', short: '+12群 海洋野獸', effects: [{ stat: 'packsize', percent: 12 }] },
  { id: 'b-seabeast-3', text: '相鄰區域內含有額外16群海洋野獸', short: '+16群 海洋野獸', effects: [{ stat: 'packsize', percent: 16 }] },
  { id: 'b-crab-1', text: '相鄰區域內含有額外8群螃蟹', short: '+8群 螃蟹', effects: [{ stat: 'packsize', percent: 8 }] },
  { id: 'b-crab-2', text: '相鄰區域內含有額外12群螃蟹', short: '+12群 螃蟹', effects: [{ stat: 'packsize', percent: 12 }] },
  { id: 'b-crab-3', text: '相鄰區域內含有額外16群螃蟹', short: '+16群 螃蟹', effects: [{ stat: 'packsize', percent: 16 }] },
  { id: 'b-drowned-1', text: '相鄰區域內含有額外8群浮屍', short: '+8群 浮屍', effects: [{ stat: 'packsize', percent: 8 }] },
  { id: 'b-drowned-2', text: '相鄰區域內含有額外12群浮屍', short: '+12群 浮屍', effects: [{ stat: 'packsize', percent: 12 }] },
  { id: 'b-drowned-3', text: '相鄰區域內含有額外16群浮屍', short: '+16群 浮屍', effects: [{ stat: 'packsize', percent: 16 }] },

  // --- 固定詞綴幅度（放大該格圖表自身詞綴，非戰利品，用 magnitude 欄位處理） ---
  { id: 'b-magnitude-1', text: '相鄰區域增加 40% 固定詞綴幅度', short: '+40% 詞綴幅度', effects: [], magnitude: 40 },
  { id: 'b-magnitude-2', text: '相鄰區域增加 60% 固定詞綴幅度', short: '+60% 詞綴幅度', effects: [], magnitude: 60 },
  { id: 'b-magnitude-3', text: '相鄰區域增加 80% 固定詞綴幅度', short: '+80% 詞綴幅度', effects: [], magnitude: 80 },

  // --- 圖表保留 ---
  { id: 'b-preserve-1', text: '相鄰海圖在啟航時有 30% 機率不會被消耗', short: '30% 不消耗海圖', effects: [{ stat: 'preserve', percent: 30 }] },
  { id: 'b-preserve-2', text: '相鄰海圖在啟航時有 50% 機率不會被消耗', short: '50% 不消耗海圖', effects: [{ stat: 'preserve', percent: 50 }] },

  // --- 特殊小怪 / 場景物件（風味為主，給小額 treasure 權重） ---
  { id: 'b-crabking', text: '相鄰區域內含有一個垢爪怪', short: '垢爪怪', effects: [{ stat: 'treasure', percent: 10 }] },
  { id: 'b-lantern-nocost', text: '在相鄰區域放置燈籠時不會減少你的燈籠數量', short: '燈籠不消耗', effects: [{ stat: 'treasure', percent: 15 }] },

  // --- 稀有怪掉落額外通貨（Divine Border Rares 核心：border:divine） ---
  { id: 'b-ancient', text: '相鄰區域內的稀有怪物掉落額外 1 個古變石', short: '稀有怪掉古變石', effects: [{ stat: 'currency', percent: 20 }] },
  { id: 'b-divine', text: '相鄰區域內的稀有怪物掉落額外 1 個神聖石', short: '稀有怪掉神聖石', effects: [{ stat: 'currency', percent: 100 }] },
  { id: 'b-exalt', text: '相鄰區域內的稀有怪物掉落額外 1 個崇高石', short: '稀有怪掉崇高石', effects: [{ stat: 'currency', percent: 60 }] },
  { id: 'b-annul', text: '相鄰區域內的稀有怪物掉落額外 1 個無效石', short: '稀有怪掉無效石', effects: [{ stat: 'currency', percent: 15 }] },
  { id: 'b-chaos', text: '相鄰區域內的稀有怪物掉落額外 1 個混沌石', short: '稀有怪掉混沌石', effects: [{ stat: 'currency', percent: 10 }] },
  { id: 'b-vaal', text: '相鄰區域內的稀有怪物掉落額外 1 個瓦爾寶珠', short: '稀有怪掉瓦爾寶珠', effects: [{ stat: 'currency', percent: 12 }] },
  { id: 'b-prism', text: '相鄰區域內的稀有怪物掉落額外 1 個寶石匠的稜鏡', short: '稀有怪掉稜鏡', effects: [{ stat: 'currency', percent: 8 }] },
  { id: 'b-chromatic', text: '相鄰區域內的稀有怪物掉落額外 1 個幻色石', short: '稀有怪掉幻色石', effects: [{ stat: 'currency', percent: 5 }] },
  { id: 'b-regret', text: '相鄰區域內的稀有怪物掉落額外 1 個後悔石', short: '稀有怪掉後悔石', effects: [{ stat: 'currency', percent: 5 }] },
  { id: 'b-blessed', text: '相鄰區域內的稀有怪物掉落額外 1 個祝福石', short: '稀有怪掉祝福石', effects: [{ stat: 'currency', percent: 5 }] },
  { id: 'b-exotic', text: '相鄰區域內的稀有怪物掉落額外 1 個富豪石', short: '稀有怪掉富豪石', effects: [{ stat: 'currency', percent: 5 }] },
  { id: 'b-supportgem', text: '相鄰區域內的稀有怪物有 20% 機率掉落一個輔助寶石', short: '20% 掉輔助寶石', effects: [{ stat: 'currency', percent: 15 }] },

  // --- 場景寶物 ---
  { id: 'b-lockbox', text: '相鄰區域內含有一個失落的海盜鎖櫃', short: '海盜鎖櫃', effects: [{ stat: 'treasure', percent: 20 }] },
  { id: 'b-bandits', text: '相鄰區域內含有一個布琳洛特洗劫團夥', short: '洗劫團夥', effects: [{ stat: 'treasure', percent: 20 }] },

  // --- 每連接數縮放（perConnEffects，family 仍歸類為 rare / quantity 以便共用權重） ---
  { id: 'b-rare-conn-1', text: '相鄰區域每與一個區域相連，即增加 50% 稀有怪物數量', short: '每連接 +50% 稀有怪', effects: [], perConnEffects: [{ stat: 'rares', percent: 50 }] },
  { id: 'b-rare-conn-2', text: '相鄰區域每與一個區域相連，即增加 75% 稀有怪物數量', short: '每連接 +75% 稀有怪', effects: [], perConnEffects: [{ stat: 'rares', percent: 75 }] },
  {
    id: 'b-quant-conn-1',
    text: '相鄰區域每與一個區域相連，即減少 50% 找到的物品數量\n增加 120% 相鄰區域找到的物品數量',
    short: '每連接 +120% 物品數量',
    effects: [{ stat: 'quantity', percent: 120 }],
    perConnEffects: [{ stat: 'quantity', percent: -50 }],
  },
  {
    id: 'b-quant-conn-2',
    text: '相鄰區域每與一個區域相連，即減少 50% 找到的物品數量\n增加 180% 相鄰區域找到的物品數量',
    short: '每連接 +180% 物品數量',
    effects: [{ stat: 'quantity', percent: 180 }],
    perConnEffects: [{ stat: 'quantity', percent: -50 }],
  },

  // --- 裝備轉金幣 ---
  { id: 'b-gold-1', text: '相鄰區域內的怪物掉落的裝備有 25% 會改為掉落金幣', short: '25% 裝備轉金幣', effects: [{ stat: 'gold', percent: 25 }] },
  { id: 'b-gold-2', text: '相鄰區域內的怪物掉落的裝備有 50% 會改為掉落金幣', short: '50% 裝備轉金幣', effects: [{ stat: 'gold', percent: 50 }] },
  { id: 'b-divcard', text: '相鄰區域內怪物所掉落的基礎通貨會改為豐裕牌組', short: '通貨改豐裕牌組', effects: [{ stat: 'divcards', percent: 30 }] },
  { id: 'b-scarab-drop', text: '相鄰區域內的稀有怪物掉落額外 1 個聖甲蟲', short: '稀有怪掉聖甲蟲', effects: [{ stat: 'scarabs', percent: 20 }] },

  // --- 找到更多通貨/聖甲蟲/稀有度 ---
  { id: 'b-currency-1', text: '相鄰區域內找到 50% 更多通貨', short: '+50% 更多通貨', effects: [{ stat: 'currency', percent: 50 }] },
  { id: 'b-currency-2', text: '相鄰區域內找到 75% 更多通貨', short: '+75% 更多通貨', effects: [{ stat: 'currency', percent: 75 }] },
  { id: 'b-currency-3', text: '相鄰區域內找到 100% 更多通貨', short: '+100% 更多通貨', effects: [{ stat: 'currency', percent: 100 }] },
  { id: 'b-scarabpct-1', text: '相鄰區域內找到 50% 更多聖甲蟲', short: '+50% 更多聖甲蟲', effects: [{ stat: 'scarabs', percent: 50 }] },
  { id: 'b-scarabpct-2', text: '相鄰區域內找到 75% 更多聖甲蟲', short: '+75% 更多聖甲蟲', effects: [{ stat: 'scarabs', percent: 75 }] },
  { id: 'b-scarabpct-3', text: '相鄰區域內找到 100% 更多聖甲蟲', short: '+100% 更多聖甲蟲', effects: [{ stat: 'scarabs', percent: 100 }] },
  { id: 'b-rarity-1', text: '相鄰區域有 50% 更多找到的物品稀有度', short: '+50% 更多物品稀有度', effects: [{ stat: 'rarity', percent: 50 }] },
  { id: 'b-rarity-2', text: '相鄰區域有 75% 更多找到的物品稀有度', short: '+75% 更多物品稀有度', effects: [{ stat: 'rarity', percent: 75 }] },
  { id: 'b-rarity-3', text: '相鄰區域有 100% 更多找到的物品稀有度', short: '+100% 更多物品稀有度', effects: [{ stat: 'rarity', percent: 100 }] },

  // --- 場景事件 / 經驗值 / 其他 ---
  { id: 'b-miniboss', text: '相鄰區域內含有一個船長之災', short: '船長之災', effects: [{ stat: 'treasure', percent: 25 }] },
  { id: 'b-exp-1', text: '相鄰區域內的玩家增加 100% 獲取的經驗值', short: '+100% 經驗值', effects: [{ stat: 'exp', percent: 100 }] },
  { id: 'b-exp-2', text: '相鄰區域內的玩家增加 150% 獲取的經驗值', short: '+150% 經驗值', effects: [{ stat: 'exp', percent: 150 }] },
  { id: 'b-exp-3', text: '相鄰區域內的玩家增加 200% 獲取的經驗值', short: '+200% 經驗值', effects: [{ stat: 'exp', percent: 200 }] },
  { id: 'b-magicaffix', text: '相鄰區域內的魔法怪物額外擁有一條詞綴', short: '魔法怪 +1 詞綴', effects: [{ stat: 'magicmonsters', percent: 30 }] },
  { id: 'b-anchor-1', text: '相鄰區域內含有額外 2 個寶藏船錨', short: '+2 寶藏船錨', effects: [{ stat: 'treasure', percent: 20 }] },
  { id: 'b-anchor-2', text: '相鄰區域內含有額外 4 個寶藏船錨', short: '+4 寶藏船錨', effects: [{ stat: 'treasure', percent: 35 }] },
  { id: 'b-sulphdrop', text: '相鄰區域內的稀有怪物被擊殺時會掉落亡者硫酸', short: '稀有怪掉亡者硫酸', effects: [{ stat: 'sulphur', percent: 30 }] },
  { id: 'b-lantern-4', text: '相鄰區域內含有額外 4 個黃金燈籠', short: '+4 黃金燈籠', effects: [{ stat: 'treasure', percent: 40 }] },
  { id: 'b-altar', text: '相鄰區域內含有 2 座女神的祭壇', short: '2 座女神祭壇', effects: [{ stat: 'treasure', percent: 25 }] },
]

export const borderModById = new Map(BORDER_MODS.map((m) => [m.id, m]))

// ---------------------------------------------------------------------------
// 海圖固定詞綴（相鄰 adj- / 航程 voy-）
// 目前只收錄實測貼上樣本中出現過的詞綴；其餘（星魚 star / 神憑附 pantheon /
// 金燈籠 lantern / 強化寶箱 box / 附身 possess / 破裂 fracture 等）尚未取得
// 真實中文字串，先留空位，解析器遇到未知固定詞綴時會保留原文（rawText/implicitText），
// 不會遺失資料，之後補上文字即可自動生效。
// ---------------------------------------------------------------------------
export const VOYAGE_MODS: VoyageModDef[] = [
  { id: 'adj-packsize-1', text: '相鄰區域內含有額外 17(16-20) 堆木桶', short: '木桶堆', scope: 'adjacent', effects: [{ stat: 'treasure', percent: 15 }] },
  { id: 'adj-magicboost-1', text: '怪物有機率受到 2000 個荒林妖精強化', short: '荒林妖精強化', scope: 'adjacent', effects: [{ stat: 'magicmonsters', percent: 20 }] },
  { id: 'adj-unique-1', text: '相鄰區域內掉落的項鍊有 10% 機率改為掉落一條傳奇項鍊', short: '10% 項鍊變傳奇', scope: 'adjacent', effects: [{ stat: 'uniques', percent: 30 }] },
  { id: 'voy-packsize-1', text: '增加 7% 航程中所有區域的怪物群大小', short: '航程 +7% 怪物群大小', scope: 'global', effects: [{ stat: 'packsize', percent: 7 }] },
  { id: 'voy-rarity-1', text: '增加 7% 航程中所有區域找到的物品稀有度', short: '航程 +7% 物品稀有度', scope: 'global', effects: [{ stat: 'rarity', percent: 7 }] },

  // --- Divine Border Rares 還需要，但尚無真實文字（先放佔位，之後補文字即可） ---
  // { id: 'adj-star-1', text: '???（星魚 giga-starfish 相關）', scope: 'adjacent', effects: [{ stat: 'rares', percent: 40 }] },
  // { id: 'adj-box-1',  text: '???（相鄰區域含強化寶箱）', scope: 'adjacent', effects: [{ stat: 'treasure', percent: 40 }] },
  // { id: 'voy-possess-1', text: '???（Pantheon 附身相關）', scope: 'global', effects: [{ stat: 'rares', percent: 20 }] },
  // { id: 'voy-fracture-1', text: '???（破裂 fracture 相關）', scope: 'global', effects: [{ stat: 'rares', percent: 20 }] },
]

export const voyageModById = new Map(VOYAGE_MODS.map((m) => [m.id, m]))
