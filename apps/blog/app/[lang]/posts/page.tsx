import Link from 'next/link'
import type { Metadata } from 'next'
import { getCopies } from '@/dictionaries'
import { getSortedPostsData } from '@/lib/posts'
import type { PageProps } from '@/types/global'
import Date from '@/components/date'
import { getI18nMetaData } from '@/helper/getI18nMetaData'

export async function generateMetadata({ params: { lang } }: PageProps): Promise<Metadata> {
  const i18nMeteData = await getI18nMetaData(lang, 'posts')

  return i18nMeteData
}

export default async function Page({ params: { lang } }: PageProps) {
  const copies = await getCopies(lang, 'posts')

  const allPostsData = getSortedPostsData()

  return (
    <>
      <div className='max-w-screen-md mx-auto w-full'>
        <h1 className='text-4xl font-extrabold my-8'>{copies.pageTitle}</h1>
        <ul className='flex flex-col gap-4'>
          {allPostsData.map(({ id, date, title }) => (
            <li key={id} className="surface-md rounded-xl">
              <Link className='text-lg font-medium border-b-0 py-4 px-6 block' href={`/${lang}/posts/${id}`}>
                <p className='mt-0 mb-2'>{title}</p>
                <small className='opacity-80'>
                  <Date dateString={date} locale={lang} />
                </small>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
