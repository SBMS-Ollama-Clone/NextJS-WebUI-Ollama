import localforage from 'localforage'
import axios from 'axios'
import { ACCESS_TOKEN, API_BASE_URL } from '../../utils/constants.ts'

export const getAllContentsByChatId = async chatId => {
  return localforage.getItem(ACCESS_TOKEN).then(async token => {
    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    }
    try {
      const response = await axios.get(
        // `${API_BASE_URL}/api/contents/${chatId}/all`,
        `${API_BASE_URL}/api/chats/${chatId}/contents`,
        options
      )
      return response.data
    } catch (error) {
      console.log(error)
    }
  })
}

export const createContent = async data => {
  return localforage.getItem(ACCESS_TOKEN).then(async token => {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    }
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/contents`,
        options
      ).then(response => response.json())
      return response
    } catch (error) {
      console.log(error)
    }
  })
}
