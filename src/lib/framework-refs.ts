export interface FrameworkRef {
  groupName: string;
  frameworkName: string;
  source: string;
  description: string;
  groupInsight: string;
}

export const FRAMEWORK_REFS: Record<string, FrameworkRef> = {
  "Big Five 人格": {
    groupName: "Big Five 人格",
    frameworkName: "Big Five + HEXACO",
    source: "Costa & McCrae (1992); Ashton & Lee (2007)",
    description: "學界最廣泛使用的人格特質模型。",
    groupInsight:
      "把這六個分數想成你的「出廠設定」。它們不決定你能做什麼,但決定了你做事時的自然傾向 — 像是你的預設模式。沒有好壞,只有適不適合。",
  },
  "基本心理需求 (SDT)": {
    groupName: "基本心理需求 (SDT)",
    frameworkName: "Self-Determination Theory",
    source: "Deci & Ryan (2000)",
    description: "三大基本心理需求理論。",
    groupInsight:
      "這三個需求就像你的「充電方式」。分數最高的是你的主要充電器 — 滿足它你就有動力;分數最低的,可能是你能量漏洞的來源。",
  },
  "Reiss 動機側寫": {
    groupName: "Reiss 動機側寫",
    frameworkName: "Reiss Motivation Profile",
    source: "Reiss (2004)",
    description: "個人動機指紋。",
    groupInsight:
      "這 8 個分數就是你的「動力地圖」。前 2-3 高的解釋了你為什麼會被某些事吸引,為什麼某些事你明明不賺錢也想做。沒有標準組合,只有你的組合。",
  },
  "趨近 vs 規避": {
    groupName: "趨近 vs 規避",
    frameworkName: "Regulatory Focus Theory",
    source: "Higgins (1997)",
    description: "做事的底層方向。",
    groupInsight:
      "簡單說:你做事是因為「想要得到好的」還是「怕得到壞的」?有人是油門型(被機會驅動),有人是煞車型(被風險驅動)。兩者都有也很常見。",
  },
  "思維與認知": {
    groupName: "思維與認知",
    frameworkName: "Mindset + Need for Cognition + Cognitive Style",
    source: "Dweck (2006); Cacioppo (1984); Kirton (1976)",
    description: "思維模式與認知偏好。",
    groupInsight:
      "這組數據畫出你「怎麼想事情」。有人習慣先看全景再補細節,有人反過來;有人靠數據,有人靠直覺。了解自己的思考模式,就能知道什麼時候該切換到不同模式。",
  },
  "壓力應對": {
    groupName: "壓力應對",
    frameworkName: "Coping Styles + Emotional Awareness",
    source: "Lazarus & Folkman (1984)",
    description: "壓力下的應對策略。",
    groupInsight:
      "壓力大的時候,你本能會做什麼?有人列清單衝、有人先處理情緒、有人暫時逃避充電。這些都是策略,沒有對錯 — 關鍵是知道自己的本能,才能在需要時有意識地換檔。",
  },
  "自我認知": {
    groupName: "自我認知",
    frameworkName: "Self-Concept & Identity",
    source: "Clance & Imes (1978); Crocker & Wolfe (2001)",
    description: "自我認知結構。",
    groupInsight:
      "這組是最深層的:你的自信建立在什麼上?沒有成果的時候你還覺得自己有價值嗎?這些答案決定了你在順境和逆境時的韌性差異。",
  },
  "情境化 if-then": {
    groupName: "情境化 if-then",
    frameworkName: "Mischel CAPS",
    source: "Mischel & Shoda (1995)",
    description: "情境化行為模式。",
    groupInsight:
      "你不是在所有場合都一樣的人 — 這很正常。這 12 個情境畫出你的「行為切換地圖」:什麼時候你超級有效率,什麼時候你會卡住,什麼時候你會變成完全不同的人。",
  },
};
