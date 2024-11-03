'use client'

import * as React from 'react'
import { ChevronDownIcon, MoonIcon, SunIcon } from '@radix-ui/react-icons'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import useSettingStore from '@/app/hooks/useSettingStore'
import useAuthStore from '@/app/hooks/useAuthStore'
import { updateSetting } from '@/app/api/setting'
import { any } from 'zod'

export function ModeToggle () {
  const { setTheme, theme } = useTheme()
  const { setting, setSetting, fetchSetting } = useSettingStore()

  React.useEffect(() => {
    if (setting) {
      setTheme(setting.theme)
    }
    console.log(setting)
  }, [setting, setTheme])

  const handleThemeChanged = (theme: string) => {
    if (setting) {
      updateSetting({ id: setting?.id, theme }).then(response => {
        if (response.success) {
          setSetting(response.payload)
        }
      })
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' className='justify-start'>
          {theme === 'light' && (
            <div className='flex justify-between w-full scale-100 dark:scale-0'>
              <p>Light mode</p>
              <ChevronDownIcon className='w-5 h-5' />
            </div>
          )}
          {theme === 'dark' && (
            <div className=' flex justify-between w-full scale-0 dark:scale-100'>
              <p>Dark mode</p>
              <ChevronDownIcon className='w-5 h-5' />
            </div>
          )}
          <span className='sr-only'>Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='w-52'>
        <DropdownMenuItem onClick={() => handleThemeChanged('light')}>
          Light mode
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChanged('dark')}>
          Dark mode
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
