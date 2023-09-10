import Link from 'next/link'
import type { Metadata } from 'next'
import style from './index.module.css'
import { getCopies } from '@/dictionaries'
import { getAllPostIds, getPostData } from '@/lib/posts'
import type { PageProps } from '@/types/global'
import Date from '@/components/date'
import { getI18nMetaData } from '@/helper/getI18nMetaData'

export async function generateMetadata({ params: { lang } }: PageProps): Promise<Metadata> {
  const i18nMeteData = await getI18nMetaData(lang, 'posts')

  return i18nMeteData
}

interface tagProps {
  tag: string
}

const Tag: React.FC<tagProps> = ({ tag }) => {
  return (
    <>
      <span className='inline-block px-3 border rounded-full surface-sm__inert'>{`#${tag}`}</span>
    </>
  )
}

export default async function Page({ params: { lang, id } }: PageProps) {
  const postData = await getPostData(id as string)
  const copies = await getCopies(lang, 'post')
  const tags = postData.tags ? postData.tags.split(' ') : []

  return (
    <>
      <div className='max-w-screen-lg mx-auto w-full'>
        <h1 className='text-4xl font-extrabold my-8'>{postData.title}</h1>
        <ul className='flex gap-3 list-none mb-4' role='list'>
          {tags.map(tag => <li key={tag}><Tag tag={tag}></Tag></li>)}
        </ul>
        <dl className='opacity-80 flex gap-x-4 gap-y-1 flex-wrap my-3'>
          <div className='flex gap-1'><dt>{copies.date}</dt><dd><Date dateString={postData.date} locale={lang} /></dd></div>
          <div className='flex gap-1'><dt>{copies.update}</dt><dd><Date dateString={postData.update} locale={lang} /></dd></div>
          <div className='flex gap-1'><dt>{copies.author}</dt><dd>{postData.author}</dd></div>
          {postData.translator ? <div className='flex gap-1'><dt>{copies.translator}</dt><dd>{postData.translator}</dd></div> : null}
        </dl>
        <div className={style.article} dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
        <nav className='my-8 opacity-80' aria-label='pagination'>
          {
            (postData.last || postData.next)
            && <div className='flex items-center justify-between mb-4 gap-2'>
              {postData.last ? <Link href={`/${lang}/${postData.last.id}`}>{`Last: ${postData.last.title}`}</Link> : <span></span>}
              {postData.next ? <Link href={`${lang}/${postData.next.id}`}>{`Next: ${postData.next.title}`}</Link> : <span></span>}
            </div>
          }
        </nav>
      </div>
    </>
  )
}

export async function generateStaticParams() {
  const defaultPaths = getAllPostIds()

  return defaultPaths.map(path => path.params)
}
