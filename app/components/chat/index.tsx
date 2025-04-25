'use client'
import type { FC } from 'react'
import React, { useEffect, useRef } from 'react'
import cn from 'classnames'
import { useTranslation } from 'react-i18next'
import Textarea from 'rc-textarea'
import s from './style.module.css'
import Answer from './answer'
import Question from './question'
import type { FeedbackFunc } from './type'
import type { ChatItem, VisionFile, VisionSettings } from '@/types/app'
import { TransferMethod } from '@/types/app'
import Tooltip from '@/app/components/base/tooltip'
import Toast from '@/app/components/base/toast'
import ChatImageUploader from '@/app/components/base/image-uploader/chat-image-uploader'
import ImageList from '@/app/components/base/image-uploader/image-list'
import { useImageFiles } from '@/app/components/base/image-uploader/hooks'
import OnlineSearch from '@/app/components/base/online-search'
import ModelSelecter from '@/app/components/base/model-selecter'

export type IChatProps = {
  chatList: ChatItem[]
  /**
   * Whether to display the editing area and rating status
   */
  feedbackDisabled?: boolean
  /**
   * Whether to display the input area
   */
  isHideSendInput?: boolean
  onFeedback?: FeedbackFunc
  checkCanSend?: () => boolean
  onSend?: (message: string, files: VisionFile[]) => void
  useCurrentUserAvatar?: boolean
  isResponding?: boolean
  controlClearQuery?: number
  visionConfig?: VisionSettings
  currConversationId?: string
  isOnlineSearch?: boolean
  lastSelectedModel?: string
  onStopResponding?: () => void
  isNewChat?: boolean
}

const Chat: FC<IChatProps> = ({
  chatList,
  feedbackDisabled = false,
  isHideSendInput = false,
  onFeedback,
  checkCanSend,
  onSend = () => { },
  useCurrentUserAvatar,
  isResponding,
  controlClearQuery,
  visionConfig,
  currConversationId,
  isOnlineSearch,
  lastSelectedModel,
  onStopResponding,
  isNewChat,
}) => {
  const { t } = useTranslation()
  const { notify } = Toast
  const isUseInputMethod = useRef(false)
  const chatListRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<any>(null)
  const [isAtBottom, setIsAtBottom] = React.useState(true)
  const [forceShowButton, setForceShowButton] = React.useState(false)
  const [showStopBtn, setShowStopBtn] = React.useState(false)

  const [query, setQuery] = React.useState('')
  const handleContentChange = (e: any) => {
    const value = e.target.value
    setQuery(value)
  }

  const logError = (message: string) => {
    notify({ type: 'error', message, duration: 3000 })
  }

  const valid = () => {
    if (!query || query.trim() === '') {
      logError('Message cannot be empty')
      return false
    }
    return true
  }

  useEffect(() => {
    if (controlClearQuery)
      setQuery('')
  }, [controlClearQuery])

  const {
    files,
    onUpload,
    onRemove,
    onReUpload,
    onImageLinkLoadError,
    onImageLinkLoadSuccess,
    onClear,
  } = useImageFiles()

  const handleSend = () => {
    if (!valid() || (checkCanSend && !checkCanSend()))
      return
    onSend(query, files.filter(file => file.progress !== -1).map(fileItem => ({
      type: 'image',
      transfer_method: fileItem.type,
      url: fileItem.url,
      upload_file_id: fileItem.fileId,
    })))
    if (!files.find(item => item.type === TransferMethod.local_file && !item.fileId)) {
      if (files.length)
        onClear()
      if (!isResponding)
        setQuery('')
    }
  }

  const handleKeyUp = (e: any) => {
    if (e.code === 'Enter') {
      e.preventDefault()
      // prevent send message when using input method enter
      if (!e.shiftKey && !isUseInputMethod.current)
        handleSend()
    }
  }

  const handleKeyDown = (e: any) => {
    isUseInputMethod.current = e.nativeEvent.isComposing
    if (e.code === 'Enter' && !e.shiftKey) {
      setQuery(query.replace(/\n$/, ''))
      e.preventDefault()
    }
  }

  const checkIfAtBottom = () => {
    const container = document.querySelector('.chat-outer-scroll')
    if (container) {
      const threshold = 100 // 阈值，距离底部100px以内都认为是在底部
      const isBottom = container.scrollHeight - container.scrollTop - container.clientHeight <= threshold
      setIsAtBottom(isBottom)
    }
  }

  useEffect(() => {
    const container = document.querySelector('.chat-outer-scroll')
    if (container) {
      container.addEventListener('scroll', checkIfAtBottom)
      return () => container.removeEventListener('scroll', checkIfAtBottom)
    }
  }, [])

  const scrollToBottom = () => {
    const container = document.querySelector('.chat-outer-scroll')
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      })
      setIsAtBottom(true)
    }
  }

  // 添加对 isResponding 的监听，控制延迟显示停止按钮
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isResponding) {
      timer = setTimeout(() => {
        setShowStopBtn(true)
      }, 500)
    } else {
      setShowStopBtn(false)
    }
    return () => {
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [isResponding])

  // 添加自动聚焦效果
  useEffect(() => {
    if (chatList.length === 0 && inputRef.current) {
      inputRef.current.focus()
    }
  }, [chatList.length])

  // 添加自动滚动效果，当有新消息或响应结束时
  useEffect(() => {
    if (chatList.length > 0 && !isResponding) {
      scrollToBottom()
    }
  }, [chatList, isResponding])

  return (
    <div className={cn(!feedbackDisabled && 'mt-5 mb-2', 'chat-outer-scroll h-full flex flex-col items-center w-full overflow-y-auto overscroll-y-contain')}>
      {/* Chat List */}
      <div className="flex-1 w-full">
        <div className="w-full h-full px-4 md:px-12 lg:px-24">
          <div className="h-full flex flex-col max-w-[994px] mx-auto">
            <div className="flex-1">
              <div className="space-y-[30px] pb-4">
                {chatList.map((item) => {
                  if (item.isAnswer) {
                    const isLast = item.id === chatList[chatList.length - 1].id
                    return <Answer
                      key={item.id}
                      item={item}
                      feedbackDisabled={feedbackDisabled}
                      onFeedback={onFeedback}
                      isResponding={isResponding && isLast}
                    />
                  }
                  return (
                    <Question
                      key={item.id}
                      id={item.id}
                      content={item.content}
                      useCurrentUserAvatar={useCurrentUserAvatar}
                      imgSrcs={(item.message_files && item.message_files?.length > 0) ? item.message_files.map(item => item.url) : []}
                    />
                  )
                })}
              </div>
            </div>
            {
              !isHideSendInput && (
                <div className={cn(!feedbackDisabled &&
                  (!isNewChat || chatList.length > 0)
                  ? 'sticky bottom-0 z-10 pb-6'
                  : 'absolute top-1/4 translate-y-1/4 bottom-0 left-0 right-0 max-w-[994px] mx-auto'
                )}>
                  {/* 滚动到底部按钮 */}
                  {!isAtBottom && chatList.length > 0 && (
                    <div
                      className="absolute -top-11 left-1/2 transform -translate-x-1/2 z-20 cursor-pointer bg-white border border-gray-200 rounded-full shadow-md p-2 hover:bg-gray-50 flex items-center gap-1"
                      onClick={scrollToBottom}
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </div>
                  )}
                  <div className='flex flex-col bg-white border-[1.5px] border-gray-200 rounded-xl shadow-lg'>
                    {/* 上部分：文字输入区域 */}
                    <div className='relative px-[5.5px] py-[1px]'>
                      <Textarea
                        ref={inputRef}
                        className={`
                          block w-full px-2 py-[7px] leading-5 min-h-[60px] max-h-[145px] text-sm text-gray-700 outline-none appearance-none resize-none placeholder:text-gray-400 overscroll-y-contain
                        `}
                        value={query}
                        onChange={handleContentChange}
                        onKeyUp={handleKeyUp}
                        onKeyDown={handleKeyDown}
                        onScroll={(e) => {
                          e.stopPropagation(); // 阻止滚动事件冒泡
                          e.nativeEvent.stopImmediatePropagation(); // 彻底阻止事件传播
                        }}
                        placeholder={t('common.operation.pleaseEnter') as string}
                        autoSize
                      />
                    </div>

                    {/* 下部分：功能按钮区域 */}
                    <div className='flex items-center justify-between px-2 py-2 min-h-[40px]'>
                      <div className='flex items-center'>
                        {visionConfig?.enabled && (
                          <>
                            {/* <div className='absolute bottom-2 left-2 flex items-center'> */}
                            {/* <ChatImageUploader
                              settings={visionConfig}
                              onUpload={onUpload}
                              disabled={files.length >= visionConfig.number_limits}
                            /> */}
                            {/* <div className='mx-1 w-[1px] h-4 bg-black/5' /> */}
                            {/* <div className='absolute bottom-[6.5px] left-2 flex items-center'> */}
                            <OnlineSearch
                              onSend={onSend}
                              isActive={isOnlineSearch}
                            />
                            <div className='mx-1 w-[1px] h-4 bg-black/5' />
                            <ModelSelecter
                              onSend={onSend}
                              initialModel={lastSelectedModel}
                            />
                            {/* <div className='mx-1 w-[1px] h-4 bg-black/5' /> */}
                            <ImageList
                              list={files}
                              onRemove={onRemove}
                              onReUpload={onReUpload}
                              onImageLinkLoadSuccess={onImageLinkLoadSuccess}
                              onImageLinkLoadError={onImageLinkLoadError}
                            />
                          </>
                        )}
                      </div>
                      <div className="flex items-center h-8">
                        {/* <div className={`${s.count} mr-4 h-5 leading-5 text-sm bg-gray-50 text-gray-500`}>{query.trim().length}</div> */}
                        {/* {visionConfig?.enabled && (
                          <ChatImageUploader
                            settings={visionConfig}
                            onUpload={onUpload}
                            disabled={files.length >= visionConfig.number_limits}
                          />
                        )} */}
                        {/* <div className='mx-1 w-[1px] h-4 bg-black/5' /> */}
                        <Tooltip
                          selector='send-tip'
                          htmlContent={
                            <div>
                              {query.trim().length > 0 ? (!isResponding ? (
                                <>
                                  <div>{t('common.operation.send')} Enter</div>
                                  <div>{t('common.operation.lineBreak')} Shift Enter</div>
                                </>
                              ) : (
                                <div>{t('common.operation.stop')}</div>
                              )) : (!isResponding ? (
                                <div>{t('common.operation.pleaseEnter')}</div>
                              ) : (
                                <div>{t('common.operation.stop')}</div>
                              ))}
                            </div>
                          }
                        >
                          <div
                            className={`${s.sendBtn} w-8 h-8 cursor-pointer rounded-full border border-gray-200 ${showStopBtn ? s.stopBtn : query.trim().length > 0 ? s.active : ''}`}
                            onClick={showStopBtn ? onStopResponding : handleSend}
                          ></div>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                </div>
              )
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default React.memo(Chat)
