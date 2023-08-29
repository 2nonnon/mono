/**
 * 根据文件url获取文件名
 * @param url 文件url
 */
function getFileName(url) {
  const num = url.lastIndexOf('/') + 1
  let fileName = url.substring(num)
  // 把参数和文件名分割开
  fileName = decodeURI(fileName.split('?')[0])
  return fileName
}

/**
 * 根据文件地址下载文件
 * @param {*} sUrl
 */
export function downloadByUrl({
  url,
  target = '_self',
  fileName,
  type = 'file',
}: {
  url: string
  target?: '_self' | '_blank'
  fileName?: string
  type?: string
}): Promise<boolean> {
  // 是否同源
  // const isSameHost = new URL(url).host == location.host;
  // 下载文件类型
  return new Promise<boolean>((resolve, reject) => {
    // if (isSameHost) {
    if (type === 'file') {
      const link = document.createElement('a')
      link.href = url
      link.target = target

      if (link.download !== undefined)
        link.download = fileName || getFileName(url)

      // if (document.createEvent) {
      //   const e = document.createEvent('MouseEvents');
      //   e.initEvent('click', true, true);
      //   link.dispatchEvent(e);
      //   return resolve(true);
      // }

      // 好像直接这样就可以
      // link.click();

      // 替换废弃api —— initEvent
      if (MouseEvent) {
        const e = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
        })
        link.dispatchEvent(e)
        return resolve(true)
      }

      if (!url.includes('?'))
        url += '?download'

      window.open(url, target)
      return resolve(true)
    }
    else if (type === 'image') {
      const canvas = document.createElement('canvas')
      const img = document.createElement('img')
      img.setAttribute('crossOrigin', 'Anonymous')
      img.src = url
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        const context = canvas.getContext('2d')!
        context.drawImage(img, 0, 0, img.width, img.height)
        // window.navigator.msSaveBlob(canvas.msToBlob(),'image.jpg');
        // saveAs(imageDataUrl, '附件');
        canvas.toBlob((blob: any) => {
          const link = document.createElement('a')
          link.href = window.URL.createObjectURL(blob)
          link.download = getFileName(url)
          link.click()
          URL.revokeObjectURL(link.href)
          resolve(true)
        }, 'image/jpeg')
      }
      img.onerror = e => reject(e)
    }
  })
}
