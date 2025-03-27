import { useState } from 'react'
import produce from 'immer'
import { useGetState } from 'ahooks'
import type { ConversationItem } from '@/types/app'
import client from '@/lib/client'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const storageConversationIdKey = 'conversationIdInfo'

type ConversationInfoType = Omit<ConversationItem, 'inputs' | 'id'>

export default function useConversation() {
    const [conversations, setConversations] = useState<ConversationItem[]>([])
    const [currConversationId, doSetCurrConversationId, getCurrConversationId] = useGetState<string>('-1')
    const [, forceUpdate] = useState({})
    const [newConversationInputs, setNewConversationInputs] = useState<Record<string, any> | null>(null)
    const [existConversationInputs, setExistConversationInputs] = useState<Record<string, any> | null>(null)
    const [newConversationInfo, setNewConversationInfo] = useState<ConversationInfoType | null>(null)
    const [existConversationInfo, setExistConversationInfo] = useState<ConversationInfoType | null>(null)

    const isNewConversation = currConversationId === '-1'
    const currInputs = isNewConversation ? newConversationInputs : existConversationInputs
    const setCurrInputs = isNewConversation ? setNewConversationInputs : setExistConversationInputs
    const currConversationInfo = isNewConversation ? newConversationInfo : existConversationInfo

    const setCurrConversationId = (id: string, appId: string, isSetToLocalStroge = true, newConversationName = '') => {
        doSetCurrConversationId(id)
        if (isSetToLocalStroge && id !== '-1') {
            const conversationIdInfo = globalThis.localStorage?.getItem(storageConversationIdKey) ? JSON.parse(globalThis.localStorage?.getItem(storageConversationIdKey) || '') : {}
            conversationIdInfo[appId] = id
            globalThis.localStorage?.setItem(storageConversationIdKey, JSON.stringify(conversationIdInfo))
        }

        if (id === '-1') {
            const timestamp = new Date().getTime().toString();
            setNewConversationInfo({
                name: newConversationName || `New Chat_${timestamp}`,
                introduction: ''
            })
        }
    }

    const getConversationIdFromStorage = (appId: string) => {
        const conversationIdInfo = globalThis.localStorage?.getItem(storageConversationIdKey) ? JSON.parse(globalThis.localStorage?.getItem(storageConversationIdKey) || '') : {}
        const id = conversationIdInfo[appId]
        return id
    }

    const resetNewConversationInputs = () => {
        if (!newConversationInputs)
            return
        setNewConversationInputs(produce(newConversationInputs, (draft) => {
            Object.keys(draft).forEach((key) => {
                draft[key] = ''
            })
        }))
    }

    const renameConversation = async (id: string, newName: string) => {
        try {
            await client.renameConversation(id, newName)
            setConversations(prev =>
                prev.map(item =>
                    item.id === id ? { ...item, name: newName } : item
                )
            )
            forceUpdate({})
        } catch (error) {
            console.error('Failed to rename conversation:', error)
            throw error
        }
    }

    const exportConversationToPDF = async (conversationId: string) => {
        try {
            const element = document.getElementById(`conversation-${conversationId}`)
            if (!element) return

            const canvas = await html2canvas(element)
            const pdf = new jsPDF('p', 'mm', 'a4')
            const imgData = canvas.toDataURL('image/png')
            const imgWidth = pdf.internal.pageSize.getWidth()
            const imgHeight = (canvas.height * imgWidth) / canvas.width

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
            pdf.save(`conversation-${conversationId}.pdf`)
        } catch (error) {
            console.error('Failed to export conversation to PDF:', error)
            throw error
        }
    }

    const deleteConversation = async (id: string) => {
        try {
            await client.deleteConversation(id)
            setConversations(prev => prev.filter(item => item.id !== id))
        } catch (error) {
            console.error('Failed to delete conversation:', error)
            throw error
        }
    }

    return {
        conversations,
        setConversations,
        currConversationId,
        getCurrConversationId,
        setCurrConversationId,
        getConversationIdFromStorage,
        isNewConversation,
        currInputs,
        newConversationInputs,
        existConversationInputs,
        resetNewConversationInputs,
        setCurrInputs,
        currConversationInfo,
        setNewConversationInfo,
        setExistConversationInfo,
        renameConversation,
        exportConversationToPDF,
        deleteConversation
    }
}