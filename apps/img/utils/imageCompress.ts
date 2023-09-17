export type ImageType = 'image/png' | 'image/jpeg' | 'image/webp'

interface CompressOptions {
  quality?: number
  width?: number
}

export async function imageCompress(source: File, { quality = 0.25, width }: CompressOptions) {
  if (source.type !== 'image/png' && source.type !== 'image/jpeg' && source.type !== 'image/webp')
    throw new Error('TypeError: file type should be \'image/png\' | \'image/jpeg\' | \'image/webp\'.')

  if (quality < 0.1 || quality > 1)
    throw new Error('RangeError: quality should be [0.1, 1] and has two decimal places at most.')

  const src = URL.createObjectURL(source)
  const type = source.type as ImageType
  const name = source.name
  const img = new Image()
  img.src = src
  await new Promise((resolve) => {
    img.onload = resolve
  })
  const canvas = document.createElement('canvas')
  let naturalWidth = img.naturalWidth
  let naturalHeight = img.naturalHeight
  if (width) {
    const multi = naturalWidth / width
    naturalWidth = Math.round(naturalWidth / multi)
    naturalHeight = Math.round(naturalHeight / multi)
  }
  canvas.width = naturalWidth
  canvas.height = naturalHeight
  const context = canvas.getContext('2d')
  context?.drawImage(img, 0, 0, naturalWidth, naturalHeight)
  const result = await new Promise<File>((resolve) => {
    canvas.toBlob(
      (blob) => {
        const file = new File([blob!], name, { type })
        resolve(file)
        // const link = document.createElement('a');
        // link.href = URL.createObjectURL(file);
        // link.download = file.name;
        // link.click();
        // URL.revokeObjectURL(link.href);
      },
      type,
      quality,
    )
  })
  return result
}
