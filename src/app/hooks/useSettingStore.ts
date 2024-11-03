import { create } from 'zustand'
import { getSettingByUserId } from '@/app/api/setting'

interface SettingProps {
  id: string | null
  theme: string
  language: string
  modelName: string | null
  systemPrompt: string | null
}
interface Actions {
  setting: SettingProps | null
  setSetting: (setting: SettingProps) => void,
  fetchSetting: (userId: string) => Promise<SettingProps | void>
}
const useSettingStore = create<Actions>(set => ({
  setting: {
    id: null,
    theme: 'dark',
    language: 'en',
    modelName: null,
    systemPrompt: null
  },
  setSetting: setting => set({ setting }),
  fetchSetting: async (userId: string) => {
    return getSettingByUserId(userId).then(response => {
      console.log(response)
      if (response.success) {
        set({ setting: response.payload })
        return response.payload
      }
    })
  }
}))

export default useSettingStore
