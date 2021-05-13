<script>
  import { createEventDispatcher } from 'svelte'

  import CheckIcon from '$components/icons/check.svelte'
  import QuestionIcon from '$components/icons/question.svelte'
  import XIcon from '$components/icons/x.svelte'

  export let rows
  const columns = rows[0].map((row) => {
    return row.key
  })

  const dispatch = createEventDispatcher()

  function onFilter (filters) {
    dispatch('filter', filters)
  }

  let ascending = true
  function onSort (column) {
    dispatch('sort', {
      column,
      direction: !!ascending
    })
  }

  function onSearch (value) {
    dispatch('search', {
      value
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

<div class="flex flex-col h-full overflow-scroll">
  <div class="">
    <div class="align-middle inline-block min-w-full">
      <div class="shadow border-b border-gray-200 sm:rounded-lg">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              {#each columns as column}
                <th
                  scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                  on:click={() => { onSort(column) }}
                >
                  {column}
                </th>
              {/each}
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            {#each rows as row}
              <tr>
                {#each row as cell}
                  <td class="px-6 py-4 text-left whitespace-nowrap text-sm font-medium text-gray-900">
                    {#if cell.key === 'Map view'}
                      <button on:click={() => {
                        console.log('what')
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
