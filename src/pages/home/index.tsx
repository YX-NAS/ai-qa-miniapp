import { View, Text, Button, Image } from '@tarojs/components'
import { useState } from 'react'
import Taro from '@tarojs/taro'
import { analyzeImage } from '../../utils/api'
import './index.scss'

export default function Home() {
  const [imageUrl, setImageUrl] = useState<string>('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleTakePhoto = () => {
    Taro.chooseImage({
      count: 1,
      source: ['camera'],
      sizeType: ['compressed'],
      success: (res) => {
        setImageUrl(res.tempFilePaths[0])
      },
      fail: (err) => {
        if (err && err.errMsg && err.errMsg.includes('cancel')) {
          return
        }
        Taro.showToast({ title: '请允许相机权限', icon: 'none' })
      }
    })
  }

  const handleSelectFromAlbum = () => {
    Taro.chooseImage({
      count: 1,
      source: ['album'],
      sizeType: ['compressed'],
      success: (res) => {
        setImageUrl(res.tempFilePaths[0])
      },
      fail: (err) => {
        if (err && err.errMsg && err.errMsg.includes('cancel')) {
          return
        }
        Taro.showToast({ title: '请允许相册权限', icon: 'none' })
      }
    })
  }

  const handleAnalyze = async () => {
    if (!imageUrl) return

    setIsAnalyzing(true)
    Taro.showLoading({ title: '识别中...' })

    try {
      const result = await analyzeImage(imageUrl)

      Taro.hideLoading()

      Taro.navigateTo({
        url: `/pages/result/index?data=${encodeURIComponent(JSON.stringify(result))}`
      })
    } catch (error: any) {
      Taro.hideLoading()
      Taro.showToast({
        title: error.message || '分析失败，请重试',
        icon: 'none'
      })
      setIsAnalyzing(false)
    }
  }

  const handleClear = () => {
    setImageUrl('')
    setIsAnalyzing(false)
  }

  return (
    <View className="upload-container">
      <View className="header-section">
        <Text className="header-title">拍照上传题目</Text>
        <Text className="header-subtitle">拍下作业或练习题，AI帮你分析解答</Text>
      </View>

      <View className="preview-section">
        {imageUrl ? (
          <View className="preview-wrapper">
            <Image
              className="preview-image"
              src={imageUrl}
              mode="aspectFit"
              showMenuByLongpress
            />
            <View className="preview-actions">
              <Button className="clear-btn" onClick={handleClear}>重新拍摄</Button>
              <Button className="change-btn" onClick={handleSelectFromAlbum}>相册选择</Button>
            </View>
          </View>
        ) : (
          <View className="upload-placeholder" onClick={handleTakePhoto}>
            <View className="camera-icon">
              <Text className="camera-text">📷</Text>
            </View>
            <Text className="placeholder-title">点击拍照</Text>
            <Text className="placeholder-hint">或从相册选择图片</Text>
          </View>
        )}
      </View>

      <View className="action-section">
        {!imageUrl ? (
          <View className="button-group">
            <Button className="camera-btn" onClick={handleTakePhoto}>
              <Text className="btn-icon">📸</Text>
              <Text className="btn-text">拍照</Text>
            </Button>
            <Button className="album-btn" onClick={handleSelectFromAlbum}>
              <Text className="btn-icon">🖼️</Text>
              <Text className="btn-text">相册</Text>
            </Button>
          </View>
        ) : (
          <Button
            className={`analyze-btn ${isAnalyzing ? 'disabled' : ''}`}
            onClick={handleAnalyze}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? '分析中...' : '开始分析'}
          </Button>
        )}
      </View>

      <View className="tips-section">
        <Text className="tips-title">温馨提示</Text>
        <View className="tips-list">
          <Text className="tip-item">• 确保题目拍摄清晰，光线充足</Text>
          <Text className="tip-item">• 尽量让题目完整出现在画面中</Text>
          <Text className="tip-item">• 支持数学、语文、英语等各科题目</Text>
        </View>
      </View>
    </View>
  )
}
