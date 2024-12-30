export type CoordinateType = 'WGS84' | 'GCJ02' | 'BD09'

export type Coordinate = {
  lng: number
  lat: number
}

export type TypedCoordinateType = Coordinate & {
  type: CoordinateType
}

export type WGS84Coordinate = TypedCoordinateType & {
  type: 'WGS84'
}

export type GCJ02Coordinate = TypedCoordinateType & {
  type: 'GCJ02'
}

// https://lbsyun.baidu.com/jsdemo/demo/yLngLatLocation.htm
export type BD09Coordinate = TypedCoordinateType & {
  type: 'BD09'
}
