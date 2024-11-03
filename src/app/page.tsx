'use client'

import { ChatLayout } from '@/components/chat/chat-layout'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogContent
} from '@/components/ui/dialog'
import SignUpForm from '@/components/signup-form'
import { getSelectedModel } from '@/lib/model-helper'
import { ChatOllama } from '@langchain/ollama'
import { AIMessage, HumanMessage } from '@langchain/core/messages'
import { BytesOutputParser } from '@langchain/core/output_parsers'
import { Attachment } from 'ai'
import { Message, useChat } from 'ai/react'
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { v4 as uuidv4 } from 'uuid'
import useChatStore from './hooks/useChatStore'
import LoginForm from '@/components/login-form'
import { getCurrentUser } from '@/app/api/authentication'
import { createContent } from '@/app/api/content'
import useAuthStore from './hooks/useAuthStore'
import { createNewChat } from './api/chat'
import { useRouter } from 'next/navigation'
import useSettingStore from './hooks/useSettingStore'
import { useTheme } from 'next-themes'

export default function Home () {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    data,
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
  const [chatId, setChatId] = React.useState<string>('')
  const [selectedModel, setSelectedModel] = React.useState<string>(
    getSelectedModel()
  )
  const [open, setOpen] = React.useState(false)
  const [ollama, setOllama] = useState<ChatOllama>()
  const [isHavingAccount, setIsHavingAccount] = useState(false)
  const env = process.env.NODE_ENV
  const [loadingSubmit, setLoadingSubmit] = React.useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const base64Images = useChatStore(state => state.base64Images)
  const setBase64Images = useChatStore(state => state.setBase64Images)
  const { currentUser, setCurrentUser } = useAuthStore()
  const { setTheme, theme } = useTheme()

  useEffect(() => {
    const newOllama = new ChatOllama({
      baseUrl: process.env.NEXT_PUBLIC_OLLAMA_URL || 'http://localhost:11434',
      model: selectedModel
    })
    setOllama(newOllama)
  }, [selectedModel])

  const addMessage = (Message: Message) => {
    messages.push(Message)
    setMessages([...messages])
  }
  const router = useRouter()
  // Function to handle chatting with Ollama in production (client side)
  const handleSubmitProduction = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault()
    if (ollama) {
      try {
        createNewChat({
          title: 'New Chat',
          userId: currentUser?.id
        }).then(response => {
          if (response.success) {
            setChatId(response.payload.chatId)
            const createdChatId = response.payload.chatId
            createContent({
              chatId: createdChatId,
              messageType: 'PROMPT',
              modelName: selectedModel,
              message: input
            })
              .then(async response => {
                if (response.success) {
                  addMessage({
                    role: 'user',
                    content: response.payload.message,
                    id: createdChatId
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
                      {
                        role: 'assistant',
                        content: responseMessage,
                        id: createdChatId
                      }
                    ])
                  }
                  addMessage({
                    role: 'assistant',
                    content: responseMessage,
                    id: createdChatId
                  })
                  setMessages([...messages])
                  createContent({
                    chatId: createdChatId,
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
          }
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

    messages.slice(0, -1)

    handleSubmitProduction(e)
    setBase64Images(null)
  }

  const { fetchSetting } = useSettingStore()
  useEffect(() => {
    getCurrentUser().then(response => {
      if (response?.success) {
        setCurrentUser(response.payload)
        fetchSetting(response.payload.id).then(setting => {
          if (setting) {
            setTheme(setting.theme)
          }
        })
        setOpen(false)
      } else {
        setOpen(true)
      }
    })
  }, [fetchSetting, setCurrentUser, setTheme])

  return (
    <main className='flex h-[calc(100dvh)] flex-col items-center'>
      <Dialog open={open}>
        <ChatLayout
          chatId=''
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
        <DialogContent className='flex flex-col space-y-4'>
          <DialogHeader className='space-y-2'>
            <DialogTitle>Welcome to Ollama!</DialogTitle>
            <DialogDescription>
              Enter your name to get started. This is just to personalize your
              experience.
            </DialogDescription>
            {isHavingAccount ? (
              <div className='space-y-6'>
                <LoginForm setOpen={setOpen} />
                <Button
                  className='w-full mt-4'
                  onClick={() => setIsHavingAccount(false)}
                >
                  Don&apos;t have an account? Sign up
                </Button>
              </div>
            ) : (
              <div className='space-y-4'>
                <SignUpForm setOpen={setOpen} />
                <Button
                  className='w-full'
                  onClick={() => setIsHavingAccount(true)}
                >
                  Already have an account? Sign in
                </Button>
              </div>
            )}
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </main>
  )
}
