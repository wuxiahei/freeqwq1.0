import React, { useState, useEffect } from 'react'
import type { FC } from 'react'
import Link from 'next/link'
import './styles.css'
import { useRouter } from 'next/navigation'

// 定义应用卡片类型
interface AppCardProps {
    id: string
    icon: string
    title: string
    description: string
    href: string
    isPinned?: boolean
    onTogglePin?: (id: string) => void
}

// 应用卡片组件
const KimiPlusCard: FC<AppCardProps> = ({ icon, title, description, href, isPinned, onTogglePin, id }) => {
    return (
        <Link href={href} className="kimi-plus-card">
            <div className="kimi-plus-card-avatar">
                <img className="image-main" alt="" loading="eager" src={icon} />
            </div>
            <div className="ai-plus-card-info">
                <h5 className="kimi-plus-card-name">
                    <span title={title}>{title}</span>
                </h5>
                <p className="kimi-plus-card-desc" title={description}>{description}</p>
            </div>
            <div className={`kimi-plus-card-pin ${isPinned ? 'active' : ''}`} onClick={(e) => {
                e.preventDefault();
                onTogglePin && onTogglePin(id);
            }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 1024 1024" className="iconify">
                    <path d="M499.541333 117.76a38.4 38.4 0 0 1 54.272 0l352.426667 352.426667a38.4 38.4 0 1 1-54.314667 54.272l-2.218666-2.218667-190.08 190.122667c0.597333 71.509333-23.893333 141.397333-76.416 193.877333a38.4 38.4 0 0 1-54.314667 0l-178.517333-178.517333-141.269334 140.373333a38.4 38.4 0 0 1-54.144-54.442667l141.098667-140.202666-178.304-178.346667a38.4 38.4 0 0 1 0-54.314667c52.48-52.48 122.368-77.013333 193.877333-76.373333l190.08-190.122667-2.176-2.218666a38.4 38.4 0 0 1 0-54.314667z" fill="currentColor"></path>
                </svg>
            </div>
        </Link>
    )
}

// 定义应用分组类型
interface AppGroup {
    title: string
    apps: AppCardProps[]
}

// 本地存储key
const PINNED_APPS_KEY = 'ai_plus_pinned_apps'

const AiPlus: FC = () => {
    // 导航项
    const navItems = ['我的置顶', '官方推荐', '办公提效', '辅助写作']

    // 当前选中的导航项
    const [activeNav, setActiveNav] = useState('我的置顶')

    const router = useRouter()

    // 从本地存储初始化应用数据
    const initializeAppGroups = () => {
        const savedPinnedApps = localStorage.getItem(PINNED_APPS_KEY)
        let initialGroups = [
            {
                title: '我的置顶',
                apps: []
            },
            {
                title: '官方推荐',
                apps: [
                    {
                        id: '1',
                        icon: './ppt.png',
                        title: 'PPT 助手',
                        description: '一键生成PPT',
                        href: '/ppt-generator/index.html',
                        isPinned: false
                    },
                ]
            },
            {
                title: '办公提效',
                apps: [
                    {
                        id: '1',
                        icon: './ppt.png',
                        title: 'PPT 助手',
                        description: '一键生成PPT',
                        href: '/ppt-generator/index.html',
                        isPinned: false
                    },
                ]
            },
            {
                title: '辅助写作',
                apps: [
                    {
                        id: '2',
                        icon: 'https://kimi-img.moonshot.cn/prod-chat-kimi/avatar/kimiplus/feman.png',
                        title: '中译英专家',
                        description: '中译英专家',
                        href: '/ai-plus/fff43c71-e05d-40d0-b533-e1c9a4df1c5a',
                        isPinned: false
                    },
                ]
            }
        ]

        if (savedPinnedApps) {
            try {
                const pinnedAppIds = JSON.parse(savedPinnedApps)
                // 更新所有应用的置顶状态
                initialGroups = initialGroups.map(group => ({
                    ...group,
                    apps: group.apps.map(app => ({
                        ...app,
                        isPinned: pinnedAppIds.includes(app.id)
                    }))
                }))

                // 更新"我的置顶"分组，根据ID去重
                const allApps = initialGroups.flatMap(group =>
                    group.title !== '我的置顶' ? group.apps : []
                );
                const pinnedApps = allApps.filter(app => pinnedAppIds.includes(app.id));
                // 使用 Map 根据 id 去重，保留第一个置顶的卡片
                const uniquePinnedApps = Array.from(
                    new Map(pinnedApps.map(app => [app.id, app])).values()
                );
                initialGroups[0].apps = uniquePinnedApps;
            } catch (error) {
                console.error('Error parsing saved pinned apps:', error)
            }
        }

        return initialGroups
    }

    const [appGroups, setAppGroups] = useState<AppGroup[]>(initializeAppGroups)

    // 保存置顶状态到本地存储
    const savePinnedApps = (groups: AppGroup[]) => {
        const allApps = groups.flatMap(group => group.apps)
        const pinnedAppIds = Array.from(new Set(
            allApps.filter(app => app.isPinned).map(app => app.id)
        ))
        localStorage.setItem(PINNED_APPS_KEY, JSON.stringify(pinnedAppIds))
    }

    // 切换置顶状态
    const handleTogglePin = (id: string) => {
        setAppGroups(prevGroups => {
            const updatedGroups = prevGroups.map(group => {
                if (group.title === '我的置顶') {
                    return group; // 不直接修改"我的置顶"分组
                }
                return {
                    ...group,
                    apps: group.apps.map(app => {
                        if (app.id === id) {
                            return { ...app, isPinned: !app.isPinned };
                        }
                        return app;
                    })
                };
            });

            // 更新"我的置顶"分组
            const allApps = updatedGroups.flatMap(group =>
                group.title !== '我的置顶' ? group.apps : []
            );
            const pinnedApps = allApps.filter(app => app.isPinned);
            // 根据ID去重，保留第一个置顶的卡片
            const uniquePinnedApps = Array.from(
                new Map(pinnedApps.map(app => [app.id, app])).values()
            );

            const pinnedGroup = updatedGroups.find(g => g.title === '我的置顶');
            if (pinnedGroup) {
                pinnedGroup.apps = uniquePinnedApps;
            }

            // 保存到本地存储
            savePinnedApps(updatedGroups);
            return updatedGroups;
        });
    };

    const handleClose = () => {
        router.push('/')
    }

    return (
        <div className="square-container rounded-lg">
            <div className="layout-container">
                <div className="layout-header">
                    <div className="header-left">
                        <div className="icon-button expand-btn" style={{ width: '32px', height: '32px', display: 'none' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 1024 1024">
                                <path d="M861.866667 162.133333c-17.066667-17.066667-42.666667-29.866667-68.266667-29.866666H226.133333c-25.6 0-51.2 8.533333-68.266666 29.866666S128 204.8 128 230.4v567.466667c0 25.6 8.533333 51.2 29.866667 68.266666 17.066667 17.066667 42.666667 29.866667 68.266666 29.866667h567.466667c25.6 0 51.2-8.533333 68.266667-29.866667 17.066667-17.066667 29.866667-42.666667 29.866666-68.266666V226.133333c0-25.6-8.533333-46.933333-29.866666-64zM366.933333 814.933333H226.133333c-4.266667 0-8.533333 0-12.8-4.266666-4.266667-4.266667-4.266666-8.533333-4.266666-12.8V226.133333c0-4.266667 0-8.533333 4.266666-12.8 4.266667-4.266667 8.533333-4.266667 12.8-4.266666h140.8v605.866666z m448-17.066666c0 4.266667 0 8.533333-4.266666 12.8-4.266667 4.266667-8.533333 4.266667-12.8 4.266666h-354.133334V209.066667h354.133334c4.266667 0 8.533333 0 12.8 4.266666 4.266667 4.266667 4.266667 8.533333 4.266666 12.8v571.733334z" fill="currentColor"></path>
                            </svg>
                        </div>
                    </div>
                    <div className="header-center"></div>
                    <div className="header-right">
                        <div onClick={handleClose}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="close-button iconify" width="1em" height="1em" viewBox="0 0 1024 1024">
                                <path d="M808.1408 228.22912a37.6832 37.6832 0 0 1 0 53.28896l-242.81088 242.81088 242.72896 242.688a37.6832 37.6832 0 0 1-53.32992 53.32992l-242.688-242.72896-242.81088 242.81088a37.6832 37.6832 0 0 1-49.72544 3.15392l-3.56352-3.11296a37.6832 37.6832 0 0 1 0-53.32992l242.81088-242.81088-242.8928-242.8928a37.6832 37.6832 0 0 1 53.248-53.32992l242.93376 242.8928 242.81088-242.76992a37.6832 37.6832 0 0 1 49.7664-3.15392l3.56352 3.15392z" fill="currentColor"></path>
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="square">
                    <div className="square-title">探索 AI+</div>
                    <ul className="square-nav">
                        {navItems.map((item) => (
                            <li
                                key={item}
                                className={`square-nav-item ${activeNav === item ? 'active' : ''}`}
                                onClick={() => setActiveNav(item)}
                            >
                                {item}
                            </li>
                        ))}
                    </ul>

                    <div className="square-list">
                        {activeNav === '我的置顶' ? (
                            <>
                                {appGroups.map((group) => (
                                    <div key={group.title} className="square-group">
                                        <header className="square-group-title">{group.title}</header>
                                        <ul className="square-group-list">
                                            {group.apps.map((app) => (
                                                <li key={app.id} className="square-group-list-item">
                                                    <KimiPlusCard
                                                        {...app}
                                                        onTogglePin={handleTogglePin}
                                                    />
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <div className="square-group">
                                <header className="square-group-title">{activeNav}</header>
                                <ul className="square-group-list">
                                    {appGroups.find(group => group.title === activeNav)?.apps.map((app) => (
                                        <li key={app.id} className="square-group-list-item">
                                            <KimiPlusCard
                                                {...app}
                                                onTogglePin={handleTogglePin}
                                            />
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AiPlus 