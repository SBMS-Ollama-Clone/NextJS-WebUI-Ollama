import axios from 'axios'
import { API_BASE_URL, ACCESS_TOKEN } from '@/utils/constants'
import localforage from 'localforage'

export const request = async (url, method, data, opts) => {
  try {
    const options = {
      headers: { 'Content-Type': 'application/json' },
      ...opts
    }
    const response = await axios[method](`${url}`, data, options)
    return response.data
  } catch (error) {
    if (error?.code == 'ERR_NETWORK') {
      return {
        code: 500,
        errors:
          'Error connecting to the server. Please check your internet connection and try again.',
        success: false
      }
    } else if (error?.code == 'ERR_BAD_REQUEST') {
      return {
        code: 400,
        errors: 'Bad request. Please check your request and try again.',
        success: false
      }
    }
  }
}

export const login = async (email, password) => {
  return request(`${API_BASE_URL}/api/auth/login`, 'post', { email, password })
}

export const signup = async (email, username, password) => {
  return request(`${API_BASE_URL}/api/auth/signup`, 'post', {
    email,
    username,
    password,
    roles: ['ROLE_USER']
  })
}

export const logout = async () => {
  return request(`${API_BASE_URL}/api/auth/logout`, 'get')
}

export const getCurrentUser = async () => {
  return localforage.getItem(ACCESS_TOKEN).then(async accessToken => {
    if (!accessToken) {
      return Promise.resolve({ success: false })
    }
    const options = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      }
    }
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/auth/user/me`,
        options
      )
      return response.data
    } catch (error) {
      console.log(error)
    }
  })
}
