'use client'

import type { ChangeEventHandler } from 'react'
import { useEffect, useRef, useState } from 'react'

// import NDialog from '@/components/Dialog'
import { Icon } from '@iconify-icon/react'
import style from './index.module.css'
import { imageCompress } from '@/utils/imageCompress'
import type { Dictionary } from '@/dictionaries'

interface NUploadProps {
  onUpload?: (file: File) => void
  children?: React.ReactNode
  accept?: string
}

function NUpload({ onUpload, children, accept }: NUploadProps) {
  return (<>
    <section className='flex select-none surface-sm rounded-md w-fit'>
      <label className='flex items-center py-2 px-4 gap-2 cursor-pointer'>
        <input type="file" name='file' accept={accept} className='hidden' onChange={(e) => {
          const file = (e.nativeEvent.target as HTMLInputElement).files![0]
          // console.log(file)
          onUpload?.(file)
        }}/>
        <Icon icon="uil:image-upload" className='text-xl' />
        {children}
      </label>
    </section>
  </>)
}

interface NCompareProps {
  topSrc?: string
  bottomSrc: string
}

function NCompare({ topSrc, bottomSrc }: NCompareProps) {
  const [range, setRange] = useState(0)
  const imgRef = useRef<HTMLImageElement>(null)
  const rangeRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (imgRef.current && rangeRef.current) {
      const { height } = imgRef.current.getBoundingClientRect()

      rangeRef.current.style.cssText = `--height: ${height}px;`
    }
  }, [imgRef.current, rangeRef.current])

  const handleChangeRange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setRange(+e.target.value)
  }

  const clipPath = `inset(0 0 0 ${range / 10}%)`

  return (<>
    <section ref={rangeRef} className='w-full relative'>
      <img className='w-full' src={bottomSrc} alt="" />
      {topSrc && <div style={{ clipPath }} className='absolute inset-0'><img ref={imgRef} className='w-full h-full' src={topSrc} alt="" /></div>}
      {topSrc && <input className={style.slider} type='range' min={0} max={1000} value={range} onChange={handleChangeRange}></input>}
    </section>
  </>)
}

async function getImageInfo(file: File) {
  const src = URL.createObjectURL(file)
  const img = new Image()
  img.src = src
  await new Promise((resolve) => {
    img.onload = resolve
  })
  return {
    name: file.name,
    size: file.size,
    width: img.naturalWidth,
    height: img.naturalHeight,
    src,
  }
}

interface ImageInfo {
  name: string
  size: number
  width: number
  height: number
  src: string
}

function ImagePage({ dictionary }: {
  dictionary: Dictionary }) {
  const copies = dictionary.image
  // const [show, setShow] = useState(false)
  const [origin, setOrigin] = useState<File | null>(null)
  const [originInfo, setOriginInfo] = useState<ImageInfo | null>(null)
  const [targetInfo, setTargetInfo] = useState<ImageInfo | null>(null)
  const [quality, setQuality] = useState(1)
  const [width, setWidth] = useState<number>(0)

  useEffect(() => {
    if (origin) {
      getImageInfo(origin).then((res) => {
        setOriginInfo(res)
      })
    }
    else {
      setOriginInfo(null)
    }
    setTargetInfo(null)
  }, [origin])

  return (
    <>
      <section className='max-w-screen-xl mx-auto w-full'>
        <div className='flex flex-col-reverse py-8 gap-6 md:flex-row'>
          <div className='surface-sm__inert flex-1 rounded-md self-start overflow-hidden w-full'>
            {originInfo
              ? <NCompare bottomSrc={originInfo.src} topSrc={targetInfo?.src}></NCompare>
              : <div className='w-full h-60 flex'><Icon className='m-auto text-9xl' icon="material-symbols:image-outline-rounded" /></div>}
          </div>
          <div className='flex flex-col gap-8 md:w-60'>
            <NUpload accept='image/png,image/jpeg,image/webp' onUpload={file => setOrigin(file)}><span>{copies.upload}</span></NUpload>
            {origin && <div className='surface-sm p-4 flex flex-col gap-2 pointer-events-none rounded-md'>
              <div><span>{copies.imgName}</span><span className='break-all'>{originInfo?.name}</span></div>
              <div><span>{copies.originSize}</span><span>{originInfo?.size}</span></div>
              <div><span>{copies.originWidth}</span><span>{originInfo?.width}</span></div>
              <div><span>{copies.originHeight}</span><span>{originInfo?.height}</span></div>
              <div><span>{copies.transSize}</span><span>{targetInfo?.size}</span></div>
              <div><span>{copies.transWidth}</span><span>{targetInfo?.width}</span></div>
              <div><span>{copies.transHeight}</span><span>{targetInfo?.height}</span></div>
            </div>}
            {origin && <div className='flex flex-col gap-3 p-4 surface-sm__inert'>
              <label className='flex gap-1'>
                <span className='whitespace-nowrap'>{copies.quality}</span>
                <input type="number" className='min-w-0' value={quality} onChange={e => setQuality(+e.target.value)} />
              </label>
              <label className='flex gap-1'>
                <span className='whitespace-nowrap'>{copies.width}</span>
                <input type="number" className='min-w-0' value={width} onChange={e => setWidth(+e.target.value)}/>
              </label>
              <button className='surface-sm p-1 rounded-md' onClick={async () => {
                const res = await imageCompress(origin, { quality, width })
                const info = await getImageInfo(res)
                setTargetInfo(info)
              }} aria-label="transform image">
                {copies.trans}
              </button>
            </div>}
            {origin && <div className='grid grid-cols-2 gap-3'>
              <button className='surface-sm p-1 rounded-md' onClick={() => {
                const link = document.createElement('a')
                link.href = targetInfo!.src
                link.download = targetInfo!.name
                link.click()
              }} aria-label="download image">
                {copies.download}
              </button>
              <button className='surface-sm p-1 rounded-md' onClick={() => {
                URL.revokeObjectURL(originInfo!.src)
                URL.revokeObjectURL(targetInfo!.src)
                setQuality(1)
                setWidth(0)
                setOrigin(null)
              }} aria-label="clear image">
                {copies.clear}
              </button>
            </div>}
          </div>
        </div>
      </section>
    </>
  )
}

export default ImagePage
