import localforage from 'localforage'
import axios from 'axios'
import { ACCESS_TOKEN, API_BASE_URL } from '../../utils/constants.ts'

export const getAllChatsByUserId = async userId => {
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
        `${API_BASE_URL}/api/chats/of-users/${userId}`,
        options
      )
      return response.data
    } catch (error) {
      console.log(error)
    }
  })
}

export const createNewChat = async data => {
  return localforage.getItem(ACCESS_TOKEN).then(async token => {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        title: data.title,
        userId: data.userId,
        shareId: 'null'
      })
    }
    console.log(
      JSON.stringify({
        title: data.title,
        userId: data.userId,
        shareId: null
      })
    )
    try {
      const response = await fetch(`${API_BASE_URL}/api/chats`, options)
      return response.json()
    } catch (error) {
      console.log(error)
    }
  })
}

export const renameChat = async (chatId, userId, data) => {
  return localforage.getItem(ACCESS_TOKEN).then(async token => {
    const options = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        title: data.title
      })
    }
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/chats/${chatId}/rename/of-users/${userId}`,
        options
      )
      return response.json()
    } catch (error) {
      console.log(error)
    }
  })
}

export const deleteChat = async (chatId, userId) => {
  return localforage.getItem(ACCESS_TOKEN).then(async token => {
    const options = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    }
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/chats/${chatId}/delete/of-users/${userId}`,
        options
      )
      return response.json()
    } catch (error) {
      console.log(error)
    }
  })
}
