// 导入相关类型
import type { Annotation } from './log'
import type { Locale } from '@/i18n'
import type { ThoughtItem } from '@/app/components/chat/type'

// 提示词变量类型定义
export type PromptVariable = {
  key: string       // 变量键名
  name: string      // 变量显示名称
  type: string      // 变量类型
  default?: string | number  // 默认值
  options?: string[]         // 可选值列表
  max_length?: number        // 最大长度限制
  required: boolean          // 是否必填
}

// 提示词配置类型定义
export type PromptConfig = {
  prompt_template: string      // 提示词模板
  prompt_variables: PromptVariable[]  // 提示词变量列表
}

// 文本类型表单项定义
export type TextTypeFormItem = {
  label: string      // 标签文本
  variable: string   // 变量名
  required: boolean  // 是否必填
  max_length: number  // 最大长度
}

// 选择类型表单项定义
export type SelectTypeFormItem = {
  label: string      // 标签文本
  variable: string   // 变量名
  required: boolean  // 是否必填
  options: string[]  // 选项列表
}

/**
 * 用户输入表单项类型定义
 * 可以是文本输入、选择框或段落输入
 */
export type UserInputFormItem = {
  'text-input': TextTypeFormItem
} | {
  'select': SelectTypeFormItem
} | {
  'paragraph': TextTypeFormItem
}

// 消息评分类型定义
export const MessageRatings = ['like', 'dislike', null] as const
export type MessageRating = typeof MessageRatings[number]

// 反馈类型定义
export type Feedbacktype = {
  rating: MessageRating  // 评分
  content?: string | null  // 反馈内容
}

// 消息附加信息类型定义
export type MessageMore = {
  time: string       // 时间
  tokens: number     // token数量
  latency: number | string  // 延迟
}

// 聊天项接口定义
export type IChatItem = {
  id: string  // 唯一标识
  content: string  // 内容
  isAnswer: boolean  // 是否为回答
  feedback?: Feedbacktype  // 用户反馈
  adminFeedback?: Feedbacktype  // 管理员反馈
  feedbackDisabled?: boolean  // 是否禁用反馈
  more?: MessageMore  // 附加信息
  annotation?: Annotation  // 注释信息
  useCurrentUserAvatar?: boolean  // 是否使用当前用户头像
  isOpeningStatement?: boolean  // 是否为开场白
  suggestedQuestions?: string[]  // 建议问题列表
  log?: { role: string; text: string }[]  // 日志信息
  agent_thoughts?: ThoughtItem[]  // 代理思考过程
  message_files?: VisionFile[]  // 消息相关文件
}

// 聊天项类型定义，扩展自IChatItem
export type ChatItem = IChatItem & {
  isError?: boolean  // 是否为错误消息
  workflow_run_id?: string  // 工作流运行ID
  workflowProcess?: WorkflowProcess  // 工作流处理过程
}

// 响应持有者类型定义
export type ResponseHolder = {}

// 会话项类型定义
export type ConversationItem = {
  id: string
  name: string
  inputs: Record<string, any> | null
  introduction: string
  customParams?: Record<string, any> // 新增自定义参数字段
}

// 应用信息类型定义
export type AppInfo = {
  title: string  // 标题
  description: string  // 描述
  default_language: Locale  // 默认语言
  copyright?: string  // 版权信息
  privacy_policy?: string  // 隐私政策
}

// 分辨率枚举定义
export enum Resolution {
  low = 'low',  // 低分辨率
  high = 'high', // 高分辨率
}

// 文件传输方式枚举定义
export enum TransferMethod {
  all = 'all',  // 所有方式
  local_file = 'local_file',  // 本地文件
  remote_url = 'remote_url',  // 远程URL
}

// 视觉设置类型定义
export type VisionSettings = {
  enabled: boolean  // 是否启用
  number_limits: number  // 数量限制
  detail: Resolution  // 分辨率
  transfer_methods: TransferMethod[]  // 传输方式
  image_file_size_limit?: number | string  // 图片文件大小限制
}

// 图片文件类型定义
export type ImageFile = {
  type: TransferMethod  // 传输方式
  _id: string  // 唯一标识
  fileId: string  // 文件ID
  file?: File  // 文件对象
  progress: number  // 上传进度
  url: string  // 文件URL
  base64Url?: string  // base64编码的URL
  deleted?: boolean  // 是否已删除
}

// 视觉文件类型定义
export type VisionFile = {
  id?: string  // 唯一标识
  type: string  // 文件类型
  transfer_method: TransferMethod  // 传输方式
  url: string  // 文件URL
  upload_file_id: string  // 上传文件ID
  belongs_to?: string  // 所属对象
}

// 区块类型枚举定义
export enum BlockEnum {
  Start = 'start',  // 开始
  End = 'end',  // 结束
  Answer = 'answer',  // 回答
  LLM = 'llm',  // 大语言模型
  KnowledgeRetrieval = 'knowledge-retrieval',  // 知识检索
  QuestionClassifier = 'question-classifier',  // 问题分类器
  IfElse = 'if-else',  // 条件判断
  Code = 'code',  // 代码
  TemplateTransform = 'template-transform',  // 模板转换
  HttpRequest = 'http-request',  // HTTP请求
  VariableAssigner = 'variable-assigner',  // 变量赋值器
  Tool = 'tool',  // 工具
}

// 节点追踪信息类型定义
export type NodeTracing = {
  id: string  // 唯一标识
  index: number  // 索引
  predecessor_node_id: string  // 前驱节点ID
  node_id: string  // 节点ID
  node_type: BlockEnum  // 节点类型
  title: string  // 标题
  inputs: any  // 输入参数
  process_data: any  // 处理数据
  outputs?: any  // 输出结果
  status: string  // 状态
  error?: string  // 错误信息
  elapsed_time: number  // 耗时
  execution_metadata: {  // 执行元数据
    total_tokens: number  // 总token数
    total_price: number  // 总价格
    currency: string  // 货币单位
  }
  created_at: number  // 创建时间
  created_by: {  // 创建者
    id: string  // 唯一标识
    name: string  // 名称
    email: string  // 邮箱
  }
  finished_at: number  // 完成时间
  extras?: any  // 额外信息
  expand?: boolean  // 是否展开（用于UI）
}

// 节点运行状态枚举定义
export enum NodeRunningStatus {
  NotStart = 'not-start',  // 未开始
  Waiting = 'waiting',  // 等待中
  Running = 'running',  // 运行中
  Succeeded = 'succeeded',  // 成功
  Failed = 'failed',  // 失败
}

// 工作流运行状态枚举定义
export enum WorkflowRunningStatus {
  Waiting = 'waiting',  // 等待中
  Running = 'running',  // 运行中
  Succeeded = 'succeeded',  // 成功
  Failed = 'failed',  // 失败
  Stopped = 'stopped',  // 已停止
}

// 工作流处理过程类型定义
export type WorkflowProcess = {
  status: WorkflowRunningStatus  // 工作流状态
  tracing: NodeTracing[]  // 节点追踪信息列表
  expand?: boolean  // 是否展开（用于UI）
}

// 代码语言枚举定义
export enum CodeLanguage {
  python3 = 'python3',  // Python3
  javascript = 'javascript',  // JavaScript
  json = 'json',  // JSON
}
