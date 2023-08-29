import { format, parseISO } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import type { LocaleType } from '@/dictionaries'

export default function Date({ dateString, locale }: { dateString: string; locale: LocaleType }) {
  const date = parseISO(dateString)
  return <time dateTime={dateString}>{locale === 'en' ? format(date, 'LLLL d, yyyy') : format(date, 'yyyy 年 M 月 d 日', { locale: zhCN })}</time>
}
