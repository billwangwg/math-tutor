
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// 1. Define Prompt on Server Side (Secure)
const MATH_TUTOR_PROMPT = `
你是一位资深的初中数学教育专家（侧重于波利亚解题法与脚手架教学）。请分析这张图片。

# 核心任务
帮助学生（约12-14岁）通过"拆解-引导-规范"的过程，完全掌握这道题。

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

export async function POST(req) {
  try {
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

    const result = await model.generateContent(parts);
    const response = await result.response;
    const text = response.text();

    // Basic Sanitization
    const cleanJson = text.replace(/```json | ```/g, '').trim();

    // Robust Sanitization (Fix invalid escapes)
    let parsedData;
    try {
      parsedData = JSON.parse(cleanJson);
    } catch (e) {
      console.warn("Initial JSON parse failed, attempting sanitizer...");
      try {
        // 1. Remove Markdown code blocks
        const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();

        // 2. Escape backslashes that are NOT control characters or already escaped
        // Standard JSON allows \", \\, \/, \b, \f, \n, \r, \t, \uXXXX
        // We want to preserve LaTeX commands like \sqrt (which becomes \s -> invalid escape in JSON)
        // So we escape ALL \ that are not valid JSON escapes.
        let sanitized = cleanJson.replace(/(?<!\\)\\(?![\["\\/bfnrtu])/g, "\\\\");

        // 3. REPAIR DAMAGED CONTROL CHARACTERS
        // Some LaTeX commands (\times, \frac) collide with JSON escapes (\t, \f)
        // If the model output "\times", JSON.parse reads it as [TAB]imes.
        // We must intercept this BEFORE parsing usually, but here 'sanitized' is a string.
        // We replace the LITERAL sequence \ + t with \\t etc if we can,
        // BUT if regex failed, we might have issues.

        // Brute force repair common LaTeX commands to be double-escaped
        const repairs = [
          ['\\times', '\\\\times'],
          ['\\frac', '\\\\frac'],
          ['\\sqrt', '\\\\sqrt'],
          ['\\cdot', '\\\\cdot'],
          ['\\angle', '\\\\angle'],
          ['\\circ', '\\\\circ'],
          ['\\sin', '\\\\sin'],
          ['\\cos', '\\\\cos'],
          ['\\tan', '\\\\tan'],
          ['\\perp', '\\\\perp'],
          ['\\triangle', '\\\\triangle'],
          ['\\leq', '\\\\leq'],
          ['\\geq', '\\\\geq'],
          ['\\pi', '\\\\pi'],
          ['\\infty', '\\\\infty'],
          ['\\Delta', '\\\\Delta'],
          ['\\approx', '\\\\approx'],
          ['^', '^'] // placeholder
        ];

        repairs.forEach(([target, replacement]) => {
          // Replace literal target (e.g. \times) with replacement (e.g. \\times)
          // We use split/join to avoid regex escaping headaches
          if (target !== '^') {
            sanitized = sanitized.split(target).join(replacement);
          }
        });

        // 4. Handle "Missing brace" issues
        // Often caused by \text{...} -> \t (tab) ... brace mismatch?
        // Or ^\circ -> ^\c (invalid) -> ^\\circ (ok).
        // Check specifically for mangled \right (often becomes \r -> CR)
        sanitized = sanitized.replace(/\r/g, '\\\\right'); // If \right became CR
        sanitized = sanitized.replace(/\t/g, '    '); // Tabs in text -> 4 spaces
        // Wait, if \times became TAB, we lost "times".
        // Actually, if we are editing the RAW STRING, \t is literal \ + t.
        // It is NOT a tab char.
        // So split('\times') works.

        try {
          parsedData = JSON.parse(sanitized); // Assign to parsedData here
        } catch (parseError) {
          return NextResponse.json({ error: "JSON Parse Failed", raw: text }, { status: 500 });
        }
      } catch (sanitizerError) { // Catch for the inner try block (sanitization process)
        console.error("Sanitization process failed:", sanitizerError);
        return NextResponse.json({ error: "Sanitization failed, then JSON parse failed", raw: text }, { status: 500 });
      }
    }

    return NextResponse.json(parsedData);

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
