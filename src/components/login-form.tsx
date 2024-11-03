'use client'

import { set, z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import React from 'react'
import { ACCESS_TOKEN, GOOGLE_AUTH_URL, REFRESH_TOKEN } from '@/utils/constants'
import Image from 'next/image'
import { getCurrentUser, login } from '@/app/api/authentication'
import localforage from 'localforage'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import useAuthStore from '@/app/hooks/useAuthStore'

const formSchema = z.object({
  email: z.string().email({
    message: 'Invalid email address.'
  }),
  password: z.string().min(4, {
    message: 'Password must be at least 4 characters.'
  })
})

interface LoginFormProps {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export default function LoginForm ({ setOpen }: LoginFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })
  const { setCurrentUser } = useAuthStore()

  function onSubmit (values: z.infer<typeof formSchema>) {
    login(values.email, values.password)
      .then(response => {
        if (response.success) {
          localforage
            .setItem(ACCESS_TOKEN, response.payload.accessToken)
            .then(() => {
              localforage
                .setItem(REFRESH_TOKEN, response.payload.refreshToken)
                .then(() => {
                  getCurrentUser().then(response => {
                    if (response.success) {
                      setCurrentUser(response.payload)
                    }
                  })
                  toast.success('Logged in successfully.', {
                    position: 'top-right'
                  })
                  setOpen(false)
                })
                .catch(error => {
                  toast.error('Failed to store refresh token.')
                })
            })
            .catch(error => {
              toast.error('Failed to store access token.')
            })
        }
      })
      .catch(error => {
        console.error('Error logging in', error)
      })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 pt-2'>
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder='Enter your email' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type='password'
                  placeholder='Enter your password'
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Password must be at least 8 characters.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className='w-full' type='submit'>
          Login
        </Button>
      </form>
      <a
        href={GOOGLE_AUTH_URL}
        className='bg-white border py-1 w-full rounded-xl flex justify-center items-center text-sm hover:scale-105 duration-300 '
      >
        <Image
          src='/google.webp'
          alt='AI'
          width={60}
          height={60}
          className='h-8 w-14 object-contain dark:invert'
        />
        <span className='text-base text-gray-600'>Login with Google</span>
      </a>
    </Form>
  )
}
