import React, { useState, useRef, useEffect, useMemo } from 'react'
import type { FC } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ChatBubbleOvalLeftEllipsisIcon,
  EllipsisHorizontalIcon,
  StarIcon,
  PencilSquareIcon,
  TrashIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import { ChatBubbleOvalLeftEllipsisIcon as ChatBubbleOvalLeftEllipsisSolidIcon } from '@heroicons/react/24/solid'
import Button from '@/app/components/base/button'
// import Card from './card'
import type { ConversationItem } from '@/types/app'
import { format, fromUnixTime } from 'date-fns'
import Tooltip from '@/app/components/base/tooltip'
import { Modal } from '@/app/components/base/modal'
import ConfigSence from '@/app/components/config-scence'
import Header from '@/app/components/header'
import { APP_INFO } from '@/config'
import { useRouter } from 'next/navigation'

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}

const MAX_CONVERSATION_LENTH = 20

export type ISidebarProps = {
  copyRight: string
  currentId: string
  onCurrentIdChange: (id: string) => void
  list: ConversationItem[]
  onPinConversation?: (id: string) => void
  onRenameConversation?: (id: string, name: string) => void
  onDeleteConversation?: (id: string) => void
  onHandleConversationIdChange: (id: string) => void
  onHideSideBar: () => void
}

interface AppItem {
  id: string;
  icon: string;
  title: string;
  href: string;
}

const Sidebar: FC<ISidebarProps> = ({
  copyRight,
  currentId,
  onCurrentIdChange,
  list,
  onPinConversation,
  onRenameConversation,
  onDeleteConversation,
  onHandleConversationIdChange,
  onHideSideBar
}) => {
  const { t } = useTranslation()
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [showRenameModal, setShowRenameModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingName, setEditingName] = useState('')
  const [currentItem, setCurrentItem] = useState<ConversationItem | null>(null)
  const [showAllConversations, setShowAllConversations] = useState(false)
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number } | null>(null);
  const router = useRouter()

  const handleRename = (item: ConversationItem) => {
    setCurrentItem(item)
    setEditingName(item.name)
    setShowRenameModal(true)
  }

  const handleDelete = (item: ConversationItem) => {
    setCurrentItem(item)
    setShowDeleteModal(true)
  }

  const handleMenuClick = (e: React.MouseEvent<Element>, itemId: string) => {
    e.stopPropagation();
    if (openMenuId === itemId) {
      setOpenMenuId(null);
      setMenuPosition(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom,
        right: 240 - rect.right
      });
      setOpenMenuId(itemId);
    }
  };

  const handleConversationClick = (id: string) => {
    if (id === '-1') {
      // onCurrentIdChange(id)
      console.log(id)
      router.push(`/chat/new`, { scroll: false })
    } else {
      router.push(`/chat/${id}`, { scroll: false })
      // onCurrentIdChange(id)
    }
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.menu-container') && !target.closest('.menu-btn')) {
        setOpenMenuId(null);
        setMenuPosition(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <div
        className="shrink-0 flex flex-col overflow-y-auto bg-gray-100 pc:w-[240px] tablet:w-[192px] mobile:w-[240px] border-gray-200 tablet:h-[calc(110vh_-_3rem)] mobile:h-screen"
      >
        <Header
          title={copyRight}
          onHideSideBar={onHideSideBar}
          onCreateNewChat={() => onHandleConversationIdChange('-1')}
        />
        <div className="flex flex-col flex-shrink-0 p-2 !pb-0">
          <div className="flex flex-shrink-0 p-0 !pb-0">
            <Button
              type="custom"
              onClick={() => { router.push(`/chat/new`, { scroll: false }) }}
              className="group block w-full flex-shrink-0 !justify-start !h-11 !pl-2 !text-black text-sm bg-white hover:bg-white !hover:shadow-lg hover:border-gray-300 items-center border-solid border border-gray-200 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" className="mr-2 h-5 w-5" width="20" height="20" viewBox="0 0 1024 1024">
                <path d="M475.136 561.152v89.74336c0 20.56192 16.50688 37.23264 36.864 37.23264s36.864-16.67072 36.864-37.23264v-89.7024h89.7024c20.60288 0 37.2736-16.54784 37.2736-36.864 0-20.39808-16.67072-36.864-37.2736-36.864H548.864V397.63968A37.0688 37.0688 0 0 0 512 360.448c-20.35712 0-36.864 16.67072-36.864 37.2736v89.7024H385.4336a37.0688 37.0688 0 0 0-37.2736 36.864c0 20.35712 16.67072 36.864 37.2736 36.864h89.7024z" fill="currentColor" />
                <path d="M512 118.784c-223.96928 0-405.504 181.57568-405.504 405.504 0 78.76608 22.44608 152.3712 61.35808 214.6304l-44.27776 105.6768a61.44 61.44 0 0 0 56.68864 85.1968H512c223.92832 0 405.504-181.53472 405.504-405.504 0-223.92832-181.57568-405.504-405.504-405.504z m-331.776 405.504a331.776 331.776 0 1 1 331.73504 331.776H198.656l52.59264-125.5424-11.59168-16.62976A330.09664 330.09664 0 0 1 180.224 524.288z" fill="currentColor" />
              </svg> {t('app.chat.newChat')}
            </Button>
          </div>

          <div className="mt-4">
            <div className="ai-plus-part">
              <a onClick={() => router.push('/ai-plus')} className="nav-item ai-plus-square flex items-center px-2 py-2 rounded-lg hover:bg-gray-200 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" name="a_ai" className="nav-icon iconify mr-2 w-5 h-5" width="1em" height="1em" viewBox="0 0 1024 1024">
                  <path d="M202.197333 444.928c-17.365333 17.365333-46.506667 14.933333-56.192-7.637333a221.738667 221.738667 0 0 1 360.362667-244.352l179.2 179.2A37.973333 37.973333 0 0 1 631.893333 425.813333l-179.2-179.2a145.664 145.664 0 0 0-241.365333 148.650667c5.632 17.194667 3.669333 36.864-9.088 49.621333z m140.714667 157.738667a37.973333 37.973333 0 0 0 0 53.76l174.677333 174.634666a221.653333 221.653333 0 0 0 363.52-236.672c-9.045333-23.552-39.04-26.538667-56.917333-8.704-12.373333 12.416-14.72 31.36-9.856 48.213334a145.664 145.664 0 0 1-242.986667 143.445333l-174.72-174.677333a37.973333 37.973333 0 0 0-53.717333 0zM448.725333 512a63.317333 63.317333 0 1 0 126.592 0 63.317333 63.317333 0 0 0-126.634666 0zM380.373333 330.112l-187.477333 187.477333a221.653333 221.653333 0 0 0 221.781333 368.64c25.429333-7.765333 29.610667-39.424 10.794667-58.197333-11.690667-11.733333-29.226667-14.634667-45.44-11.221333A145.664 145.664 0 0 1 246.613333 571.306667l187.477334-187.477334a37.973333 37.973333 0 1 0-53.76-53.717333z m263.168 363.776a37.973333 37.973333 0 1 1-53.76-53.76l187.52-187.477333a145.664 145.664 0 0 0-133.418666-245.461334c-16.213333 3.413333-33.749333 0.512-45.482667-11.221333-18.773333-18.773333-14.634667-50.432 10.794667-58.24a221.653333 221.653333 0 0 1 221.866666 368.64l-187.52 187.52z" fill="currentColor"></path>
                </svg>
                <span className="text-sm">AI+</span>
              </a>

              <div className="mt-0 space-y-0.5">
                {useMemo(() => {
                  const savedPinnedApps = localStorage.getItem('ai_plus_pinned_apps');
                  if (!savedPinnedApps) return null;

                  const apps: AppItem[] = [
                    {
                      id: '1',
                      icon: '/ppt.png',
                      title: 'PPT 助手',
                      href: '/ppt-generator/index.html'
                    },
                    {
                      id: '2',
                      icon: 'https://kimi-img.moonshot.cn/prod-chat-kimi/avatar/kimiplus/feman.png',
                      title: '中译英专家',
                      href: '/ai-plus/fff43c71-e05d-40d0-b533-e1c9a4df1c5a'
                    }
                  ];

                  try {
                    const pinnedIds = JSON.parse(savedPinnedApps);
                    const pinnedApps = apps
                      .filter(app => pinnedIds.includes(app.id))
                      .slice(-5);

                    return pinnedApps.map(app => (
                      <div
                        key={app.id}
                        className="relative group"
                        onMouseLeave={() => {
                          setOpenMenuId(null);
                          setMenuPosition(null);
                        }}
                      >
                        <a onClick={() => {
                          if (app.id === '1') {
                            window.open(app.href, '_blank')
                          } else {
                            router.push(app.href, { scroll: false })
                          }
                        }}
                          className="ai-plus-item group flex items-center px-1.5 py-2 rounded-lg hover:bg-gray-200 cursor-pointer">
                          <div className="ai-plus-info flex items-center flex-1">
                            <div className="ai-plus-avatar w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center mr-1.5 overflow-hidden">
                              <img src={app.icon} alt={app.title} className="w-5 h-5 rounded-full object-cover" />
                            </div>
                            <span className="text-sm font-normoal">{app.title}</span>
                          </div>
                          <div className="more-btn hidden group-hover:block">
                            <EllipsisHorizontalIcon
                              className="h-5 w-5 text-gray-400 hover:text-gray-500 cursor-pointer menu-btn"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleMenuClick(e, app.id);
                              }}
                            />
                          </div>
                        </a>
                        {openMenuId === app.id && menuPosition && (
                          <div
                            className="absolute right-0 w-32 bg-white rounded-lg shadow-lg py-1 z-50 menu-container"
                            style={{
                              top: '70%',
                              right: menuPosition.right - 7
                            }}
                            onClick={e => e.stopPropagation()}
                          >
                            <a
                              href={app.href}
                              target="_blank"
                              className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 1024 1024">
                                <path d="M475.136 561.152v89.74336c0 20.56192 16.50688 37.23264 36.864 37.23264s36.864-16.67072 36.864-37.23264v-89.7024h89.7024c20.60288 0 37.2736-16.54784 37.2736-36.864 0-20.39808-16.67072-36.864-37.2736-36.864H548.864V397.63968A37.0688 37.0688 0 0 0 512 360.448c-20.35712 0-36.864 16.67072-36.864 37.2736v89.7024H385.4336a37.0688 37.0688 0 0 0-37.2736 36.864c0 20.35712 16.67072 36.864 37.2736 36.864h89.7024z" fill="currentColor" />
                                <path d="M512 118.784c-223.96928 0-405.504 181.57568-405.504 405.504 0 78.76608 22.44608 152.3712 61.35808 214.6304l-44.27776 105.6768a61.44 61.44 0 0 0 56.68864 85.1968H512c223.92832 0 405.504-181.53472 405.504-405.504 0-223.92832-181.57568-405.504-405.504-405.504z m-331.776 405.504a331.776 331.776 0 1 1 331.73504 331.776H198.656l52.59264-125.5424-11.59168-16.62976A330.09664 330.09664 0 0 1 180.224 524.288z" fill="currentColor" />
                              </svg>
                              <span>新建会话</span>
                            </a>
                            <button
                              className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const pinnedApps = JSON.parse(localStorage.getItem('ai_plus_pinned_apps') || '[]');
                                const newPinnedApps = pinnedApps.filter((id: string) => id !== app.id);
                                localStorage.setItem('ai_plus_pinned_apps', JSON.stringify(newPinnedApps));
                                setOpenMenuId(null);
                              }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 1024 1024">
                                <path d="M499.541333 117.76a38.4 38.4 0 0 1 54.272 0l352.426667 352.426667a38.4 38.4 0 0 1-54.314667 54.272l-2.218666-2.218667-190.08 190.122667c0.597333 71.509333-23.893333 141.397333-76.416 193.877333a38.4 38.4 0 0 1-54.314667 0l-178.517333-178.517333-141.269334 140.373333a38.4 38.4 0 0 1-54.144-54.442667l141.098667-140.245333-178.304-178.261333a38.4 38.4 0 0 1 0-54.357334c52.48-52.48 122.368-77.056 193.877333-76.373333l190.08-190.122667-2.176-2.218666a38.4 38.4 0 0 1 0-54.314667z m56.490667 110.805333L354.133333 430.506667a38.4 38.4 0 0 1-29.696 11.178666c-44.8-2.986667-87.210667 6.912-122.197333 29.226667l350.890667 350.890667c22.314667-34.986667 32.213333-77.44 29.226666-122.197334a38.4 38.4 0 0 1 11.136-29.738666l201.941334-201.898667-239.36-239.36z" fill="currentColor" />
                              </svg>
                              <span>移除置顶</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ));
                  } catch (error) {
                    console.error('Error parsing pinned apps:', error);
                    return null;
                  }
                }, [openMenuId, menuPosition])}
              </div>
            </div>

            <div className="history-part mt-4">
              <div className="nav-title flex items-center px-2 mb-2">
                <div className="title-label flex items-center text-gray-900">
                  <ClockIcon className="w-5 h-5 mr-2" />
                  <span className="text-sm">历史会话</span>
                </div>
              </div>
              <nav className="mt-4 flex-1 space-y-1 pl-4">
                <div className="max-h-[calc(100vh-20rem)] overflow-y-auto">
                  {list.slice(0, showAllConversations ? undefined : 7).map((item) => {
                    const isCurrent = item.id === currentId
                    const ItemIcon
                      = isCurrent ? ChatBubbleOvalLeftEllipsisSolidIcon : ChatBubbleOvalLeftEllipsisIcon
                    return (
                      <div
                        onClick={() => handleConversationClick(item.id)}
                        key={item.id}
                        onMouseLeave={() => setOpenMenuId(null)}
                        className={classNames(
                          isCurrent
                            ? '!bg-gray-200 text-gray-900'
                            : 'text-gray-400 hover:bg-gray-200 hover:text-gray-600',
                          'group flex items-center rounded-md px-2 py-2 ml-3 text-sm font-medium cursor-pointer',
                        )}
                      >
                        <div className="flex-1 flex justify-between items-center min-w-0 gap-2">
                          <span className="truncate max-w-[120px]">{item.name}</span>
                          <div className="flex-shrink-0 group-hover:hidden">
                            {item.created_at && (
                              <span className="text-xs text-gray-400">
                                {format(fromUnixTime(Number(item.created_at)), 'MM-dd')}
                              </span>
                            )}
                          </div>
                          <div className={`hidden ${item.name !== t('app.chat.newChat') ? 'group-hover:block' : ''} flex-shrink-0 relative`}>
                            <div className="relative">
                              <EllipsisHorizontalIcon
                                className="h-5 w-5 text-gray-400 hover:text-gray-500 cursor-pointer menu-btn"
                                onClick={(e) => handleMenuClick(e, item.id)}
                              />
                              {openMenuId === item.id && menuPosition && (
                                <div
                                  className="fixed w-28 bg-white rounded-md shadow-lg py-1 z-50 menu-container"
                                  style={{
                                    top: menuPosition.top,
                                    right: menuPosition.right
                                  }}
                                  onClick={e => e.stopPropagation()}
                                >
                                  <button
                                    className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left flex items-center gap-2"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      onPinConversation?.(item.id);
                                      setOpenMenuId(null);
                                    }}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 1024 1024">
                                      <path d="M499.541333 117.76a38.4 38.4 0 0 1 54.272 0l352.426667 352.426667a38.4 38.4 0 0 1-54.314667 54.272l-2.218666-2.218667-190.08 190.122667c0.597333 71.509333-23.893333 141.397333-76.416 193.877333a38.4 38.4 0 0 1-54.314667 0l-178.517333-178.517333-141.269334 140.373333a38.4 38.4 0 0 1-54.144-54.442667l141.098667-140.245333-178.304-178.261333a38.4 38.4 0 0 1 0-54.357334c52.48-52.48 122.368-77.056 193.877333-76.373333l190.08-190.122667-2.176-2.218666a38.4 38.4 0 0 1 0-54.314667z m56.490667 110.805333L354.133333 430.506667a38.4 38.4 0 0 1-29.696 11.178666c-44.8-2.986667-87.210667 6.912-122.197333 29.226667l350.890667 350.890667c22.314667-34.986667 32.213333-77.44 29.226666-122.197334a38.4 38.4 0 0 1 11.136-29.738666l201.941334-201.898667-239.36-239.36z" fill="currentColor" />
                                    </svg>
                                    置顶对话
                                  </button>
                                  <button
                                    className={`w-full px-3 py-2 text-sm text-left flex items-center gap-2 ${item.name === t('app.chat.newChat')
                                      ? 'text-gray-300 cursor-not-allowed'
                                      : 'text-gray-700 hover:bg-gray-100 cursor-pointer'
                                      }`}
                                    disabled={item.name === t('app.chat.newChat')}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      if (item.name !== t('app.chat.newChat')) {
                                        handleRename(item);
                                        setOpenMenuId(null);
                                      }
                                    }}
                                  >
                                    <PencilSquareIcon className="w-4 h-4" />
                                    重命名
                                  </button>
                                  <button
                                    className={`w-full px-3 py-2 text-sm text-left flex items-center gap-2 ${item.name === t('app.chat.newChat')
                                      ? 'text-gray-300 cursor-not-allowed'
                                      : 'text-red-600 hover:bg-gray-100 cursor-pointer'
                                      }`}
                                    disabled={item.name === t('app.chat.newChat')}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      if (item.name !== t('app.chat.newChat')) {
                                        handleDelete(item);
                                        setOpenMenuId(null);
                                      }
                                    }}
                                  >
                                    <TrashIcon className="w-4 h-4" />
                                    删除对话
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                {list.length >= 6 && (
                  <div
                    className="flex items-center justify-center py-2 text-sm text-gray-500 hover:text-gray-700 cursor-pointer"
                    onClick={() => setShowAllConversations(!showAllConversations)}
                  >
                    {showAllConversations ? "收起" : `查看全部 (${list.length})`}
                  </div>
                )}
              </nav>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 flex flex-shrink-0 pr-4 pb-4 pl-4">
          <div className="text-gray-400 font-normal text-xs">© {copyRight} {(new Date()).getFullYear()}</div>
        </div>
      </div>

      <Modal
        isShow={showRenameModal}
        title="重命名会话"
        onClose={() => setShowRenameModal(false)}
        actions={
          <>
            <button
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              onClick={() => setShowRenameModal(false)}
            >
              取消
            </button>
            <button
              className="px-4 py-2 text-sm text-white bg-primary-600 rounded-lg hover:bg-primary-700"
              onClick={() => {
                if (currentItem && editingName && editingName !== currentItem.name) {
                  onRenameConversation?.(currentItem.id, editingName)
                }
                setShowRenameModal(false)
              }}
            >
              确定
            </button>
          </>
        }
      >
        <input
          type="text"
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          value={editingName}
          onChange={e => setEditingName(e.target.value)}
          autoFocus
        />
      </Modal>

      <Modal
        isShow={showDeleteModal}
        title="删除会话"
        onClose={() => setShowDeleteModal(false)}
        actions={
          <>
            <button
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              onClick={() => setShowDeleteModal(false)}
            >
              取消
            </button>
            <button
              className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700"
              onClick={() => {
                if (currentItem) {
                  onDeleteConversation?.(currentItem.id)
                }
                setShowDeleteModal(false)
              }}
            >
              删除
            </button>
          </>
        }
      >
        <p className="text-sm text-gray-500">确定要删除这个会话吗？此操作无法撤销。</p>
      </Modal>
    </>
  )
}

export default React.memo(Sidebar)
