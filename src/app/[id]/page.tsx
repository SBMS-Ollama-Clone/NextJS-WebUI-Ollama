'use client'

import { ChatLayout } from '@/components/chat/chat-layout'
import { getSelectedModel } from '@/lib/model-helper'
import { ChatOllama } from '@langchain/ollama'
import { AIMessage, HumanMessage } from '@langchain/core/messages'
import { BytesOutputParser } from '@langchain/core/output_parsers'
import { Attachment } from 'ai'
import { Message, useChat } from 'ai/react'
import React, { useEffect } from 'react'
import { toast } from 'sonner'
import useChatStore from '../hooks/useChatStore'
import { createContent, getAllContentsByChatId } from '@/app/api/content'
import { getCurrentUser } from '@/app/api/authentication'
import { useRouter } from 'next/navigation'
import useAuthStore from '../hooks/useAuthStore'
import useSettingStore from '../hooks/useSettingStore'
import { useTheme } from 'next-themes'

export default function Page ({ params }: { params: { id: string } }) {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    stop,
    setMessages,
    setInput
  } = useChat({
    onResponse: response => {
      if (response) {
        setLoadingSubmit(false)
      }
    },
    onError: error => {
      setLoadingSubmit(false)
      toast.error('An error occurred. Please try again.')
    }
  })
  const router = useRouter()
  const [chatId, setChatId] = React.useState<string>('')
  const [selectedModel, setSelectedModel] = React.useState<string>(
    getSelectedModel()
  )
  const [ollama, setOllama] = React.useState<ChatOllama>()
  const [loadingSubmit, setLoadingSubmit] = React.useState(false)
  const formRef = React.useRef<HTMLFormElement>(null)
  const base64Images = useChatStore(state => state.base64Images)
  const setBase64Images = useChatStore(state => state.setBase64Images)
  const { currentUser, setCurrentUser } = useAuthStore()
  const { fetchSetting } = useSettingStore()
  const { setTheme } = useTheme()

  useEffect(() => {
    const newOllama = new ChatOllama({
      baseUrl: process.env.NEXT_PUBLIC_OLLAMA_URL || 'http://localhost:11434',
      model: selectedModel
    })
    setOllama(newOllama)
  }, [selectedModel])

  React.useEffect(() => {
    if (params.id) {
      setChatId(params.id)
      getCurrentUser().then(response => {
        if (response.success) {
          setCurrentUser(response.payload)
          fetchSetting(response.payload.id).then(setting => {
            if (setting) {
              setTheme(setting.theme)
            }
          })
          getAllContentsByChatId(params.id).then(response => {
            console.log(response)
            if (response?.status == 'NOT_FOUND') {
              toast.warning(response.errors)
            }
            if (response?.success) {
              setMessages(
                response.payload?.map(
                  (content: {
                    messageType: string
                    message: string
                    id: string
                  }) => {
                    return {
                      role:
                        content.messageType === 'PROMPT' ? 'user' : 'assistant',
                      content: content.message,
                      id: content.id
                    }
                  }
                )
              )
            }
          })
        } else {
          router.push('/')
        }
      })
    }
  }, [params.id, fetchSetting, setCurrentUser, setMessages, setTheme, router])

  const addMessage = (Message: any) => {
    messages.push(Message)
    setMessages([...messages])
  }

  // Function to handle chatting with Ollama in production (client side)
  const handleSubmitProduction = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault()
    if (ollama) {
      try {
        createContent({
          chatId: chatId,
          messageType: 'PROMPT',
          modelName: selectedModel,
          message: input
        })
          .then(async response => {
            if (response.success) {
              addMessage({
                role: 'user',
                content: response.payload.message,
                id: chatId
              })
              setInput('')
              setMessages([...messages])

              const parser = new BytesOutputParser()
              const stream = await ollama
                .pipe(parser)
                .stream(
                  (messages as Message[]).map(m =>
                    m.role == 'user'
                      ? new HumanMessage(m.content)
                      : new AIMessage(m.content)
                  )
                )
              const decoder = new TextDecoder()

              let responseMessage = ''
              for await (const chunk of stream) {
                const decodedChunk = decoder.decode(chunk)
                responseMessage += decodedChunk
                setLoadingSubmit(false)
                setMessages([
                  ...messages,
                  { role: 'assistant', content: responseMessage, id: chatId }
                ])
              }
              addMessage({
                role: 'assistant',
                content: responseMessage,
                id: chatId
              })
              setMessages([...messages])
              createContent({
                chatId: chatId,
                messageType: 'RESPONSE',
                message: responseMessage.trim(),
                modelName: selectedModel
              }).then(response => {
                if (response.success) {
                  messages.push({
                    role: 'assistant',
                    content: responseMessage.trim(),
                    id: response.payload.contentId
                  })
                }
              })
            }
          })
          .catch(error => {
            console.log(error)
          })
      } catch (error) {
        toast.error('An error occurred. Please try again.')
        setLoadingSubmit(false)
      }
    }
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoadingSubmit(true)

    setMessages([...messages])

    const attachments: Attachment[] = base64Images
      ? base64Images.map(image => ({
          contentType: 'image/base64', // Content type for base64 images
          url: image // The base64 image data
        }))
      : []

    handleSubmitProduction(e)
    setBase64Images(null)
  }

  return (
    <main className='flex h-[calc(100dvh)] flex-col items-center'>
      <ChatLayout
        chatId={params.id}
        setSelectedModel={setSelectedModel}
        messages={messages}
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={onSubmit}
        isLoading={isLoading}
        loadingSubmit={loadingSubmit}
        error={error}
        stop={stop}
        navCollapsedSize={10}
        defaultLayout={[30, 160]}
        formRef={formRef}
        setMessages={setMessages}
        setInput={setInput}
      />
    </main>
  )
}
