'use client'

import qrcode from 'qrcode-generator'
import type { FunctionComponent } from 'react'
import React, { useEffect, useRef, useState } from 'react'
import Modal from '@/components/Modal'
import type { Dictionary } from '@/dictionaries'

const ErrorCorrectionLevel = {
  L: 'L(7%)',
  M: 'M(15%)',
  Q: 'Q(25%)',
  H: 'H(30%)',
}

const Mode = {
  Byte: 'Byte',
  Numeric: 'Numeric',
  Alphanumeric: 'Alphanumeric',
  Kanji: 'Kanji',
}

const Multibyte = {
  'default': 'none',
  'UTF-8': 'UTF-8',
}

type MultibyteType = keyof typeof Multibyte

interface Fields {
  typeNumber: TypeNumber
  errorCorrectionLevel: ErrorCorrectionLevel
  mode: Mode
  content: string
  cellSize: number | undefined
  multibyte: MultibyteType
}

function Confirm({ setModal }: { setModal: React.Dispatch<React.SetStateAction<boolean>> }) {
  return (
    <div className='p-4 bg-white shadow-md rounded-xl text-sm w-[300px] min-h-[120px] flex flex-col justify-between gap-2'>
      <div>The size of the generated QR code will exceed the limit.</div>
      <div className='flex justify-end items-center'>
        <button className='border rounded-md p-1' onClick={(event) => {
          event.preventDefault()
          setModal(false)
        }}>Confirm</button>
      </div>
    </div>
  )
}

const FormItem: FunctionComponent<{ name: string; children: any }> = ({ name, children }) => {
  return (
    <div className='flex gap-1'>
      <div className='flex-1 text-right'><label htmlFor={name}>{name}:</label></div>
      <div className='flex-1'>
        {children}
      </div>
    </div>
  )
}

interface PanelParams {
  formData: Fields
  setFormData: React.Dispatch<React.SetStateAction<Fields>>
  generateQRCode: () => void
  setModal: React.Dispatch<React.SetStateAction<boolean>>
}

function Panel({ formData, setFormData, generateQRCode, setModal }: PanelParams) {
  const updateFormData = (data: Partial<Fields>) => {
    setFormData(Object.assign({}, formData, data))
  }

  let max = 780

  useEffect(() => {
    qrcode.stringToBytes = qrcode.stringToBytesFuncs[formData.multibyte]
    const qr = qrcode(formData.typeNumber, formData.errorCorrectionLevel)
    qr.addData(formData.content)
    qr.make()
    const moduleCount = qr.getModuleCount()
    max = Math.floor(16384 / moduleCount)
    console.log(max)
  })

  return (
    <form className='max-w-full min-w-fit w-[500px]'>
      <fieldset className='flex flex-col gap-1 p-4 relative border rounded border-current'>
        <legend className='mx-auto p-2'>QR Code Generator</legend>
        <FormItem name='TypeNumber'>
          <select id='TypeNumber' name="TypeNumber" value={formData.typeNumber} onChange={(event) => {
            updateFormData({ typeNumber: +event.target.value as TypeNumber })
          }}>
            <option value={0}>Auto Detect</option>
            {Array.from({ length: 40 }).map((_, i) => <option value={i + 1} key={i + 1}>{i + 1}</option>)}
          </select>
        </FormItem>
        <FormItem name='ErrorCorrectionLevel'>
          <select id="ErrorCorrectionLevel" name="ErrorCorrectionLevel" value={formData.errorCorrectionLevel} onChange={(event) => {
            updateFormData({ errorCorrectionLevel: event.target.value as ErrorCorrectionLevel })
          }}>
            {Object.entries(ErrorCorrectionLevel).map(item => <option value={item[0]} key={item[0]}>{item[1]}</option>)}
          </select>
        </FormItem>
        <FormItem name='Mode'>
          <select id="Mode" name="Mode" value={formData.mode} onChange={(event) => {
            updateFormData({ mode: event.target.value as Mode })
          }}>
            {Object.entries(Mode).map(item => <option value={item[0]} key={item[0]}>{item[1]}</option>)}
          </select>
        </FormItem>
        <FormItem name='Multibyte'>
          <select id="Multibyte" name="Multibyte" value={formData.multibyte} onChange={(event) => {
            updateFormData({ multibyte: event.target.value as MultibyteType })
          }}>
            {Object.entries(Multibyte).map(item => <option value={item[0]} key={item[0]}>{item[1]}</option>)}
          </select>
        </FormItem>
        <FormItem name='CellSize'>
          <input id="CellSize" type={'number'} name="CellSize" value={formData.cellSize} onChange={(event) => {
            const value = +event.target.value
            if (value > max || value < 0) {
              setModal(true)
              return
            }
            updateFormData({ cellSize: event.target.value as unknown as number })
          }}>
          </input>
        </FormItem>
        <FormItem name='Content'>
          <textarea id="Content" rows={5} value={formData.content} onChange={(event) => {
            updateFormData({ content: event.target.value })
          }}></textarea>
        </FormItem>
        <button className='surface-sm rounded-md p-2' onClick={(event) => {
          event.preventDefault()
          generateQRCode()
        }}>Update</button>
      </fieldset>
    </form>
  )
}

function QrcodeGenerator({ dictionary }: {
  dictionary: Dictionary }) {
  const target = useRef<HTMLCanvasElement>(null)
  const [formData, setFormData] = useState<Fields>({
    typeNumber: 0,
    errorCorrectionLevel: 'L',
    mode: 'Byte',
    content: 'Hi!',
    cellSize: 10,
    multibyte: 'UTF-8',
  })

  const copies = dictionary.qrcode

  const generateQRCode = () => {
    if (target.current) {
      qrcode.stringToBytes = qrcode.stringToBytesFuncs[formData.multibyte]
      const qr = qrcode(formData.typeNumber, formData.errorCorrectionLevel)
      qr.addData(formData.content)
      qr.make()
      const moduleCount = qr.getModuleCount()
      const width = moduleCount * (formData.cellSize || 2)
      const ctx = target.current.getContext('2d')!
      ctx.clearRect(0, 0, target.current.width, target.current.height)
      target.current.height = width < 16384 ? width : 16384
      target.current.width = width < 16384 ? width : 16384
      qr.renderTo2dContext(ctx, formData.cellSize)
    }
  }

  useEffect(() => {
    generateQRCode()
  }, [])

  const [modal, setModal] = useState(false)

  return (
    <>
      <h1 className='hidden'>{copies.title}</h1>
      {modal ? <Modal><Confirm setModal={setModal} /></Modal> : null}
      <div className='flex flex-col gap-4 items-center text-sm w-full'>
        <Panel formData={formData} setFormData={setFormData} generateQRCode={generateQRCode} setModal={setModal}></Panel>
        <canvas ref={target} className="h-[200px] w-[200px]" width={200} height={200}></canvas>
      </div>
    </>
  )
}

export default QrcodeGenerator
