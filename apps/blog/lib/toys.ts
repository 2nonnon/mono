import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const toysDirectory = path.join(process.cwd(), 'app/[lang]/toys')

export function getAllToysPath() {
  const fileNames = fs.readdirSync(toysDirectory)
  return fileNames.filter(name => !name.includes('.'))
}
