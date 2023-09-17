import type { Metadata } from 'next'
import { QrcodeProvider } from './QrcodeContext'
import QrcodeArea from './QrcodeArea'
import PanelArea from './PanelArea'
import type { PageProps } from '@/types/global'
import { getI18nMetaData } from '@/helper/getI18nMetaData'
import { getDictionary } from '@/dictionaries'

export async function generateMetadata({ params: { lang } }: PageProps): Promise<Metadata> {
  const i18nMeteData = await getI18nMetaData(lang, 'qrcode')

  return i18nMeteData
}

export default async function Page({ params: { lang } }: PageProps) {
  const dictionary = await getDictionary(lang)
  const copies = dictionary.qrcode

  return (
    <>
      <QrcodeProvider>
        <h1 className='hidden'>{copies.title}</h1>
        <div className='flex gap-4 items-start text-sm w-full max-md:flex-col max-md:items-stretch pb-6'>
          <div className='flex-[3_3_0%] overflow-hidden flex flex-col'>
            <PanelArea></PanelArea>
          </div>
          <div className='flex-1'>
            <QrcodeArea></QrcodeArea>
          </div>
        </div>
      </QrcodeProvider>
    </>
  )
}
