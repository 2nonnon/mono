type GetFileHandleOptions =
  | {
    create: false
    opts?: OpenFilePickerOptions
  }
  | {
    create: true
    opts?: SaveFilePickerOptions
  }

export async function getFileHandle({ create, opts }: GetFileHandleOptions) {
  if (create) {
    const handle = await window.showSaveFilePicker(opts)

    return handle
  }
  else {
    const handles = await window.showOpenFilePicker(opts)

    return opts?.multiple ? handles : handles[0]
  }
}

export async function getDirectorHandle(opts: DirectoryPickerOptions) {
  const handle = await window.showDirectoryPicker(opts)

  return handle
}

export async function getAllSubsOfDir(handle: FileSystemDirectoryHandle) {
  const subs: { name: string; handle: FileSystemDirectoryHandle | FileSystemFileHandle }[] = []

  for await (const [key, value] of handle.entries())
    subs.push({ name: key, handle: value })

  return subs
}

type SaveDataToFileOptions = {
  handle: FileSystemFileHandle
  opts: WriteParams | WriteParams[]
} & FileSystemCreateWritableOptions

export async function saveDataToFile({ handle, opts, keepExistingData }: SaveDataToFileOptions) {
  const writableStream = await handle.createWritable({ keepExistingData })

  if (Array.isArray(opts)) {
    for (const opt of opts)
      await writableStream.write(opt)
  }
  else {
    await writableStream.write(opts)
  }

  try {
    await writableStream.close()
    return true
  }
  catch (e) {
    return false
  }
}

export async function readFileAsDataURL(source: Blob | File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(source)
  })
}

export function getBase64StringFromDataURL(dataURL: string) {
  const regex = /^data:(?:[A-Za-z-+\/]+);base64,(.+)$/
  const result = dataURL.match(regex)
  return result ? result[1] : dataURL
}
