/**
 * AI答疑助手 - API服务
 * 流程: 图片 → OCR识别文字 → LLM分析 → 返回结构化结果
 */

// API基础URL - 需要根据实际部署环境配置
const API_BASE = 'https://ai-qa.5176nas.online'

// 将本地图片转为base64
function imageToBase64(imagePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    wx.getFileSystemManager().readFile({
      filePath: imagePath,
      encoding: 'base64',
      success: (res) => resolve(res.data as string),
      fail: (err) => reject(err)
    })
  })
}

// 调用OCR识别图片文字
async function ocrImage(base64: string): Promise<string> {
  const res = await wx.request({
    url: `${API_BASE}/ocr`,
    method: 'POST',
    data: { image: base64 },
    header: { 'Content-Type': 'application/json' }
  })
  const data = res.data as any
  if (!data.success) throw new Error(data.error || 'OCR识别失败')
  return data.text
}

// 调用LLM分析题目
async function chatWithAI(question: string): Promise<string> {
  const res = await wx.request({
    url: `${API_BASE}/chat`,
    method: 'POST',
    data: { question },
    header: { 'Content-Type': 'application/json' }
  })
  const data = res.data as any
  if (!data.success) throw new Error(data.error || 'AI回答失败')
  return data.answer
}

// 解析LLM返回文本为结构化数据
function parseAnswer(text: string): {
  solution: string[]
  knowledgePoints: string[]
  similarProblems: Array<{ question: string, answer: string }>
} {
  const solution: string[] = []
  const knowledgePoints: string[] = []
  const similarProblems: Array<{ question: string; answer: string }> = []

  // 按##标题分割
  const sections = text.split(/## /).filter(s => s.trim())

  for (const section of sections) {
    const lines = section.trim().split('\n')
    const title = lines[0].trim()
    const content = lines.slice(1).join('\n').trim()

    if (title === '解题思路') {
      // 提取编号步骤
      const steps = content.split(/\d+\.\s*/).filter(s => s.trim())
      for (const step of steps) {
        const cleaned = step.replace(/^\s*[-*]\s*/, '').trim()
        if (cleaned) solution.push(cleaned)
      }
    } else if (title === '知识点') {
      // 提取编号知识点
      const points = content.split(/\d+\.\s*/).filter(s => s.trim())
      for (const point of points) {
        const cleaned = point.replace(/^\s*[-*]\s*/, '').trim()
        if (cleaned) knowledgePoints.push(cleaned)
      }
    } else if (title === '举一反三') {
      // 提取练习题和解答
      const matches = content.matchAll(/\*\*练习题\d+\*\*[：:](.*?)\*\*解答\*\*[：:](.*?)(?=\*\*练习题\d+\*\*|$)/gs)
      for (const m of matches) {
        similarProblems.push({
          question: m[1].trim(),
          answer: m[2].trim()
        })
      }
    }
  }

  return { solution, knowledgePoints, similarProblems }
}

// 主流程：拍照 → OCR → LLM → 结构化结果
export async function analyzeImage(imagePath: string): Promise<{
  solution: string[]
  knowledgePoints: string[]
  similarProblems: Array<{ question: string; answer: string }>
}> {
  // 1. 图片转base64
  const base64 = await imageToBase64(imagePath)

  // 2. OCR识别文字
  const text = await ocrImage(base64)
  if (!text.trim()) throw new Error('未识别到文字，请重新拍摄')

  // 3. LLM分析
  const answer = await chatWithAI(text)

  // 4. 解析为结构化数据
  return parseAnswer(answer)
}

export { API_BASE }
