import type { CSSProperties } from 'react'

export default function Loading() {
  return (
    <>
      <section className={'z-[99] fixed top-0 left-0 right-0 bottom-0 backdrop-blur-md flex items-center justify-center'}>
        <div className='text-4xl font-extrabold text-[var(--text1)]'><span>Loading</span>{
          Array.from({ length: 3 }).map((_, i) => (<span className='inline-block animate-bounce' key={i} style={{ '--i': `${-i * 0.2}s` } as CSSProperties}>.</span>))
        }</div>
      </section>
    </>
  )
}
