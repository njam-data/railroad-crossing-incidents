<script>
  export let scale
  export let title
</script>

<div
  class="
    absolute
    z-10
    flex
    flex-col
    bg-white
    px-4
    py-2
    max-w-[150px]
    shadow-sm
    rounded-md
    bottom-12
    left-2
  "
>
  {#if title}
  <h1 class="font-medium mb-2">{title}</h1>
  {/if}

  {#each scale as stop, i}
    <div class="">
      <span
        class="w-4 h-4 inline-block"
        style="background-color: {stop[1]}"
      ></span>
      <span>
        {stop[0]}{#if scale[i + 1]} 
        -{scale[i + 1][0] - 1}
        {:else}
        &plus;
        {/if}
      </span>
    </div>
  {/each}
</div>
