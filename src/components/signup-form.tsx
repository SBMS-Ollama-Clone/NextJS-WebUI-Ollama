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
import { getCurrentUser, login, signup } from '@/app/api/authentication'
import { toast } from 'sonner'
import localforage from 'localforage'
import { ACCESS_TOKEN, REFRESH_TOKEN } from '@/utils/constants'
import useAuthStore from '@/app/hooks/useAuthStore'

const formSchema = z.object({
  username: z.string().min(2, {
    message: 'Name must be at least 2 characters.'
  }),
  email: z.string().email({
    message: 'Invalid email address.'
  }),
  password: z.string().min(8, {
    message: 'Password must be at least 8 characters.'
  })
})

interface SignUpFormProps {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export default function SignUpForm({ setOpen }: SignUpFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      email: '',
      password: ''
    }
  })
  const { setCurrentUser } = useAuthStore()
  function onSubmit(values: z.infer<typeof formSchema>) {
    signup(values.email, values.username, values.password).then((response) => {
      if (response?.success) {
        setOpen(false)
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
                        if (response?.success) {
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
            toast.error('An error occurred. Please try again. ' + response.errors)
          })
      } else {
        toast.error('An error occurred. Please try again. ' + response.errors)
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 pt-2'>
        <FormField
          control={form.control}
          name='username'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder='Enter your name' {...field} />
              </FormControl>
              <FormDescription>
                This won&apos;t be public. It&apos;s just for you.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
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
          Sign Up
        </Button>
      </form>
    </Form>
  )
}
