import * as path from 'path'

import * as turf from '@turf/helpers'
import pointsWithinPolygon from '@turf/points-within-polygon'
import pointInPolygon from '@turf/boolean-point-in-polygon'
import xlsx from 'node-xlsx'
import { join } from 'desm'

import { writeJson, readJson } from './lib/fs.js'

const dataDirectory = join(import.meta.url, '..', 'data')
const sourceDataFile = path.join(dataDirectory, 'source', 'RRData.xlsx')
const targetGeojsonDataFile = path.join(dataDirectory, 'railroad-crossing-incidents.geojson')
const targetJsonDataFile = path.join(dataDirectory, 'railroad-crossing-incidents.json')
const unmatchedFeaturesFile = path.join(dataDirectory, 'unmatched-features.json')
const workSheetsFromFile = xlsx.parse(sourceDataFile)

const statesGeojson = await readJson(path.join(dataDirectory, 'us-states.geojson'))

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
console.log('geojson length', geojson.features.length)
// const filteredGeojson = pointsWithinPolygon(geojson, statesGeojson)
// console.log('filtered geojson length', filteredGeojson.features.length)l
const notMatched = []
const matchedGeojson = turf.featureCollection(geojson.features.filter((feature) => {
  return statesGeojson.features.find((state) => {
    if (pointInPolygon(feature, state) && state.properties.STUSPS === feature.properties.StateName) {
      return true
    } else {
      return false
    }
  })
}))
console.log('notMatched length', notMatched.length)
console.log('matched geojson length', matchedGeojson.features.length)
await writeJson(targetGeojsonDataFile, matchedGeojson)
// await writeJson(unmatchedFeaturesFile, notMatched)

// const json = geojson.features.map((feature) => {
//   return feature.properties
// })

// await writeJson(targetJsonDataFile, json)

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