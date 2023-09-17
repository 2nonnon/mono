'use client'

import { Icon } from '@iconify-icon/react'
import { useScrollTop } from '@/hooks/useScrollTop'

interface ScrollTopProps {
  content: string
}

export default function ScrollTop({ content }: ScrollTopProps) {
  const scrollTop = useScrollTop()

  return (
    <>
      {
        scrollTop > 2333
        && <a href='#' title={content} className={'z-[9] fixed right-2 bottom-12 flex items-center justify-center w-12 h-12 rounded-full surface-sm text-3xl cursor-pointer'}>
          <Icon icon="material-symbols:keyboard-double-arrow-up-rounded" name={content} alt={content} />
        </a>
      }
    </>
  )
}
