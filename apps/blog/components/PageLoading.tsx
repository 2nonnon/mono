import type { CSSProperties } from 'react'
import { usePageLoading } from '@/hooks/usePageLoading'

interface PageLoadingProps {
  content: string
}

export default function PageLoading({ content }: PageLoadingProps) {
  const [pageLoading] = usePageLoading()
  return (
    <>
      {
        pageLoading
        && <section className={'z-[99] fixed top-0 left-0 right-0 bottom-0 backdrop-blur-md flex items-center justify-center'}>
          <div className='text-4xl font-extrabold text-[var(--text1)]'><span>{content} </span>{
            Array.from({ length: 3 }).map((_, i) => (<span className='inline-block animate-bounce' key={i} style={{ '--i': `${-i * 0.2}s` } as CSSProperties}>.</span>))
          }</div>
        </section>
      }
    </>
  )
}
