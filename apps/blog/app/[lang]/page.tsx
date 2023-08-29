import Image from 'next/image'
import type { Metadata } from 'next'
import { getCopies } from '@/dictionaries'
import type { PageProps } from '@/types/global'
import profileSrc from '@/public/images/profile.jpg'
import { getI18nMetaData } from '@/helper/getI18nMetaData'

export async function generateMetadata({ params: { lang } }: PageProps): Promise<Metadata> {
  const i18nMeteData = await getI18nMetaData(lang, 'home')

  return i18nMeteData
}

export default async function Page({ params: { lang } }: PageProps) {
  const name = '2nonnon'
  const copies = await getCopies(lang, 'home')
  return (
    <>
      <section className='max-w-screen-md mx-auto'>
        <div className='flex flex-col items-center gap-4 mt-10'>
          <Image
            priority
            className='rounded-full border-2 w-[7rem] h-[7rem]'
            src={profileSrc}
            height={144}
            width={144}
            alt={name}
          />
          <h1 className='text-4xl font-extrabold my-0'>{name}</h1>
          <p className='text-center my-0'>{copies.introduce}</p>
        </div>
      </section>
    </>
  )
}
