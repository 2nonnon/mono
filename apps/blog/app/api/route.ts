import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestHeaders = new Headers(request.headers)
  const ip = requestHeaders.get('cf-connecting-ip')
  const ipAddress = requestHeaders.get('cf-ipcountry')

  return NextResponse.json({ IP: ip, IPAddress: ipAddress })
}
