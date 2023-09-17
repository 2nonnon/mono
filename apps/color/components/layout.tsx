import React from 'react'

import { Inter } from 'next/font/google'

// import PageLoading from './PageLoading'
import ScrollTop from './ScrollTop'
import DayAndNight from './DayAndNight'
import ToggleLocale from './toggleLocale'
import type { IconLinkProps } from './IconLink'
import IconLink from './IconLink'
import type { Dictionary, LocaleType } from '@/dictionaries'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export default function Layout({ children, dictionary, locale }: {
  children: React.ReactNode
  dictionary: Dictionary
  locale: LocaleType
}) {
  const currentLocale = locale
  const preUrl = currentLocale === 'en' ? '/' : `/${currentLocale}/`

  const copies = dictionary.layout

  const home = {
    title: copies.logo,
    name: copies.logo,
    href: preUrl,
    icon: 'material-symbols:home-outline-rounded',
  }

  const links: IconLinkProps[] = [
    {
      title: 'Github',
      name: 'Github',
      href: 'https://github.com/2nonnon',
      icon: 'mingcute:github-line',
      target: '_blank',
    },
  ]

  return (
    <>
      <div className={`min-h-screen text-[var(--text2)] -z-20 flex flex-col ${inter.variable} font-sans`}>
        <header className='flex items-center justify-between h-20 px-6 box-border max-w-screen-xl mx-auto w-full'>
          <IconLink {...home}></IconLink>
          <nav className='flex items-center gap-4' aria-label={copies.globalNav}>
            <ToggleLocale dictionary={dictionary} locale={locale}></ToggleLocale>
            {links.map(item => (<IconLink key={item.name} {...item}></IconLink>))}
            <DayAndNight></DayAndNight>
          </nav>
        </header>
        <main className='px-6 max-w-screen-xl box-border w-full mx-auto overflow-hidden flex-1 flex flex-col'>
          {children}
        </main>
        <ScrollTop content={copies.toTop}></ScrollTop>
      </div>
    </>
  )
}
