import { BD09Coordinate, GCJ02Coordinate, WGS84Coordinate } from './types'
import { Constants, isApproximatelyInChina, transformLat, transformLng } from './utils'

export type CoordinateConvertor = {
  wgs84ToGCJ02: (wsg84: WGS84Coordinate) => GCJ02Coordinate
  wgs84ToBD09: (wsg84: WGS84Coordinate) => BD09Coordinate

  gcj02ToWGS84: (gcj02: GCJ02Coordinate) => WGS84Coordinate
  gcj02ToBD09: (gcj02: GCJ02Coordinate) => BD09Coordinate

  bd09ToGCJ02: (bd09: BD09Coordinate) => GCJ02Coordinate
  bd09ToWGS84: (bd09: BD09Coordinate) => WGS84Coordinate
}

const wgs84ToGCJ02 = (wgs84: WGS84Coordinate): GCJ02Coordinate => {
  if (!isApproximatelyInChina(wgs84)) {
    return {
      ...wgs84,
      type: 'GCJ02',
    }
  } else {
    const { lng, lat } = wgs84
    const { ee, a, PI } = Constants
    let dlat = transformLat({ lng: lng - 105.0, lat: lat - 35.0 })
    let dlng = transformLng({ lng: lng - 105.0, lat: lat - 35.0 })
    const radlat = lat / 180.0 * PI
    let magic = Math.sin(radlat)
    magic = 1 - ee * magic * magic
    const sqrtmagic = Math.sqrt(magic)
    dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * PI)
    dlng = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * PI)
    const mglat = lat + dlat
    const mglng = lng + dlng
    return {
      type: 'GCJ02',
      lng: mglng,
      lat: mglat,
    }
  }
}

const gcj02ToWGS84 = (gcj02: GCJ02Coordinate): WGS84Coordinate => {
  if (!isApproximatelyInChina(gcj02)) {
    return {
      ...gcj02,
      type: 'WGS84',
    }
  } else {
    const { lng, lat } = gcj02
    const { ee, a, PI } = Constants
    let dlat = transformLat({ lng: lng - 105.0, lat: lat - 35.0 })
    let dlng = transformLng({ lng: lng - 105.0, lat: lat - 35.0 })
    const radlat = lat / 180.0 * PI
    let magic = Math.sin(radlat)
    magic = 1 - ee * magic * magic
    const sqrtmagic = Math.sqrt(magic)
    dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * PI)
    dlng = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * PI)
    const mglat = lat + dlat
    const mglng = lng + dlng
    return {
      type: 'WGS84',
      lng: lng * 2 - mglng,
      lat: lat * 2 - mglat,
    }
  }
}

const gcj02ToBD09 = (gcj02: GCJ02Coordinate): BD09Coordinate => {
  const { lng, lat } = gcj02
  const { x_PI } = Constants
  const z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * x_PI)
  const theta = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * x_PI)
  return {
    type: 'BD09',
    lng: z * Math.cos(theta) + 0.0065,
    lat: z * Math.sin(theta) + 0.006,
  }
}

const bd09ToGCJ02 = (bd09: BD09Coordinate): GCJ02Coordinate => {
  const { x_PI } = Constants
  const { lng, lat } = bd09
  const x = lng - 0.0065
  const y = lat - 0.006
  const z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_PI)
  const theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_PI)
  return {
    type: 'GCJ02',
    lng: z * Math.cos(theta),
    lat: z * Math.sin(theta),
  }
}

export const coordinateConvertor: CoordinateConvertor = {
  wgs84ToGCJ02,
  gcj02ToWGS84,
  gcj02ToBD09,
  bd09ToGCJ02,
  wgs84ToBD09: (wgs84: WGS84Coordinate) => gcj02ToBD09(wgs84ToGCJ02(wgs84)),
  bd09ToWGS84: (bd09: BD09Coordinate) => gcj02ToWGS84(bd09ToGCJ02(bd09)),
}
