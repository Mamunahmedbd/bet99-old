import { existsSync, readFileSync } from 'fs'
import path from 'path'

export const checkMaintenance = () => {
  const filePath = path.join(__dirname, '../../', 'public/maintenance.json')
  if (existsSync(filePath)) {
    const file = readFileSync(filePath, {
      encoding: 'utf8',
      flag: 'r',
    })
    if (file) {
      const message = JSON.parse(file)
      return message
    }
  }
  return null
}
