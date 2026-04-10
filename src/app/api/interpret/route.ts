import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

const SYSTEM_PROMPT = `你是一位很懂人、說話直接但溫暖的人格分析師。你整合了多個心理學框架,但你不會用學術語言說話 — 你像一個很了解對方的朋友,用白話文聊天。

你會收到一份測評的 JSON 結果(包含量表分數、選擇題答案、開放題回答、交叉驗證結果)。

寫作風格:
1. 用白話文,像在跟朋友聊天。避免學術術語,如果非要提到,用括號簡單解釋
2. 多用生活化的比喻和例子,讓人「啊,對,就是這樣!」
3. 語氣直接、不客套,用「你」不用「您」
4. 每個區塊開頭先給一句話結論(像 TL;DR),再展開
5. 不要逐題翻譯分數,而是找出「故事」:為什麼這個人會這樣?背後的邏輯是什麼?
6. 開放題的回答是最珍貴的素材,一定要引用和解讀
7. 如果有矛盾,不要迴避,直接指出來,用「有趣的是...」或「值得注意的是...」開頭
8. 報告使用繁體中文

報告結構(共 9 個區塊,每個區塊用 ## 標記):
## 1. 你的底層性格
## 2. 什麼在驅動你
## 3. 你做決定的方式
## 4. 你怎麼思考
## 5. 你在不同場合的切換
## 6. 壓力來了你怎麼辦
## 7. 你怎麼看自己
## 8. 特別發現（如果數據顯示 ADHD/高敏感/高刺激尋求等特質組合）
## 9. 總結：一段話說完你這個人

重要:如果使用者提供了個人脈絡(身份角色、卡關點、想突破的方向),你必須:
1. 在每個相關區塊的最後,用 ### 行動建議 小標題,給出 1-2 條具體建議
2. 建議要具體到「明天就能開始做」的程度,例如「每天早上花 10 分鐘寫下...」而不是「建議你多反思」
3. 在第 9 區塊之後,額外加一個 ## 10. 你的下一步 區塊,整合最重要的 3-5 條行動,按優先順序排
4. 如果沒有提供脈絡,就跳過行動建議,專注分析`;

export async function POST(request: NextRequest) {
  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "API key not configured" },
      { status: 500 }
    );
  }

  // Rate limit by IP
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const { allowed, remaining } = checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      {
        error: "今日測評解讀次數已達上限 (10 次/天),請明天再試。",
        remaining: 0,
      },
      {
        status: 429,
        headers: { "Retry-After": "86400" },
      }
    );
  }

  try {
    const body = await request.json();
    const { scores_json, context } = body;

    if (!scores_json) {
      return NextResponse.json(
        { error: "scores_json is required" },
        { status: 400 }
      );
    }

    // Build user prompt with optional context
    let userPrompt = `以下是測評結果 JSON,請產出完整脈絡解讀報告:\n\n\`\`\`json\n${JSON.stringify(scores_json, null, 2)}\n\`\`\``;

    if (context && (context.role || context.stuck_point || context.breakthrough)) {
      userPrompt += `\n\n---\n\n使用者提供的個人脈絡:\n`;
      if (context.role) userPrompt += `- 目前身份/角色:${context.role}\n`;
      if (context.stuck_point) userPrompt += `- 目前最卡住的事:${context.stuck_point}\n`;
      if (context.breakthrough) userPrompt += `- 最想突破的方向:${context.breakthrough}\n`;
      userPrompt += `\n請根據以上脈絡,在每個相關區塊給出具體行動建議,並在報告最後加上「## 10. 你的下一步」區塊。`;
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 8192,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: userPrompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Anthropic API error:", response.status, errorText);
      return NextResponse.json(
        { error: "AI 解讀生成失敗,請稍後再試。" },
        { status: 502 }
      );
    }

    const data = await response.json();
    const interpretation = data.content
      .filter((item: { type: string }) => item.type === "text")
      .map((item: { text: string }) => item.text)
      .join("\n");

    return NextResponse.json({ interpretation, remaining });
  } catch (error) {
    console.error("Interpretation error:", error);
    return NextResponse.json(
      { error: "伺服器錯誤,請稍後再試。" },
      { status: 500 }
    );
  }
}
