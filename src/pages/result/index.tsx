import { View, Text, ScrollView, Button } from '@tarojs/components'
import { useEffect, useState } from 'react'
import Taro, { useRouter } from '@tarojs/taro'
import './index.scss'

interface SolutionData {
  solution: string[]
  knowledgePoints: string[]
  similarProblems: Array<{
    question: string
    answer: string
  }>
}

interface ParsedResult {
  solution: string[]
  knowledgePoints: string[]
  similarProblems: Array<{
    question: string
    answer: string
  }>
}

export default function Result() {
  const router = useRouter()
  const [result, setResult] = useState<ParsedResult | null>(null)
  const [activeTab, setActiveTab] = useState<'solution' | 'knowledge' | 'similar'>('solution')

  useEffect(() => {
    const { data } = router.params
    if (data) {
      try {
        const parsed = JSON.parse(decodeURIComponent(data)) as SolutionData
        setResult(parsed)
      } catch (e) {
        console.error('Failed to parse result data:', e)
        Taro.showToast({
          title: '数据加载失败',
          icon: 'none'
        })
      }
    }
  }, [])

  const handleGoBack = () => {
    Taro.navigateBack()
  }

  const handleTakeAnother = () => {
    Taro.redirectTo({ url: '/pages/home/index' })
  }

  if (!result) {
    return (
      <View className="result-container">
        <View className="loading">
          <Text className="loading-text">正在加载分析结果...</Text>
        </View>
      </View>
    )
  }

  return (
    <View className="result-container">
      {/* 顶部成功提示 */}
      <View className="success-header">
        <View className="success-icon">✓</View>
        <Text className="success-title">AI分析完成</Text>
        <Text className="success-subtitle">以下是你的题目解答与知识点</Text>
      </View>

      {/* Tab导航 */}
      <View className="tab-nav">
        <View
          className={`tab-item ${activeTab === 'solution' ? 'active' : ''}`}
          onClick={() => setActiveTab('solution')}
        >
          <Text className="tab-text">解题思路</Text>
        </View>
        <View
          className={`tab-item ${activeTab === 'knowledge' ? 'active' : ''}`}
          onClick={() => setActiveTab('knowledge')}
        >
          <Text className="tab-text">知识点</Text>
        </View>
        <View
          className={`tab-item ${activeTab === 'similar' ? 'active' : ''}`}
          onClick={() => setActiveTab('similar')}
        >
          <Text className="tab-text">举一反三</Text>
        </View>
      </View>

      {/* 内容区域 */}
      <ScrollView className="content-scroll" scrollY>
        {/* 解题思路 */}
        {activeTab === 'solution' && (
          <View className="content-section">
            <View className="section-header">
              <Text className="section-icon">📝</Text>
              <Text className="section-title">解题思路</Text>
            </View>
            <View className="solution-list">
              {result.solution.map((step, index) => (
                <View key={index} className="solution-item">
                  <View className="step-number">{index + 1}</View>
                  <Text className="step-content">{step}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 知识点 */}
        {activeTab === 'knowledge' && (
          <View className="content-section">
            <View className="section-header">
              <Text className="section-icon">📚</Text>
              <Text className="section-title">相关知识点</Text>
            </View>
            <View className="knowledge-list">
              {result.knowledgePoints.map((point, index) => (
                <View key={index} className="knowledge-card">
                  <View className="knowledge-badge">{index + 1}</View>
                  <Text className="knowledge-text">{point}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 举一反三 */}
        {activeTab === 'similar' && (
          <View className="content-section">
            <View className="section-header">
              <Text className="section-icon">🔄</Text>
              <Text className="section-title">举一反三</Text>
            </View>
            <View className="similar-list">
              {result.similarProblems.map((item, index) => (
                <View key={index} className="similar-card">
                  <View className="similar-header">
                    <Text className="similar-label">练习 {index + 1}</Text>
                  </View>
                  <Text className="similar-question">{item.question}</Text>
                  <View className="similar-divider" />
                  <View className="similar-answer-row">
                    <Text className="similar-answer-label">答案：</Text>
                    <Text className="similar-answer">{item.answer}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        <View className="bottom-spacer" />
      </ScrollView>

      {/* 底部操作栏 */}
      <View className="action-bar">
        <Button className="action-btn back-btn" onClick={handleGoBack}>
          返回上传
        </Button>
        <Button className="action-btn another-btn" onClick={handleTakeAnother}>
          继续拍照
        </Button>
      </View>
    </View>
  )
}
