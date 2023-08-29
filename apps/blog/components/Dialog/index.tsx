import React, { useEffect, useRef } from 'react'
import GuiDialog from './dialog'
import styles from './index.module.css'

function header() {
  return (<>
    <header className={styles.dialog__header}>
      <section className="icon-headline">
        <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="8.5" cy="7" r="4"></circle>
          <line x1="20" y1="8" x2="20" y2="14"></line>
          <line x1="23" y1="11" x2="17" y2="11"></line>
        </svg>
        <h3>New User</h3>
      </section>
      <button onClick={() => this.closest('dialog').close('close')} type="button" title="Close dialog">
        <title>Close dialog icon</title>
        <svg width="24" height="24" viewBox="0 0 24 24">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </header>
  </>)
}

function body() {
  return (<>
    <article className={styles.dialog__body}>
      <section className="labelled-input">
        <label htmlFor="userimage">Upload an image</label>
        <input id="userimage" name="userimage" type="file"/>
      </section>
      <small><b>*</b> Maximum upload 1mb</small>
    </article>
  </>)
}

function footer() {
  return (<>
    <footer className={styles.dialog__footer}>
      <menu>
        <button type="reset" value="clear">Clear</button>
      </menu>
      <menu>
        <button autoFocus type="button" onClick={() => {
          this.closest('dialog').close('cancel')
        }}>Cancel</button>
        <button type="submit" value="confirm">Confirm</button>
      </menu>
    </footer>
  </>)
}

interface NDialogProps {
  children: React.ReactNode
  onClose: () => void
}

export default function NDialog({ children, onClose }: NDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (dialogRef.current) {
      dialogRef.current.showModal()
      dialogRef.current.addEventListener('closed', onClose)
      GuiDialog(dialogRef.current)
    }
  }, [])

  return (<>
    <dialog ref={dialogRef} className={`${styles.dialog}`}>
      <section className={styles.dialog__container}>
        {children}
      </section>
    </dialog>
  </>)
}

NDialog.header = header
NDialog.body = body
NDialog.footer = footer
