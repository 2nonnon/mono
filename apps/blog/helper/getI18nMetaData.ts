import type { Metadata } from 'next'
import type { Dictionary } from '@/dictionaries'
import { getCopies } from '@/dictionaries'
import type { LocaleType } from '@/i18n-config'

export async function getI18nMetaData<K extends keyof Dictionary>(locale: LocaleType, key: K): Promise<Metadata> {
  const copies = await getCopies(locale, key)

  const metadata: Metadata = {}

  if ('title' in copies)
    metadata.title = copies.title

  if ('description' in copies)
    metadata.description = copies.description

  return metadata
}
