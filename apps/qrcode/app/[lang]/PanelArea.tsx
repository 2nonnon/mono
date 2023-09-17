'use client'

import type { ChangeEventHandler, FC, MouseEventHandler, ReactNode } from 'react'
import React, { useCallback } from 'react'
import { Icon } from '@iconify-icon/react'
import { useQrcodeDispatch, useQrcodeOptions } from './QrcodeContext'
import { ErrorCorrectionLevelMap, MarkerStyleMap, PixelStyleMap } from '@/components/Qrcode'

interface FormItemProps { name: string; children: ReactNode }

const FormItem: FC<FormItemProps> = ({ name, children }) => {
  // React.Children.map(children, (child) => {
  //   if (React.isValidElement(child))
  //     return React.cloneElement(child, { })
  // })

  return (
    <div className='flex gap-2 items-center max-sm:flex-col max-sm:items-start'>
      <div className='w-48'><label htmlFor={name}>{name}:</label></div>
      <div className='flex-1 flex min-w-0 w-full'>
        {children}
      </div>
    </div>
  )
}

interface RadioGroupProps { name: string;value: string; map: object; onChange: ChangeEventHandler<HTMLInputElement> }

const RadioGroup: FC<RadioGroupProps> = ({ name, onChange, value, map }) => {
  return (<>
    <div className='surface-sm__inert w-fit rounded flex overflow-hidden'>
      {Object.entries(map).map(item =>
        <div className='border-r last:border-none border-[var(--border-color)]' key={item[0]}>
          <input data-key={name} id={item[1]} className='peer hidden' type="radio" name={name} value={item[0]} onChange={onChange} checked={value === item[0]}></input>
          <label htmlFor={item[1]} className='peer-checked:surface-sm__active px-2 py-1 flex cursor-pointer'>{item[1]}</label>
        </div>)}
    </div>
  </>)
}

interface UploadProps { name: string; value: File; onChange: ChangeEventHandler<HTMLInputElement>; onClear: MouseEventHandler<HTMLButtonElement> }

const Upload: FC<UploadProps> = ({ name, value, onChange, onClear }) => {
  return (<>
    <div className='flex items-center gap-2 min-w-0'>
      <label className='surface-sm flex items-center justify-center w-fit rounded px-4 py-1 gap-2 cursor-pointer'>
        <input data-key={name} className='hidden' type="file" accept='image/*' onChange={onChange}/>
        <Icon icon="mingcute:upload-2-line" />
        <span>Upload</span>
      </label>
      {
        value && <div className='flex items-center gap-2 min-w-0'>
          <p className='overflow-hidden text-ellipsis' title={value.name}>{value.name}</p>
          <button data-key={name} type='button' className='flex text-xl' onClick={onClear}><Icon icon="jam:close-circle-f" /></button>
        </div>
      }
    </div>
  </>)
}

export default function Panel() {
  const options = useQrcodeOptions()

  const QrcodeDispatch = useQrcodeDispatch()

  const clearUpload = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    const key = event.currentTarget.dataset.key as string
    key && QrcodeDispatch({ type: 'changed', options: { [key]: undefined } })
  }, [])

  const handleUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const key = event.currentTarget.dataset.key as string
    key && QrcodeDispatch({ type: 'changed', options: { [key]: event.target.files![0] } })
  }, [])

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const key = event.currentTarget.dataset.key as string
    const value = typeof options[key] === 'number' ? +event.target.value : event.target.value
    key && QrcodeDispatch({ type: 'changed', options: { [key]: value } })
  }, [])

  return (
    <form className='flex flex-col gap-3 text-base pb-4'>
      <fieldset className='flex flex-col gap-3 w-full min-w-[auto]'>
        <label className='border border-[var(--border-color)] flex rounded'>
          <textarea data-key='content' id="Content" className='w-full rounded px-4 py-2' rows={5} value={options.content} onChange={handleChange}></textarea>
        </label>

        <FormItem name='ErrorCorrectionLevel'>
          <RadioGroup name='errorCorrectionLevel' value={options.errorCorrectionLevel} onChange={handleChange} map={ErrorCorrectionLevelMap}></RadioGroup>
        </FormItem>

        <FormItem name='TypeNumber'>
          <select data-key='typeNumber' className='border border-[var(--border-color)] rounded w-32' id='TypeNumber' name="TypeNumber" value={options.typeNumber} onChange={handleChange}>
            <option value={0}>Auto Detect</option>
            {Array.from({ length: 40 }).map((_, i) => <option value={i + 1} key={i + 1}>{i + 1}</option>)}
          </select>
        </FormItem>
      </fieldset>

      <fieldset className='flex flex-col gap-3 w-full min-w-0'>
        <FormItem name='PixelSize'>
          <div className='flex gap-4 w-full'>
            <input data-key='pixelSize' className='flex-1' type="range" min={1} max={100} value={options.pixelSize} onChange={handleChange}/>
            <input data-key='pixelSize' className='border border-[var(--border-color)] rounded w-16 pl-1' type="number" min={1} max={100} value={options.pixelSize} onChange={handleChange}/>
          </div>
        </FormItem>

        <FormItem name='Margin'>
          <div className='flex gap-4 w-full'>
            <input data-key='margin' className='flex-1' type="range" min={0} max={25} value={options.margin} onChange={handleChange}/>
            <input data-key='margin' className='border border-[var(--border-color)] rounded w-16 pl-1' type="number" min={1} max={100} value={options.margin} onChange={handleChange}/>
          </div>
        </FormItem>

        <FormItem name='PixelStyle'>
          <RadioGroup name='pixelStyle' value={options.pixelStyle} onChange={handleChange} map={PixelStyleMap}></RadioGroup>
        </FormItem>

        <FormItem name='MarkerStyle'>
          <RadioGroup name='markerStyle' value={options.markerStyle} onChange={handleChange} map={MarkerStyleMap}></RadioGroup>
        </FormItem>

        <FormItem name='Logo'>
          <Upload name='logo' value={options.logo} onChange={handleUpload} onClear={clearUpload}></Upload>
        </FormItem>

        <FormItem name='Background'>
          <Upload name='background' value={options.background} onChange={handleUpload} onClear={clearUpload}></Upload>
        </FormItem>
      </fieldset>
    </form>
  )
}
