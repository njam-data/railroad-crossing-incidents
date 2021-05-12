import * as path from 'path'

import * as turf from '@turf/helpers'
import xlsx from 'node-xlsx'
import { join } from 'desm'

import { writeJson } from './lib/fs.js'

const dataDirectory = join(import.meta.url, '..', 'data')
const sourceDataFile = path.join(dataDirectory, 'source', 'RRData.xlsx')
const targetGeojsonDataFile = path.join(dataDirectory, 'railroad-crossing-incidents.geojson')
const targetJsonDataFile = path.join(dataDirectory, 'railroad-crossing-incidents.json')
const workSheetsFromFile = xlsx.parse(sourceDataFile)

const [worksheet] = workSheetsFromFile
const headers = worksheet.data.shift()

const errors = []
const data = worksheet.data.map((row, rowIndex) => {
  const objRow = row.reduce((obj, cell, i) => {
    obj[headers[i]] = cell
    return obj
  }, {})

  if (!objRow.Longitude || !objRow.Latitude) {
    console.log('error!', objRow)
    errors.push({
      error: 'coordinates missing',
      data: objRow
    })
    return null
  }

  objRow.id = rowIndex

  try {
    const point = turf.point(
      [
        objRow.Longitude,
        objRow.Latitude
      ],
      objRow,
      { id: objRow.id }
    )

    return point
  } catch (e) {
    console.log('error!', objRow)
    errors.push({
      error: 'coordinates malformed',
      data: objRow
    })
    return null
  }
}).filter((row) => {
  return (row !== null)
})

const geojson = turf.featureCollection(data)
await writeJson(targetGeojsonDataFile, geojson)

const json = geojson.features.map((feature) => {
  return feature.properties
})

await writeJson(targetJsonDataFile, json)

console.log(errors.length, 'errors')

const missing = errors.filter((error) => {
  return error.type === 'coordinates missing'
})

const malformed = errors.filter((error) => {
  return error.type === 'coordinates malformed'
})

console.log('rows with missing coordinates', missing.length)
console.log('rows with malformed coordinates', malformed.length)

const totalDeadMissingCoordinates = errors.reduce((total, error) => {
  total += error.data['Total Killed']
  return total
}, 0)

const totalInjuriesMissingCoordinates = errors.reduce((total, error) => {
  total += error.data['Total injured']
  return total
}, 0)

const totalAccidentsMissingCoordinates = errors.reduce((total, error) => {
  total += error.data['Number of accidents']
  return total
}, 0)

console.log('deaths missing coordinates', totalDeadMissingCoordinates)
console.log('injuries missing coordinates', totalInjuriesMissingCoordinates)
console.log('accidents missing coordinates', totalAccidentsMissingCoordinates)

const totalDead = data.reduce((total, row) => {
  total += row.properties['Total Killed']
  return total
}, 0)

const totalInjuries = data.reduce((total, row) => {
  total += row.properties['Total injured']
  return total
}, 0)

const totalAccidents = data.reduce((total, row) => {
  total += row.properties['Number of accidents']
  return total
}, 0)

console.log('deaths', totalDead)
console.log('injuries', totalInjuries)
console.log('accidents', totalAccidents)
