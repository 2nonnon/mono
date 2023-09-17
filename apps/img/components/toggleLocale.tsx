'use client'

import React from 'react'

import { usePathname } from 'next/navigation'

import type { IconLinkProps } from './IconLink'
import IconLink from './IconLink'
import type { Dictionary, LocaleType } from '@/dictionaries'

export default function ToggleLocale({ dictionary, locale }: {
  dictionary: Dictionary
  locale: LocaleType
}) {
  const pathName = usePathname()
  const redirectedPathName = (locale: string) => {
    if (!pathName)
      return '/'
    const segments = pathName.split('/')
    segments[1] = locale
    return segments.join('/')
  }

  const currentLocale = locale
  const nextLocale = currentLocale === 'en' ? 'zh' : 'en'
  const copies = dictionary.layout

  const link: IconLinkProps
    = {
      title: copies.lang,
      name: copies.lang,
      href: redirectedPathName(nextLocale),
      icon: currentLocale === 'en' ? 'icon-park-outline:eagle' : 'icon-park-outline:rabbit',
    }

  return (
    <>
      <IconLink {...link}></IconLink>
    </>
  )
}
