export function clickOutside (node) {
  const handleClick = event => {
    if (node && !node.contains(event.target) && !event.defaultPrevented) {
      node.dispatchEvent(
        new CustomEvent('click_outside', {
          detail: {
            event, node
          }
        })
      )
    }
  }

  document.addEventListener('click', handleClick, true)

  return {
    destroy () {
      document.removeEventListener('click', handleClick, true)
    }
  }
}
