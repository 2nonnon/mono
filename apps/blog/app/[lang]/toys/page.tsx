import Link from 'next/link'
import { Icon } from '@iconify-icon/react'
import type { Metadata } from 'next'
import { getCopies } from '@/dictionaries'
import type { PageProps } from '@/types/global'
import { getI18nMetaData } from '@/helper/getI18nMetaData'

export async function generateMetadata({ params: { lang } }: PageProps): Promise<Metadata> {
  const i18nMeteData = await getI18nMetaData(lang, 'toy')

  return i18nMeteData
}

export default async function Page({ params: { lang } }: PageProps) {
  const copies = await getCopies(lang, 'toy')

  const toys = [
    {
      name: copies.qrcode,
      icon: 'heroicons-outline:qrcode',
      link: 'https://qrcode.non.fan',
    },
    {
      name: copies.mine,
      icon: 'game-icons:land-mine',
      link: 'https://minesweeper.non.fan',
    },
    {
      name: copies.color,
      icon: 'ic:outline-color-lens',
      link: 'https://color.non.fan',
    },
    {
      name: copies.image,
      icon: 'material-symbols:image-outline-rounded',
      link: 'https://img.non.fan',
    },
  ]

  return (
    <>
      <div className='max-w-screen-lg mx-auto w-full'>
        <div className='grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] place-items-stretch gap-6 my-10'>
          {toys.map(item => (
            <Link key={item.link} className='surface-md bg-[var(--surface1)] rounded-lg text-lg font-medium flex flex-col items-center gap-2 py-4 px-6 h-full text-center' href={item.link} target='_blank'>
              <Icon className='text-[7rem]' icon={item.icon} />
              <p className='m-0'>{item.name}</p>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
