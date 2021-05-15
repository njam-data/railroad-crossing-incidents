<script>
  import { onMount, createEventDispatcher } from 'svelte'

  import { statesToCodes } from '$lib/state-codes.js'
  import { clickOutside } from '$lib/click-outside.js'
  import CheckIcon from '$components/icons/check.svelte'
  import QuestionIcon from '$components/icons/question.svelte'
  import XIcon from '$components/icons/x.svelte'

  export let rows

  let filters = []
  let sort = {
    column: null,
    order: null
  }
  let menu = {
    open: null
  }

  $: console.log('sort', sort)

  const columns = rows[0].map((row) => {
    return row.key
  })

  const dispatch = createEventDispatcher()

  onMount(() => {
    const mapbox = window.mapboxgl
    mapbox.accessToken = 'pk.eyJ1Ijoic2xkYXRhdGVhbSIsImEiOiJuR1ZmQ01vIn0.zyEdsIKM-4orPm-3Y0XWDQ';

    const geocoder = new MapboxGeocoder({
      accessToken: mapbox.accessToken,
      types: 'region,district,place'
    })
  
    geocoder.addTo('#geocoder')

    geocoder.on('result', ({ result }) => {
      const feature = result
      const { place_name, place_type } = feature
      const sections = place_name.split(', ')
      const placeType = place_type[0]

      if (placeType === 'place') {
        filters.push({
          column: 'CityName',
          value: sections[0]
        })

        filters.push({
          column: 'StateName',
          value: statesToCodes[sections[1]]
        })
      } else if (placeType === 'district') {
        filters.push({
          column: 'CountyName',
          value: sections[0].replace(' County', '').toLowerCase()
        })

        filters.push({
          column: 'StateName',
          value: statesToCodes[sections[1]]
        })
      } else if (placeType === 'region') {
        filters.push({
          column: 'StateName',
          value: statesToCodes[sections[0]]
        })
      }

      dispatch('query', {
        sort,
        filters
      })
    })
  })

  function onMenuClick (column) {
    if (menu.open === column) {
      menu.open = null
    } else {
      setTimeout(() => {
        menu.open = column
      }, 2)
    }
  }

  function onOutsideMenuClick (column, e) {
    console.log('e', e.detail)
    if (menu.open === column) {
      setTimeout(() => {
        menu.open = null
      }, 1)
    }

    menu.open = column
  }

  function onSort (column, order) {
    sort = {
      column,
      order
    }

    dispatch('query', {
      sort,
      filters
    })
  }

  function onRemoveSort (column) {
    sort = {
      column: null,
      order: null
    }

    dispatch('query', {
      sort,
      filters
    })
  }

  function onNextPage (value) {
    dispatch('nextPage')
  }

  function onRowClick (value) {
    console.log('huh')
    dispatch('viewLocation', value)
  }
</script>

<div class="flex flex-col h-full overflow-scroll bg-gray-50">
  <div class="w-full h-96 p-2">
    <div class="">
      <div id="geocoder"></div>
    </div>
  </div>

  <div class="">
    <div class="align-middle inline-block min-w-full">
      <div class="shadow border-b border-t border-gray-200 sm:rounded-md">
        <table class="min-w-full divide-y divide-gray-200 bg-white">
          <thead class="bg-gray-50">
            <tr class="divide-x divide-gray-200">
              {#each columns as column}
                <th
                  scope="col"
                  class="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                >
                  <div class="flex flex-row ">
                    <span>{column}</span>
                    {#if column !== 'Map view'}
                    <div class="relative inline-block text-left right-0 top-0 ml-4 self-center">
                      <div>
                        <button on:click={() => { onMenuClick(column) }} type="button" class="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm p-1 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500" id="menu-button" aria-expanded="true" aria-haspopup="true">
                          <svg class="h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                          </svg>
                        </button>
                      </div>

                      {#if menu.open && menu.open === column}
                      <div use:clickOutside on:click_outside={(e) => { onOutsideMenuClick(column, e) }} class="origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow bg-white ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="menu-button" tabindex="-1">
                        <div class="" role="none">
                          <!-- Active: "bg-gray-100 text-gray-900", Not Active: "text-gray-700" -->
                          <button type="button" on:click={() => onSort(column, 'ASC')} class="text-gray-700 hover:text-gray-900 hover:bg-gray-100 block px-2 py-2 text-xs" role="menuitem" tabindex="-1" id="menu-item-0">
                            <span class="inline-block w-3 h-3">
                              {#if sort.column === column && sort.order === 'ASC'}
                              ✓
                              {/if}
                            </span>
                            Sort Ascending
                          </button>
                          <button type="button" on:click={() => onSort(column, 'DESC')} class="text-gray-700 hover:text-gray-900 hover:bg-gray-100 block px-2 py-2 text-xs" role="menuitem" tabindex="-1" id="menu-item-1">
                            <span class="inline-block w-3 h-3">
                              {#if sort.column === column && sort.order === 'DESC'}
                              ✓
                              {/if}
                            </span>
                            Sort Descending
                          </button>
                          <button type="button" on:click={() => onRemoveSort(column)} class="text-gray-700 hover:text-gray-900 hover:bg-gray-100 block px-2 py-2 text-xs" role="menuitem" tabindex="-1" id="menu-item-2">
                            <span class="inline-block w-3 h-3">𐄂</span>
                            Remove Sort
                          </button>
                        </div>
                      </div>
                      {/if}
                    </div>
                    {/if}
                  </div>
                </th>
              {/each}
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            {#each rows as row}
              <tr>
                {#each row as cell}
                  <td class="px-12 py-4 text-left whitespace-nowrap text-sm font-medium text-gray-900">
                    {#if cell.key === 'Map view'}
                      <button on:click={() => {
                        onRowClick(cell.value)
                      }} class="text-gray-600 hover:text-blue-600 hover:shadow-sm bg-gray-50 hover:bg-gray-100 p-2">View on map</button>
                    {:else if cell.key === 'Meets minimum safety guidelines'}
                      {#if cell.value === 'Yes'}
                        <CheckIcon /> Yes
                      {:else if cell.value === 'No'}
                        <XIcon /> No
                      {:else}
                        <QuestionIcon /> Info unavailable
                      {/if}
                    {:else}
                    {cell.value}
                    {/if}
                  </td>
                {/each}
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>
