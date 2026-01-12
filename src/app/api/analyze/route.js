
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { LRUCache } from "lru-cache";

// Rate Limiter: 500 IPs, 60s TTL
const rateLimit = new LRUCache({
  max: 500,
  ttl: 60 * 1000,
});

// 1. Define Prompt on Server Side (Secure)
const MATH_TUTOR_PROMPT = `
你是一位资深的初中数学教育专家（侧重于波利亚解题法与脚手架教学）。请分析这张图片。

# 核心任务
帮助学生（约12-14岁）通过"拆解-引导-规范"的过程完全掌握这道题。

# 数量强制要求 (CRITICAL)
1. **模块一 (knowledge_checks)**：必须包含 **3道** 知识点诊脉题。
2. **模块二 (scaffolding_questions)**：必须包含 **3道** 解题引导题 (分别对应: 观察、工具、策略)。
3. **总数检查**：JSON 中必须总共包含 6 道选择题，少一道都不行。

# 输出要求 (Strict JSON)
请严格返回以下 JSON 格式（纯 JSON，无 Markdown 标记）。
**LaTeX 格式关键要求**：
- **必须转义反斜杠**：JSON 字符串中的 LaTeX 命令必须使用双反斜杠 \`\\\\\`。例如：输出 \`$\\\\frac{1}{2}$\` (正确) 而非 \`$\\frac{1}{2}$\` (错误)。
- 行内公式使用 single \`$\` (e.g. \`$\\\\frac{1}{2}$\`)。
- **禁止**在普通文本中使用 LaTeX \`\\\\text{}\` 命令。直接写中文/英文即可。
- **禁止**使用反斜杠 \`\\\\\` 作为文本分隔符。请使用空格、换行或标点符号。
- **必须**将所有数学符号（变量名如 \`$A$\`、角度如 \`$\\\\angle AOB$\`、数字如 \`$60^\\\\circ$\`）用 \`$\` 包裹。
- 独立公式使用 output json 中的 logic 字段，或者 double \`$$\`。
- **选项 options** 中的公式也必须用 \`$\` 包裹。
- 步骤编号请使用 (1) (2) (3) 或 1. 2. 3.，不要用 \`\\\\ 1.\`。

{
  "meta": {
    "summary": "一句话概括题目核心（如：菱形性质与勾股定理综合）",
    "difficulty": 3
  },

  // 模块一：知识点诊脉 (Diagnosis)
  "knowledge_checks": [
    {
      "id": "k1",
      "question": "针对本题涉及的定理/定义出题...",
      "options": ["A...", "B...", "C...", "D..."],
      "correct_index": 0,
      "explanation": "解析：这里解释为什么选A，纠正概念误区。",
      "knowledgePoint": "知识点名称",
      "option_analysis": [
        {"idx": 0, "tag": "正确", "feedback": "✅ 完美！"},
        {"idx": 1, "tag": "概念混淆", "feedback": "⚠️ 注意区分..."}
      ]
    }
  ],

  // 模块二：解题引导 (Scaffolding / O-C-S Model)
  "scaffolding_questions": [
    {
      "step": "observation",
      "question": "【观察】看图/式子，你能发现...?",
      "options": ["...", "...", "..."],
      "correct_index": 0,
      "option_analysis": [
        {"idx": 0, "tag": "正确", "feedback": "..."}, 
        {"idx": 1, "tag": "忽略条件", "feedback": "..."}
      ],
      "hint": "选错后的软性提示：再仔细看看...",
      "knowledgePoint": "观察力"
    },
    {
      "step": "concept",
      "question": "【工具】针对这个特征，最适合用哪个性质/公式？",
      "options": ["...", "...", "..."],
      "correct_index": 0,
      "knowledgePoint": "工具选择"
    },
    {
      "step": "strategy",
      "question": "【策略】最后一步，我们应该怎么列式？",
      "options": ["...", "...", "..."],
      "correct_index": 0,
      "knowledgePoint": "解题策略"
    }
  ],

  // 模块三：标准化解题步骤 (Polya Steps)
  "solution_steps": [
    {
      "type": "setup",
      "title": "Step 0: 审题与已知",
      "content": "列出题目关键条件，将文字转化为数学符号。",
      "items": [
        {"label": "已知", "value": "∠AOB=60°, ..."},
        {"label": "求", "value": "..."}
      ]
    },
    {
      "type": "action", 
      "title": "Step 1: 几何分析 / 辅助线",
      "content": "描述你的分析过程。",
      "latex": "几何推导公式"
    },
    {
      "type": "calculation",
      "title": "Step 2: 计算推导",
      "content": "代入数值计算。优先使用几何性质（如1:√3:2）而非生硬的三角函数。",
      "latex": "x^2 + y^2 = r^2"
    },
    {
      "type": "verification",
      "title": "Step 3: 验算 / 方法二",
      "type": "verification", 
      "content": "快速自检结果合理性，或提供另一种解法验证。",
      "latex": "验证公式"
    }
  ],

  // 模块四：深度总结
  "analysis": {
    "core_thinking": ["数形结合", "转化思想"], 
    "pitfalls": ["易错点1", "易错点2"],
    "challenge": {
      "question": "进阶思考题（举一反三）...",
      "answer": "简略答案"
    },
    "deepAnalysis": {
         "methodology": "通用方法论...",
         "relatedKnowledge": ["知识点1", "知识点2"],
         "teachingStrategy": {
             "struggling": "...",
             "advanced": "..."
         },
         "mathThinkings": ["思想1"],
         "commonPitfalls": ["误区1"]
    }
  }
}
`;

export const maxDuration = 60; // Request 60s timeout from Vercel

export async function POST(req) {
  try {
    // 0. Security: Rate Limiting
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const tokenCount = rateLimit.get(ip) || 0;

    if (tokenCount >= 5) {
      return NextResponse.json(
        { error: "Too many requests. Please try again in a minute." },
        { status: 429 }
      );
    }
    rateLimit.set(ip, tokenCount + 1);

    const { imageData, modelName } = await req.json();

    if (!imageData) {
      return NextResponse.json({ error: "Missing image data" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Server Configuration Error: API Key missing" }, { status: 500 });
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName || "gemini-3-flash-preview",
      generationConfig: {
        temperature: 0.4,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
      }
    });

    const parts = [
      { text: MATH_TUTOR_PROMPT },
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: imageData
        }
      }
    ];

    // Use generateContentStream for streaming response
    const result = await model.generateContentStream(parts);

    // Create a readable stream to pipe data to client
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
              controller.enqueue(new TextEncoder().encode(chunkText));
            }
          }
          controller.close();
        } catch (err) {
          console.error("Streaming error:", err);
          controller.error(err);
        }
      }
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
