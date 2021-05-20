<script>
  export let points
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

  {#each points as point}
    <div class="">
      <span
        class="w-4 h-4 inline-block rounded-full align-middle"
        style="background-color: {point.color}"
      ></span>

      <span class="align-middle">
        {point.description}
      </span>
    </div>
  {/each}
</div>
