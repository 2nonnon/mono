import Layout from '@/components/layout'
import { getDictionary } from '@/dictionaries'
import { i18n } from '@/i18n-config'
import '@/styles/index.css'
import type { IParams } from '@/types/global'

export async function generateStaticParams() {
  return i18n.locales.map(locale => ({ lang: locale }))
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: IParams
}) {
  const dictionary = await getDictionary(params.lang)
  return (
    <html lang={params.lang}>
      <body>
        <Layout dictionary={dictionary} locale={params.lang}>{children}</Layout>
      </body>
    </html>
  )
}
