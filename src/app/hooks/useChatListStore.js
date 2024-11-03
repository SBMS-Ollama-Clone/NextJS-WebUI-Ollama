import { create } from 'zustand'
import { getAllChatsByUserId } from '../api/chat'

const useChatListStore = create(set => ({
  localChats: [],
  fetchLocalChats: async userId => {
    getAllChatsByUserId(userId).then(response => {
      console.log(response)
      if (response?.success) {
        const chats = response.payload
        set({
          localChats: chats?.map(chat => {
            return {
              chatId: chat.chatId,
              title: chat.title
            }
          })
        })
      }
    })
  },
  setLocalChats: localChats => set({ localChats }),
}))

export default useChatListStore
