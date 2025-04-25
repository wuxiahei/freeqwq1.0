import ReactMarkdown from 'react-markdown'
import 'katex/dist/katex.min.css'
import RemarkMath from 'remark-math'
import RemarkBreaks from 'remark-breaks'
import RehypeKatex from 'rehype-katex'
import RemarkGfm from 'remark-gfm'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { atelierHeathLight } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import { useTranslation } from 'react-i18next'
import { useState, useEffect, useRef } from 'react'
import { DocumentDuplicateIcon } from '@heroicons/react/24/outline'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'
import { LightBulbIcon } from '@heroicons/react/24/outline'

export function Markdown(props: { content: string; isStreaming?: boolean }) {
  const { t } = useTranslation()
  const [copySuccess, setCopySuccess] = useState<{ [key: string]: boolean }>({})
  const [allExpanded, setAllExpanded] = useState(true)
  const [hasQuotes, setHasQuotes] = useState(false)
  const firstQuoteRef = useRef<boolean>(true)

  const handleCopy = (text: string, id: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopySuccess({ ...copySuccess, [id]: true })
        setTimeout(() => {
          setCopySuccess({ ...copySuccess, [id]: false })
        }, 1000)
      })
    } else {
      // 降级方案：创建临时文本区域
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      try {
        document.execCommand('copy')
        setCopySuccess({ ...copySuccess, [id]: true })
        setTimeout(() => {
          setCopySuccess({ ...copySuccess, [id]: false })
        }, 1000)
      } catch (err) {
        console.error('复制失败:', err)
      }
      document.body.removeChild(textarea)
    }
  }

  const toggleAllQuotes = () => {
    setAllExpanded(!allExpanded)
    firstQuoteRef.current = true
  }

  // 检查内容中是否包含引用块
  const hasQuoteContent = props.content.includes('> \n\n\n')

  return (
    <div className="markdown-body relative">
      {(hasQuotes || props.isStreaming) && (
        <div className="flex items-center px-4 py-3 border-b mb-2 cursor-pointer hover:bg-gray-50 rounded-lg" onClick={toggleAllQuotes}>
          <div className="flex items-center flex-1">
            <LightBulbIcon className={`w-5 h-5 mr-2 ${hasQuoteContent ? 'text-blue-600' : 'text-gray-400'}`} />
            <span className="text-[14px] text-gray-800">
              {hasQuoteContent ? '已完成思考' : '正在思考...'}
            </span>
          </div>
          {hasQuoteContent && (
            <div className="flex items-center text-[13px] text-gray-500">
              <span>{allExpanded ? '收起思考内容' : '展开思考内容'}</span>
              {allExpanded ? (
                <ChevronUpIcon className="w-4 h-4 ml-1" />
              ) : (
                <ChevronDownIcon className="w-4 h-4 ml-1" />
              )}
            </div>
          )}
        </div>
      )}
      <ReactMarkdown
        remarkPlugins={[RemarkMath, RemarkGfm, RemarkBreaks]}
        rehypePlugins={[
          RehypeKatex,
        ]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '')
            const codeId = inline ? '' : String(children).slice(0, 20)
            return (!inline && match)
              ? (
                <div className="relative">
                  <div className="flex items-center justify-between px-4 py-2 bg-gray-100 border-b text-sm text-gray-600">
                    <span>{match[1]}</span>
                    <button
                      className="hover:text-gray-900 flex items-center gap-1"
                      onClick={() => handleCopy(String(children).replace(/\n$/, ''), codeId)}
                    >
                      {copySuccess[codeId] ? (
                        <span className="text-green-600">✓ 完成</span>
                      ) : (
                        <>
                          <DocumentDuplicateIcon className="w-4 h-4" />
                          {t('common.operation.copy')}
                        </>
                      )}
                    </button>
                  </div>
                  <SyntaxHighlighter
                    {...props}
                    children={String(children).replace(/\n$/, '')}
                    style={atelierHeathLight}
                    language={match[1]}
                    showLineNumbers
                    PreTag="div"
                  />
                </div>
              )
              : (
                <code {...props} className={className}>
                  {children}
                </code>
              )
          },
          blockquote({ node, children, ...props }) {
            const content = String(children)
            const isFirstQuote = firstQuoteRef.current
            if (firstQuoteRef.current) {
              firstQuoteRef.current = false
            }

            useEffect(() => {
              if (!hasQuotes) {
                setHasQuotes(true)
              }
            }, [])

            return (
              <div className={`relative group transition-all duration-300 ease-in-out ${!allExpanded && !isFirstQuote ? 'h-0 opacity-0 my-0 py-0 overflow-hidden' : 'opacity-100'}`}>
                <blockquote
                  {...props}
                  className="border-l-4 border-gray-200 pl-4 py-2 my-4 text-gray-400"
                >
                  <div className={`transition-all duration-300 ease-in-out ${!allExpanded && isFirstQuote ? 'line-clamp-2' : ''}`}>
                    {children}
                  </div>
                </blockquote>
              </div>
            )
          }
        }}
        linkTarget={'_blank'}
      >
        {props.content}
      </ReactMarkdown>
    </div>
  )
}
