import fs from 'fs'
import path from 'path'

const toysDirectory = path.join(process.cwd(), 'app/[lang]/toys')

export function getAllToysPath() {
  const fileNames = fs.readdirSync(toysDirectory)
  return fileNames.filter(name => !name.includes('.'))
}
