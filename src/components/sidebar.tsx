'use client'

import Link from 'next/link'
import { Edit2, MoreHorizontal, SquarePen, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'
import { Message } from 'ai/react'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import UserSettings from './user-settings'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from './ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from './ui/dropdown-menu'
import { useParams, useRouter } from 'next/navigation'
import {
  createNewChat,
  getAllChatsByUserId,
  deleteChat,
  renameChat
} from '@/app/api/chat'
import useAuthStore from '@/app/hooks/useAuthStore'
import useChatListStore from '@/app/hooks/useChatListStore'

interface SidebarProps {
  isCollapsed: boolean
  onClick?: () => void
  isMobile: boolean
  closeSidebar?: () => void
}

interface ChatProps {
  chatId: string
  contents: object
  title: string
}

export function Sidebar ({ isCollapsed, isMobile, closeSidebar }: SidebarProps) {
  // const [localChats, setLocalChats] = useState<
  //   { chatId: string; title: string }[]
  // >([])
  const router = useRouter()
  const params = useParams()
  const { currentUser, setCurrentUser } = useAuthStore()
  const { localChats, setLocalChats, fetchLocalChats } = useChatListStore()

  useEffect(() => {
    if (currentUser) fetchLocalChats(currentUser?.id)
  }, [currentUser, setCurrentUser, fetchLocalChats])

  const handleDeleteChat = (chatId: string) => {
    if (currentUser) {
      deleteChat(chatId, currentUser.id).then(response => {
        if (response.success) {
          setLocalChats(
            localChats.filter((chat: { chatId: string }) => {
              return chat.chatId !== chatId
            })
          )
          if (chatId === params.id) {
            router.push('/')
          }
        }
      })
    }
  }

  const inputRenameRef = useRef<HTMLInputElement>(null)
  const renameRef = useRef<HTMLButtonElement>(null)
  const deleteRef = useRef<HTMLButtonElement>(null)

  return (
    <div
      data-collapsed={isCollapsed}
      className='relative justify-between group lg:bg-accent/20 lg:dark:bg-card/35 flex flex-col h-full gap-4 p-2 data-[collapsed=true]:p-2 '
    >
      <div className=' flex flex-col justify-between p-2 max-h-fit overflow-y-auto'>
        <Button
          onClick={() => {
            if (currentUser) {
              createNewChat({
                title: 'New Chat',
                userId: currentUser?.id
              }).then(response => {
                if (response.success) {
                  router.push(`/${response.payload.chatId}`)
                  if (closeSidebar) {
                    closeSidebar()
                  }
                }
              })
            }
          }}
          variant='ghost'
          className='flex justify-between w-full h-14 text-sm xl:text-lg font-normal items-center '
        >
          <div className='flex gap-3 items-center '>
            {!isCollapsed && !isMobile && (
              <Image
                src='/ollama.png'
                alt='AI'
                width={28}
                height={28}
                className='dark:invert hidden 2xl:block'
              />
            )}
            New chat
          </div>
          <SquarePen size={18} className='shrink-0 w-4 h-4' />
        </Button>

        <div className='flex flex-col pt-10 gap-2'>
          <p className='pl-4 text-xs text-muted-foreground'>Your chats</p>
          {localChats.length > 0 && (
            <div>
              {localChats.map(
                (
                  { chatId, title }: { chatId: string; title: string },
                  index: number
                ) => (
                  <Link
                    key={index}
                    href={`/${chatId}`}
                    className={cn(
                      {
                        [buttonVariants({ variant: 'secondaryLink' })]:
                          chatId === params.id,
                        [buttonVariants({ variant: 'ghost' })]:
                          chatId !== params.id
                      },
                      'flex justify-between w-full h-14 text-base font-normal items-center '
                    )}
                  >
                    <div className='flex gap-3 items-center truncate'>
                      <div className='flex flex-col'>
                        <span className='text-xs font-normal '>{title}</span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant='ghost'
                          className='flex justify-end items-center'
                          onClick={e => e.stopPropagation()}
                        >
                          <MoreHorizontal size={15} className='shrink-0' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className=' '>
                        <Dialog>
                          <DialogTrigger ref={renameRef} asChild>
                            <Button
                              variant='ghost'
                              className='w-full flex gap-2 hover:text-blue-400 text-blue-500 justify-start items-center'
                              onClick={e => e.stopPropagation()}
                            >
                              <Edit2 className='shrink-0 w-4 h-4' />
                              Rename
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader className='space-y-4'>
                              <DialogTitle>Delete chat?</DialogTitle>
                              <DialogDescription>
                                <input
                                  className='w-full p-2 border border-gray-300 rounded-md'
                                  type='text'
                                  placeholder='Enter new chat name'
                                  ref={inputRenameRef}
                                />
                              </DialogDescription>
                              <div className='flex justify-end gap-2'>
                                <Button
                                  variant='outline'
                                  onClick={() => renameRef.current?.click()}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant='default'
                                  onClick={() => {
                                    if (currentUser) {
                                      renameChat(chatId, currentUser.id, {
                                        title: inputRenameRef.current?.value
                                      }).then(response => {
                                        if (response.success) {
                                          renameRef.current?.click()
                                          setLocalChats(
                                            localChats.map(
                                              (chat: { chatId: string }) => {
                                                if (chat.chatId === chatId) {
                                                  return {
                                                    ...chat,
                                                    title:
                                                      inputRenameRef.current
                                                        ?.value
                                                  }
                                                }
                                                return chat
                                              }
                                            )
                                          )
                                        }
                                      })
                                    }
                                  }}
                                >
                                  Rename
                                </Button>
                              </div>
                            </DialogHeader>
                          </DialogContent>
                        </Dialog>

                        <Dialog>
                          <DialogTrigger ref={deleteRef} asChild>
                            <Button
                              variant='ghost'
                              className='w-full flex gap-2 hover:text-red-400 text-red-500 justify-start items-center'
                              onClick={e => e.stopPropagation()}
                            >
                              <Trash2 className='shrink-0 w-4 h-4' />
                              Delete chat
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader className='space-y-4'>
                              <DialogTitle>Delete chat?</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to delete this chat? This
                                action cannot be undone.
                              </DialogDescription>
                              <div className='flex justify-end gap-2'>
                                <Button
                                  variant='outline'
                                  onClick={() => deleteRef.current?.click()}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant='destructive'
                                  onClick={() => handleDeleteChat(chatId)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </DialogHeader>
                          </DialogContent>
                        </Dialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </Link>
                )
              )}
            </div>
          )}
        </div>
      </div>
      <div className='justify-end px-2 py-2 w-full border-t'>
        <UserSettings />
      </div>
    </div>
  )
}
