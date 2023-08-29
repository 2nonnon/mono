import type { Metadata } from 'next'
import Content from './index'
import type { PageProps } from '@/types/global'
import { getI18nMetaData } from '@/helper/getI18nMetaData'

export async function generateMetadata({ params: { lang } }: PageProps): Promise<Metadata> {
  const i18nMeteData = await getI18nMetaData(lang, 'audio')

  return i18nMeteData
}

export default async function Page() {
  return <Content></Content>
}
