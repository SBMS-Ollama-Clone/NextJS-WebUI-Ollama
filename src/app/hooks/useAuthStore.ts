import { create } from 'zustand'

interface CurrentUserProps {
    id: string
    email: string
    username: string
    profileURL: string
}

interface Actions {
    currentUser: CurrentUserProps | null
    setCurrentUser: (currentUser: CurrentUserProps) => void
}
const useAuthStore = create<Actions>(set => ({
    currentUser: null,
    setCurrentUser: currentUser => set({ currentUser })
}))

export default useAuthStore;