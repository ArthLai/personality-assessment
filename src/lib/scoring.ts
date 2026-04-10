import type {
  Band,
  ConstructScore,
  ChoiceAnswer,
  OpenAnswer,
  CrossValidationResult,
  AssessmentScores,
  Section,
  ChoiceQuestion,
  OpenQuestion,
  ConstructDef,
} from "@/types/assessment";

// ─── Band ───

export function getBand(percent: number): Band {
  if (percent <= 20) return "very_low";
  if (percent <= 40) return "low";
  if (percent <= 60) return "moderate";
  if (percent <= 80) return "high";
  return "very_high";
}

export const BAND_LABELS: Record<Band, string> = {
  very_low: "極低",
  low: "偏低",
  moderate: "中等",
  high: "偏高",
  very_high: "極高",
};

// ─── Likert Scoring ───

export function scoreLikert(
  sections: Section[],
  answers: Record<string, number | string>
): Record<string, ConstructScore> {
  const acc: Record<string, { sum: number; count: number }> = {};

  for (const section of sections) {
    for (const q of section.questions) {
      if (q.type !== "likert" || !q.construct) continue;
      const raw = answers[q.id];
      if (raw === undefined || raw === null) continue;

      let val = typeof raw === "string" ? parseInt(raw, 10) : raw;
      if (isNaN(val)) continue;
      if (q.reverse) val = 6 - val;

      const key = q.construct;
      if (!acc[key]) acc[key] = { sum: 0, count: 0 };
      acc[key].sum += val;
      acc[key].count += 1;
    }
  }

  const result: Record<string, ConstructScore> = {};
  for (const k in acc) {
    const avg = acc[k].sum / acc[k].count;
    const percent = Math.round(((avg - 1) / 4) * 100);
    result[k] = {
      raw: acc[k].sum,
      count: acc[k].count,
      avg: parseFloat(avg.toFixed(2)),
      percent,
      band: getBand(percent),
    };
  }
  return result;
}

// ─── Choice ───

export function processChoiceAnswers(
  sections: Section[],
  answers: Record<string, number | string>
): Record<string, ChoiceAnswer> {
  const result: Record<string, ChoiceAnswer> = {};
  for (const section of sections) {
    for (const q of section.questions) {
      if (q.type !== "choice") continue;
      const choiceQ = q as ChoiceQuestion;
      const selected = answers[q.id];
      if (selected === undefined || selected === null) continue;
      const selectedStr = String(selected);
      const option = choiceQ.options.find((o) => o.val === selectedStr);
      result[q.id] = {
        selected: selectedStr,
        maps_to: option?.maps_to ?? null,
        construct_label: choiceQ.construct,
      };
    }
  }
  return result;
}

// ─── Open ───

export function processOpenAnswers(
  sections: Section[],
  answers: Record<string, number | string>
): Record<string, OpenAnswer> {
  const result: Record<string, OpenAnswer> = {};
  for (const section of sections) {
    for (const q of section.questions) {
      if (q.type !== "open") continue;
      const openQ = q as OpenQuestion;
      const text = answers[q.id];
      if (!text || typeof text !== "string" || text.trim() === "") continue;
      result[q.id] = { text: String(text).trim(), tags: openQ.tags };
    }
  }
  return result;
}

// ─── Cross Validation ───

export function runCrossValidation(
  scores: Record<string, ConstructScore>,
  choiceAnswers: Record<string, ChoiceAnswer>
): CrossValidationResult[] {
  const results: CrossValidationResult[] = [];

  // cv1: 自主需求一致性
  {
    const sdtAut = scores.SDT_AUT;
    const q42 = choiceAnswers.q42?.selected;
    const q103 = choiceAnswers.q103?.selected;
    if (sdtAut) {
      const autHigh = sdtAut.percent >= 75;
      const q42IsA = q42 === "A";
      const q103IsA = q103 === "A";
      const consistentCount = [autHigh, q42IsA, q103IsA].filter(Boolean).length;
      if (consistentCount >= 2) {
        results.push({
          id: "cv1",
          name: "自主需求一致性",
          status: "consistent",
          detail: `SDT_AUT=${sdtAut.percent}%, q42=${q42 || "N/A"}, q103=${q103 || "N/A"}`,
          explanation:
            "你的自主性需求在量表分數和強制選擇中高度一致。「被微管理」是你最大的能量黑洞,「自由」是你最不願放棄的東西。這代表自主性是你的核心驅動力,不只是偏好,而是影響你投入程度的關鍵開關。",
        });
      } else if (autHigh && !q42IsA && !q103IsA) {
        results.push({
          id: "cv1",
          name: "自主需求一致性",
          status: "inconsistent",
          detail: `SDT_AUT=${sdtAut.percent}%, q42=${q42 || "N/A"}, q103=${q103 || "N/A"}`,
          explanation:
            "你的自主性量表分數偏高,但在強制選擇中,被微管理和失去自由並非你最痛的選項。這可能意味著你的自主需求是情境性的——在某些領域需要掌控,但在其他領域可以接受引導。值得探索:哪些情境下自主性對你最重要?",
        });
      }
    }
  }

  // cv2: 勝任需求一致性
  {
    const sdtCom = scores.SDT_COM;
    const q41 = choiceAnswers.q41?.selected;
    const q42 = choiceAnswers.q42?.selected;
    if (sdtCom) {
      const comHigh = sdtCom.percent >= 75;
      const q41IsA = q41 === "A";
      const q42IsC = q42 === "C";
      const consistentCount = [comHigh, q41IsA, q42IsC].filter(Boolean).length;
      if (consistentCount >= 2) {
        results.push({
          id: "cv2",
          name: "勝任需求一致性",
          status: "consistent",
          detail: `SDT_COM=${sdtCom.percent}%, q41=${q41 || "N/A"}, q42=${q42 || "N/A"}`,
          explanation:
            "你對成長和精進的追求在量表和強制選擇中一致。做出別人做不到的事讓你最有動力,持續做低於能力的事讓你最痛苦。成長不只是你的偏好,而是你的核心價值——停滯對你來說等於退步。",
        });
      } else if (comHigh && !q41IsA && !q42IsC) {
        results.push({
          id: "cv2",
          name: "勝任需求一致性",
          status: "inconsistent",
          detail: `SDT_COM=${sdtCom.percent}%, q41=${q41 || "N/A"}, q42=${q42 || "N/A"}`,
          explanation:
            "你的勝任感量表分數高,但在強制選擇中,驅動力和痛苦來源指向其他地方。這暗示勝任感可能是你達到其他目標的手段,而非最終目的。你追求能力,但可能是為了自主、認可或影響力。",
        });
      }
    }
  }

  // cv3: 外向性行為矛盾
  {
    const bfE = scores.BF_E;
    const capsSocHi = scores.CAPS_SOC_HI;
    const capsPushback = scores.CAPS_PUSHBACK;
    if (
      bfE && bfE.percent <= 40 &&
      ((capsSocHi && capsSocHi.percent >= 75) || (capsPushback && capsPushback.percent >= 75))
    ) {
      results.push({
        id: "cv3",
        name: "外向性行為矛盾",
        status: "inconsistent",
        detail: `BF_E=${bfE.percent}%, CAPS_SOC_HI=${capsSocHi?.percent ?? "N/A"}%, CAPS_PUSHBACK=${capsPushback?.percent ?? "N/A"}%`,
        explanation:
          "你的外向性偏低(偏內向),但在高壓社交場合卻很主動。這不是矛盾——你是「目標驅動的社交者」:社交本身不充電,但當議題重要時,你會切換到主動模式。這是一種策略性外向,能量來源是目標而非互動本身。",
      });
    }
  }

  // cv4: 盡責性-ADHD 模式
  {
    const bfC = scores.BF_C;
    const capsDeadline = scores.CAPS_DEADLINE;
    const capsLeisure = scores.CAPS_LEISURE;
    if (
      bfC && bfC.band === "moderate" &&
      capsDeadline && capsDeadline.percent >= 75 &&
      capsLeisure && capsLeisure.percent >= 75
    ) {
      results.push({
        id: "cv4",
        name: "盡責性-ADHD 模式",
        status: "pattern_detected",
        detail: `BF_C=${bfC.percent}%, CAPS_DEADLINE=${capsDeadline.percent}%, CAPS_LEISURE=${capsLeisure.percent}%`,
        explanation:
          "你的盡責性中等,但截止日前爆發力極高,空閒時又很難放鬆。這是典型的「外部錨點依賴型紀律」:有明確的外部壓力時你極度自律,但沒有錨點時系統會漂移。可能的策略:為自己創造人為的截止日和外部問責結構。",
      });
    }
  }

  // cv5: 趨避焦點平衡
  {
    const rfPro = scores.RF_PRO;
    const rfPre = scores.RF_PRE;
    if (rfPro && rfPre) {
      const diff = Math.abs(rfPro.percent - rfPre.percent);
      if (diff <= 15) {
        results.push({
          id: "cv5",
          name: "趨避焦點平衡",
          status: "pattern_detected",
          detail: `RF_PRO=${rfPro.percent}%, RF_PRE=${rfPre.percent}%`,
          explanation:
            "你的促進焦點和預防焦點強度接近,是「雙焦點模式」。你同時被正面願景拉動、也被風險意識推動。優勢是你既有衝勁又有風險意識;挑戰是決策時可能出現拉扯——想衝又想穩。關鍵是辨識哪些決策適合哪種焦點主導。",
        });
      } else if (rfPro.percent > rfPre.percent) {
        results.push({
          id: "cv5",
          name: "趨避焦點",
          status: "consistent",
          detail: `RF_PRO=${rfPro.percent}% > RF_PRE=${rfPre.percent}%`,
          explanation:
            "你明確由促進焦點驅動——追求成長、機會和理想自我。你更關注「能得到什麼」而非「會失去什麼」。這讓你勇於嘗試,但可能低估風險。決策時適當加入預防焦點的檢查清單,可以補強盲點。",
        });
      } else {
        results.push({
          id: "cv5",
          name: "趨避焦點",
          status: "consistent",
          detail: `RF_PRE=${rfPre.percent}% > RF_PRO=${rfPro.percent}%`,
          explanation:
            "你明確由預防焦點驅動——風險評估、義務感和避免損失是你的行動引擎。你擅長把事情做對、做穩,但可能錯過需要大膽一跳的機會。在低風險情境中練習促進焦點的思維,可以擴大你的行動範圍。",
        });
      }
    }
  }

  // cv6: 認可 vs 地位分離
  {
    const rmRec = scores.RM_REC;
    const rmSta = scores.RM_STA;
    const hxH = scores.HX_H;
    if (rmRec && rmRec.percent >= 75 && rmSta && rmSta.percent <= 40 && hxH && hxH.percent >= 60) {
      results.push({
        id: "cv6",
        name: "認可 vs 地位分離",
        status: "pattern_detected",
        detail: `RM_REC=${rmRec.percent}%, RM_STA=${rmSta.percent}%, HX_H=${hxH.percent}%`,
        explanation:
          "你希望作品被看見、被認可,但對個人頭銜或地位象徵不感興趣。搭配高誠實-謙遜分數,你追求的是「作品的能見度」而非「個人的崇拜」。你可能不擅長自我推銷,但對作品品質的堅持會成為長期的個人品牌。",
      });
    }
  }

  // cv7: 價值基礎脆弱度
  {
    const selfDoing = scores.SELF_DOING;
    const selfBeing = scores.SELF_BEING;
    const idConflict = scores.ID_CONFLICT;
    if (
      selfDoing && selfDoing.percent >= 75 &&
      selfBeing && selfBeing.percent <= 60 &&
      idConflict && idConflict.percent >= 75
    ) {
      results.push({
        id: "cv7",
        name: "價值基礎脆弱度",
        status: "pattern_detected",
        detail: `SELF_DOING=${selfDoing.percent}%, SELF_BEING=${selfBeing.percent}%, ID_CONFLICT=${idConflict.percent}%`,
        explanation:
          "你的自我價值高度綁定在「做出了什麼」上,但在沒有成就時難以感受到自身價值,加上多重身份之間有衝突感。這意味著低產出期(生病、休息、轉換期)可能觸發身份危機。建議:有意識地練習「不做事的自己也有價值」,這不是躺平,而是建立更穩固的自我基礎。",
      });
    }
  }

  // cv8: 壓力迴圈
  {
    const copPro = scores.COP_PRO;
    const copSolo = scores.COP_SOLO;
    const capsLeisure = scores.CAPS_LEISURE;
    const q93 = choiceAnswers.q93?.selected;
    if (
      copPro && copPro.percent >= 75 &&
      copSolo && copSolo.percent >= 75 &&
      capsLeisure && capsLeisure.percent >= 75 &&
      q93 === "B"
    ) {
      results.push({
        id: "cv8",
        name: "壓力迴圈",
        status: "pattern_detected",
        detail: `COP_PRO=${copPro.percent}%, COP_SOLO=${copSolo.percent}%, CAPS_LEISURE=${capsLeisure.percent}%, q93=B`,
        explanation:
          "你壓力下傾向獨自面對、用行動解決問題,空閒時又會立刻填滿時間,高壓期後選擇「用下一個專案帶過」。這形成了一個迴圈:高產出 → 不休息 → 用新刺激覆蓋疲勞 → 能量透支 → Burnout。打破迴圈的關鍵:在「還不累」的時候就主動安排恢復,而非等到撐不住。",
      });
    }
  }

  // cv9: HSS+HSP 特質
  {
    const bfO = scores.BF_O;
    const bfE = scores.BF_E;
    const sdtCom = scores.SDT_COM;
    const capsLeisure = scores.CAPS_LEISURE;
    const capsNovel = scores.CAPS_NOVEL;
    const copSolo = scores.COP_SOLO;
    const sdtRel = scores.SDT_REL;
    if (
      bfO && bfO.band === "very_high" &&
      bfE && bfE.percent <= 40 &&
      sdtCom && sdtCom.band === "very_high" &&
      capsLeisure && capsLeisure.percent >= 75 &&
      capsNovel && capsNovel.percent >= 75 &&
      copSolo && copSolo.percent >= 75 &&
      sdtRel && sdtRel.percent >= 60
    ) {
      results.push({
        id: "cv9",
        name: "HSS+HSP 特質",
        status: "pattern_detected",
        detail: `BF_O=${bfO.percent}%, BF_E=${bfE.percent}%, SDT_COM=${sdtCom.percent}%, CAPS_NOVEL=${capsNovel.percent}%`,
        explanation:
          "你同時具有高感覺尋求 (High Sensation Seeking) 和高敏感 (Highly Sensitive) 的特質組合。你需要持續的新刺激和挑戰,但每份刺激的處理深度高於平均,這導致能量消耗速度快。你不是「精力無限」,而是「燃燒效率高但油箱有限」。管理策略:控制刺激的密度而非種類。",
      });
    }
  }

  return results;
}

// ─── Orchestrator ───

export function computeAllScores(
  sections: Section[],
  answers: Record<string, number | string>,
  respondentId?: string
): AssessmentScores {
  const constructScores = scoreLikert(sections, answers);
  const choiceAnswers = processChoiceAnswers(sections, answers);
  const openAnswers = processOpenAnswers(sections, answers);
  const crossValidations = runCrossValidation(constructScores, choiceAnswers);

  return {
    respondent_id: respondentId || crypto.randomUUID(),
    computed_at: new Date().toISOString(),
    construct_scores: constructScores,
    choice_answers: choiceAnswers,
    open_answers: openAnswers,
    cross_validations: crossValidations,
  };
}

// ─── Basic Interpretation ───

export function generateBasicInterpretation(
  constructId: string,
  score: ConstructScore,
  constructDef: ConstructDef
): string {
  const label = constructDef.label_zh;
  const { band, percent } = score;

  switch (band) {
    case "very_high":
      return `${label}:極高 (${percent}%)。${constructDef.pole_high}`;
    case "high":
      return `${label}:偏高 (${percent}%)。偏向${constructDef.pole_high}`;
    case "moderate":
      return `${label}:中等 (${percent}%)。在${constructDef.pole_high}與${constructDef.pole_low}之間`;
    case "low":
      return `${label}:偏低 (${percent}%)。偏向${constructDef.pole_low}`;
    case "very_low":
      return `${label}:極低 (${percent}%)。${constructDef.pole_low}`;
  }
}
