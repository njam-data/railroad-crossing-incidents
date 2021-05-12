<script>
  import { onMount, setContext } from 'svelte'
  import { mapKey, mapboxKey } from '$lib/keys.js'
  import { njMapState } from '$lib/stores.js'

  let container
  let map
  let mapbox
  let selectedFeature = null
  let properties

  const excludeProperties = [
    'id',
    'CrossingID',
    'Total Killed',
    'Total injured',
    'Number of accidents',
    'Latitude',
    'Longitude',
    'Street',
    'CityName',
    'CountyName',
    'StateName'
  ]

  const labels = {
    CountyName: 'County',
    CityName: 'City',

  }

  $: if (selectedFeature) {
    console.log('well hey there', Object.keys(selectedFeature.properties).length)
    properties = Object.keys(selectedFeature.properties)
      .filter((key) => {
        const exclude = excludeProperties.find((prop) => {
          return prop.includes(key)
        })
        return !exclude
      })
      .map((key) => {
        return {
          key,
          value: selectedFeature.properties[key]
        }
      })
    console.log('properties', properties, properties.length)
  }

  setContext(mapKey, {
    getMap: () => map
  })

  setContext(mapboxKey, {
    getMapbox: () => mapbox
  })

  onMount(async () => {
    mapbox = window.mapboxgl
    mapbox.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN

    map = new mapbox.Map({
      container,
      style: 'mapbox://styles/mapbox/light-v10',
      center: $njMapState.lngLat,
      zoom: $njMapState.zoom,
      minZoom: 5,
      maxZoom: 20
    })

    map.on('load', () => {
      map.resize()

      map.addSource('railroad_crossing_incidents', {
        type: 'vector',
        tiles: ['https://njam-tiles.s3.amazonaws.com/railroad-crossing-incidents/{z}/{x}/{y}.pbf']
      })

      map.addLayer({
        id: 'railroad_crossing_incidents',
        type: 'circle',
        source: 'railroad_crossing_incidents',
        'source-layer': 'railroad_crossing_incidents',
        'layout': {},
        'paint': {
          'circle-radius': [
            'case',
            ['has', 'sqrt_point_count'],
            ['-', ['get', 'sqrt_point_count'], 10],
            5
          ],
          'circle-color': 'red'
        }
      })
    })

    let popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false
    })

    map.on('mouseenter', 'railroad_crossing_incidents', function (e) {
      map.getCanvas().style.cursor = 'pointer';
      const feature = e.features[0]
      const properties = feature.properties
      const geometry = feature.geometry
      const coordinates = geometry.coordinates.slice();
      
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      if (properties.point_count && properties.point_count >- 2) {
        const description = `${properties.point_count} locations`
        popup.setLngLat(coordinates).setHTML(description).addTo(map)
      }
    })

    map.on('mouseleave', 'railroad_crossing_incidents', function () {
      map.getCanvas().style.cursor = ''
      popup.remove()
    })

    map.on('click', 'railroad_crossing_incidents', async function (e) {
      const feature = e.features[0]
      const { point_count } = feature.properties

      if (point_count) {
        const zoom = map.getZoom() + 2
        map.flyTo({
          center: feature.geometry.coordinates,
          zoom
        })
        selectedFeature = null
      } else {
        selectedFeature = e.features[0]
      }
    })

    return () => {
      map = null
    }
  })
</script>

<div bind:this={container} class="flex-grow z-0 h-full">
  {#if map}
    <slot></slot>
  {/if}

  {#if selectedFeature}
  <div class="bg-white shadow overflow-hidden sm:rounded-lg absolute right-0 mt-4 mr-4 w-1/2 lg:w-1/3 z-10 pb-2">
    <div class="px-4 py-4 sm:px-6">
      <h3 class="text-lg leading-6 font-medium text-gray-900">
        {selectedFeature.properties.Street}
      </h3>
      <h3 class="text-md leading-6 font-medium text-gray-600 mb-2">
        {selectedFeature.properties.CityName}, {selectedFeature.properties.CountyName}, {selectedFeature.properties.StateName}
      </h3>
      <p class="font-bold my-0 py0 max-w-2xl text-sm text-gray-600">
        {selectedFeature.properties['Number of accidents']} Accidents
      </p>
      <p class="font-bold my-0 py0 max-w-2xl text-sm text-gray-600">
        {selectedFeature.properties['Total Killed']} Killed
      </p>
      <p class="font-bold my-0 py0 max-w-2xl text-sm text-gray-600">
        {selectedFeature.properties['Total injured']} Injured
      </p>
    </div>

    <div class="border-t border-gray-200 px-4 py-2 sm:py-4 sm:p-0">
      <dl class="divide-y divide-gray-200">
        {#if properties}
        {#each properties as prop}
        <div class="py-1 sm:py-2 grid grid-cols-2 gap-2 sm:px-6">
          <dt class="text-sm font-medium text-gray-500">
            {prop.key}
          </dt>
          <dd class="text-sm text-gray-900 mt-0 col-span-1">
            {prop.value}
          </dd>
        </div>
        {/each}
        {/if}
      </dl>
    </div>
  </div>
  {/if}
</div>
