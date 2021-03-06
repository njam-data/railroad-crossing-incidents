import * as path from 'path'

import { join } from 'desm'
import { featureCollection } from '@turf/helpers'

import { getCounties } from '@njam-data/new-jersey-counties'
import { getMunicipalities } from '@njam-data/new-jersey-municipalities'

import { readJson, writeJson } from './lib/fs.js'

const dataDirectory = join(import.meta.url, '..', 'data')
const jsonDataFile = path.join(dataDirectory, 'railroad-crossing-incidents.json')
const statesTargetFilepath = path.join(dataDirectory, 'state-totals.geojson')
const njCountiesTargetFilepath = path.join(dataDirectory, 'nj-county-totals.geojson')
const njMunicipalitiesTargetFilepath = path.join(dataDirectory, 'nj-municipality-totals.geojson')

const states = await readJson(path.join(dataDirectory, 'us-states.geojson'))
const counties = await getCounties('geojson')
const municipalities = await getMunicipalities('geojson')

const stateTotals = {}
const njCountyTotals = {}
const njMunicipalityTotals = {}

const json = await readJson(jsonDataFile)

for (const incident of json) {
  const state = incident.StateName
  const county = incident.CountyName
  const municipality = incident.CityName
  const accidents = incident['Number of accidents']
  const killed = incident['Total Killed']
  const injured = incident['Total injured']

  if (!stateTotals[state]) {
    stateTotals[state] = {
      accidents: 0,
      killed: 0,
      injured: 0
    }
  }

  stateTotals[state].accidents += accidents
  stateTotals[state].killed += killed
  stateTotals[state].injured += injured

  if (state === 'NJ') {
    if (!njCountyTotals[county]) {
      njCountyTotals[county] = {
        accidents: 0,
        killed: 0,
        injured: 0
      }
    }

    njCountyTotals[county].accidents += accidents
    njCountyTotals[county].killed += killed
    njCountyTotals[county].injured += injured

    if (!njMunicipalityTotals[municipality]) {
      njMunicipalityTotals[municipality] = {
        accidents: 0,
        killed: 0,
        injured: 0
      }
    }

    njMunicipalityTotals[municipality].accidents += accidents
    njMunicipalityTotals[municipality].killed += killed
    njMunicipalityTotals[municipality].injured += injured
  }
}

const statesGeojson = featureCollection(objectToArray(stateTotals).map((state, i) => {
  const feature = states.features.find((feature) => {
    return state.name === feature.properties.STUSPS
  })

  if (!feature) {
    return
  }

  feature.properties = {
    ...state,
    name: feature.properties.NAME
  }

  feature.id = i
  return feature
}))

const countiesGeojson = featureCollection(objectToArray(njCountyTotals).map((county, i) => {
  const feature = counties.features.find((feature) => {
    return county.name === feature.properties.county
  })

  feature.properties = {
    ...county,
    name: feature.properties.county_label
  }

  feature.id = i
  return feature
}))

const municipalitiesGeojson = featureCollection(municipalities.features.map((feature, i) => {
  const municipalityKey = Object.keys(njMunicipalityTotals).sort().find((key) => {
    return feature.mun && feature.mun.includes(key)
  })

  if (municipalityKey) {
    feature.properties = {
      ...njMunicipalityTotals[municipalityKey],
      name: feature.properties.mun_label
    }
  } else {
    feature.properties = {
      name: feature.properties.name,
      accidents: 0,
      killed: 0,
      injuries: 0
    }
  }

  feature.id = i
  return feature
}))

await writeJson(statesTargetFilepath, statesGeojson)
await writeJson(njCountiesTargetFilepath, countiesGeojson)
await writeJson(njMunicipalitiesTargetFilepath,??municipalitiesGeojson)

function objectToArray (obj) {
  const keys = Object.keys(obj)

  return keys.map((key) => {
    const row = obj[key]
    row.name = key
    return row
  })
}
