# Third-party components / data

## Apache ECharts

The site loads Apache ECharts 5.5.1 from jsDelivr for map rendering.

- Project: https://echarts.apache.org/
- License: Apache License 2.0

## ChinaGeoJson

Primary administrative boundary source used at runtime:

- Project: `zhChuXiao/ChinaGeoJson`
- Repository: https://github.com/zhChuXiao/ChinaGeoJson
- License: MIT
- The repository states that the map data is sourced from DataV.GeoAtlas.

## DataV.GeoAtlas

Fallback administrative boundary endpoint used at runtime:

- `https://geo.datav.aliyun.com/areas_v3/bound/`

The travel records, dates, categories, and photo paths are kept separately in `data/travel-data.js`.
