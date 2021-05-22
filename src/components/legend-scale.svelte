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
    px-2
    py-1
    sm:px-4
    sm:py-2
    max-w-[95px]
    sm:max-w-[150px]
    shadow-sm
    rounded-md
    top-56
    sm:top-60
    left-2
  "
>
  {#if title}
  <h1 class="text-xs sm:text-base font-medium mb-2">{title}</h1>
  {/if}

  {#each scale as stop, i}
    <div class="text-xs">
      <span
        class="w-2 h-2 sm:w-4 sm:h-4 inline-block"
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
