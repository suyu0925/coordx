import { Coordinate } from './types'

export enum Constants {
  x_PI = 3.14159265358979324 * 3000.0 / 180.0,
  PI = 3.1415926535897932384626,
  a = 6378245.0,
  ee = 0.00669342162296594323
}

export const isApproximatelyInChina = (coord: Coordinate): boolean => {
  // N 3.86~53.55, E 73.66~135.05
  const { lng, lat } = coord
  return (lng > 73.66 && lng < 135.05 && lat > 3.86 && lat < 53.55)
}

export const transformLat = (coord: Coordinate): number => {
  const { lng, lat } = coord
  const PI = Constants.PI
  let ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng))
  ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0
  ret += (20.0 * Math.sin(lat * PI) + 40.0 * Math.sin(lat / 3.0 * PI)) * 2.0 / 3.0
  ret += (160.0 * Math.sin(lat / 12.0 * PI) + 320 * Math.sin(lat * PI / 30.0)) * 2.0 / 3.0
  return ret
}

export const transformLng = (coord: Coordinate): number => {
  const { lng, lat } = coord
  const PI = Constants.PI
  var ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng))
  ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0
  ret += (20.0 * Math.sin(lng * PI) + 40.0 * Math.sin(lng / 3.0 * PI)) * 2.0 / 3.0
  ret += (150.0 * Math.sin(lng / 12.0 * PI) + 300.0 * Math.sin(lng / 30.0 * PI)) * 2.0 / 3.0
  return ret
}

/**
 * Support formats:
 *  GeoCaching: 
 *    N 31° 12.922 E 121° 32.473
 *  Google Map: 
 *    31°12'55.3"N 121°32'28.4"E
 *    31 12.922, 121 32.473
 *    31.215367,121.541217
 *  Others:
 *    39.9042° N 116.4074° E
 */
export const parseCoordinate = (input: string): Coordinate => {
  const patterns = [
    {
      name: 'GeoCaching',
      pattern: /([NS])\s*(\d+)[°\s]+\s*([\d.]+)[′']?\s*([EW])\s*(\d+)[°\s]+\s*([\d.]+)[′']?/,
      example: 'N 31° 12.922 E 121° 32.473',
    },
    {
      name: 'DMS', // Degree, Minute, Second Format
      pattern: /(\d+)[°\s]+(\d+)[′']([\d.]+)["”]([NS])\s+(\d+)[°\s]+(\d+)[′']([\d.]+)["”]([EW])/,
      example: '31°12\'55.3"N 121°32\'28.4"E',
    },
    {
      name: 'DDM', // Degree and Decimal Minute Format
      pattern: /(\d+)[\s°]+([\d.]+)[′']?,\s*(\d+)[\s°]+([\d.]+)[′']?/,
      example: '31 12.922, 121 32.473',
    },
    {
      name: 'DD', // Decimal Degree Format
      pattern: /([\d.-]+),\s*([\d.-]+)/,
      example: '31.215367,121.541217',
    },
    {
      name: 'DDDL', // Decimal Degrees with Directional Letters
      pattern: /([\d.-]+)[°\s]+([NS])\s+([\d.-]+)[°\s]+([EW])/,
      example: '39.9042° N 116.4074° E',
    }
  ]

  for (const { name, pattern } of patterns) {
    const match = input.match(pattern)
    if (match) {
      let lat: number
      let lng: number

      if (name === 'GeoCaching') {
        const latDeg = parseFloat(match[2])
        const latMin = parseFloat(match[3])
        const lngDeg = parseFloat(match[5])
        const lngMin = parseFloat(match[6])
        lat = latDeg + latMin / 60
        lng = lngDeg + lngMin / 60
        if (match[1] === 'S') {
          lat = -lat
        }
        if (match[4] === 'W') {
          lng = -lng
        }
      } else if (name === 'DMS') {
        const latDeg = parseFloat(match[1])
        const latMin = parseFloat(match[2])
        const latSec = parseFloat(match[3])
        const lngDeg = parseFloat(match[5])
        const lngMin = parseFloat(match[6])
        const lngSec = parseFloat(match[7])
        lat = latDeg + latMin / 60 + latSec / 3600
        lng = lngDeg + lngMin / 60 + lngSec / 3600
        if (match[4] === 'S') {
          lat = -lat
        }
        if (match[8] === 'W') {
          lng = -lng
        }
      } else if (name === 'DDM') {
        const latDeg = parseFloat(match[1])
        const latMin = parseFloat(match[2])
        const lngDeg = parseFloat(match[3])
        const lngMin = parseFloat(match[4])
        lat = latDeg + latMin / 60
        lng = lngDeg + lngMin / 60
      } else if (name === 'DD') {
        lat = parseFloat(match[1])
        lng = parseFloat(match[2])
      } else if (name === 'DDDL') {
        lat = parseFloat(match[1])
        lng = parseFloat(match[3])
        if (match[2] === 'S') {
          lat = -lat
        }
        if (match[4] === 'W') {
          lng = -lng
        }
      } else {
        throw new Error(`Unsupported format: ${name}`)
      }

      return { lng, lat }
    }
  }

  throw new Error('Invalid coordinate format')
}

export type FormatOptions = {
  fractionDigits?: number
}
export const formatCoordinate = (coord: Coordinate, { fractionDigits = 6 }: FormatOptions): string => {
  if (fractionDigits) {
    return `${coord.lat.toFixed(fractionDigits)},${coord.lng.toFixed(fractionDigits)}`
  } else {
    return `${coord.lat},${coord.lng}`
  }
}
