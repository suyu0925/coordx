# coordx

conversion between various coordinate formats

## Usage

```typescript
import { convertor, format, parse, WGS84Coordinate } from 'coordx'

const wgs84: WGS84Coordinate = {
  type: 'WGS84',
  ...parse('N 31° 12.922 E 121° 32.473'),
}

console.log('wgs84', format(wgs84))
console.log('gcj02', format(convertor.wgs84ToGCJ02(wgs84)))
console.log('bd09', format(convertor.wgs84ToBD09(wgs84)))
```
