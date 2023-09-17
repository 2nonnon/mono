import type { Metadata } from 'next'
import Content from './index'
import type { PageProps } from '@/types/global'
import { getI18nMetaData } from '@/helper/getI18nMetaData'
import { getDictionary } from '@/dictionaries'

export async function generateMetadata({ params: { lang } }: PageProps): Promise<Metadata> {
  const i18nMeteData = await getI18nMetaData(lang, 'minesweeper')

  return i18nMeteData
}

export default async function Page({ params: { lang } }: PageProps) {
  const dictionary = await getDictionary(lang)
  return <Content dictionary={dictionary}></Content>
}
