import localforage from 'localforage'
import axios from 'axios'
import { ACCESS_TOKEN, API_BASE_URL } from '../../utils/constants.ts'

export const createSetting = async data => {
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
        `${API_BASE_URL}/api/settings/create`,
        options
      ).then(response => response.json())
      return response
    } catch (error) {
      console.log(error)
    }
  })
}

export const getSettingByUserId = async userId => {
  return localforage.getItem(ACCESS_TOKEN).then(async token => {
    const options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    }
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/settings/of-users/${userId}`,
        options
      ).then(response => response.json())
      return response
    } catch (error) {
      console.log(error)
    }
  })
}

export const updateSetting = async (data) => {
  const transferData = {
    theme: data.theme
  }
  return localforage.getItem(ACCESS_TOKEN).then(async token => {
    const options = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(transferData)
    }
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/settings/${data.id}/update`,
        options
      ).then(response => response.json())
      return response
    } catch (error) {
      console.log(error)
    }
  })
}
