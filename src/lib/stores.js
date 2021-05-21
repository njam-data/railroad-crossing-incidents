import { writable } from 'svelte/store'

export const njMapState = writable({
  zoom: 7.5,
  lngLat: ['-74.558333', '40.16']
})

export const usMapState = writable({
  zoom: 2,
  lngLat: ['-98.5556', '39.8097']
})

export const listHelpOpen = writable(true)
