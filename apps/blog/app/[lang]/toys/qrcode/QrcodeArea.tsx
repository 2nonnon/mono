'use client'

import { useCallback, useRef } from 'react'
import { Icon } from '@iconify-icon/react'
import { useQrcodeOptions } from './QrcodeContext'
import { getFileHandle, saveDataToFile } from '@/utils/file'
import Qrcode from '@/components/Qrcode'
import { downloadByUrl } from '@/utils/downloadFile'

export default function () {
  const target = useRef<HTMLCanvasElement>(null)

  const options = useQrcodeOptions()

  const handleDownloadQrcode = useCallback(async () => {
    if (target.current) {
      try {
        const fileHandle = await getFileHandle({
          create: true,
          opts: {
            suggestedName: 'qrcode.png',
            types: [{
              description: 'Images',
              accept: {
                'image/png': ['.png'],
                'image/jpeg': ['.jpeg', '.jpg'],
                'image/webp': ['.webp'],
              },
            }],
            excludeAcceptAllOption: true,
          },
        }) as FileSystemFileHandle

        const file = await fileHandle.getFile()

        target.current.toBlob(async (blob) => {
          if (blob)
            saveDataToFile({ handle: fileHandle, opts: { type: 'write', data: blob } })
        },
        file.type,
        )
      }
      catch (e) {
        target.current.toBlob(async (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            await downloadByUrl({ url })
            URL.revokeObjectURL(url)
          }
        },
        )
      }
    }
  }, [])

  return (
    <>
      <div className='flex flex-col items-center gap-4'>
        <Qrcode {...options} ref={target}></Qrcode>

        <button className='flex surface-sm w-full items-center justify-center rounded-lg h-10 gap-2 text-base' onClick={handleDownloadQrcode}>
          <Icon icon="charm:download" />
          Download
        </button>
      </div>
    </>
  )
}
