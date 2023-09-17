import { Icon } from '@iconify-icon/react'
import type { LinkProps } from 'next/link'
import Link from 'next/link'
import { memo } from 'react'

export type IconLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & LinkProps & {
  name: string
  icon: string
}

export default memo(({ name, title, href, icon, locale, target = '_self' }: IconLinkProps) => {
  return (
    <Link href={href} title={title} className="flex surface-sm hover:no-underline p-1 rounded md:px-3" locale={locale} target={target}>
      <p className='hidden md:inline-block m-0'>{name}</p>
      <Icon className='md:hidden' width={30} height={30} icon={icon} alt={name} name={name} />
    </Link>
  )
})
