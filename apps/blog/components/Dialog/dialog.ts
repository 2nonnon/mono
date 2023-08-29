// page load dialogs setup
export default async function (dialog: HTMLDialogElement) {
  // custom events to be added to <dialog>
  const dialogClosingEvent = new Event('closing')
  const dialogClosedEvent = new Event('closed')
  const dialogOpeningEvent = new Event('opening')
  const dialogOpenedEvent = new Event('opened')
  const dialogRemovedEvent = new Event('removed')

  // wait for all dialog animations to complete their promises
  const animationsComplete = <T extends HTMLElement>(element: T) =>
    Promise.allSettled(
      element.getAnimations().map(animation =>
        animation.finished))

  // click outside the dialog handler
  const lightDismiss = ({ target: dialog }) => {
    if (dialog.nodeName === 'DIALOG')
      dialog.close('dismiss')
  }

  const dialogClose = async ({ target: dialog }) => {
    dialog.setAttribute('inert', '')
    dialog.dispatchEvent(dialogClosingEvent)
    dialog.style.cssText = 'transform: translateY(100vh)'

    await animationsComplete(dialog)

    dialog.dispatchEvent(dialogClosedEvent)
  }

  // track opening
  const dialogAttrObserver = new MutationObserver((mutations, _observer) => {
    mutations.forEach(async (mutation) => {
      if (mutation.attributeName === 'open') {
        const dialog = mutation.target as HTMLDialogElement

        const isOpen = dialog.hasAttribute('open')
        if (!isOpen)
          return

        dialog.removeAttribute('inert')

        // set focus
        const focusTarget = dialog.querySelector('[autofocus]') as HTMLButtonElement
        focusTarget
          ? focusTarget.focus()
          : dialog.querySelector('button')?.focus()

        dialog.dispatchEvent(dialogOpeningEvent)
        await animationsComplete(dialog)
        dialog.dispatchEvent(dialogOpenedEvent)
      }
    })
  })

  // track deletion
  const dialogDeleteObserver = new MutationObserver((mutations, _observer) => {
    mutations.forEach((mutation) => {
      mutation.removedNodes.forEach((removedNode) => {
        if (removedNode.nodeName === 'DIALOG') {
          removedNode.removeEventListener('click', lightDismiss)
          removedNode.removeEventListener('close', dialogClose)
          removedNode.dispatchEvent(dialogRemovedEvent)
        }
      })
    })
  })

  dialog.addEventListener('click', lightDismiss)
  dialog.addEventListener('close', dialogClose)

  dialogAttrObserver.observe(dialog, {
    attributes: true,
  })

  dialogDeleteObserver.observe(document.body, {
    attributes: false,
    subtree: false,
    childList: true,
  })

  // remove loading attribute
  // prevent page load @keyframes playing
  await animationsComplete(dialog)
  dialog.removeAttribute('loading')
}
