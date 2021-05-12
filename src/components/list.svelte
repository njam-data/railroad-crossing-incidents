<script>
  export let rows
  export let columns

	let sortBy = {col: "id", ascending: true};

	$: sort = (column) => {
		if (sortBy.col == column) {
			sortBy.ascending = !sortBy.ascending
		} else {
			sortBy.col = column
			sortBy.ascending = true
		}

		let sortModifier = (sortBy.ascending) ? 1 : -1;

		let sort = (a, b) => 
			(a[column] < b[column]) 
			? -1 * sortModifier 
			: (a[column] > b[column]) 
			? 1 * sortModifier 
			: 0;

    rows = rows.sort(sort);
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
                  on:click={sort(column)}
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
                  <td class="px-6 py-4 text-left whitespace-nowrap text-sm font-medium text-gray-900">{cell.value}</td>
                {/each}
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>
