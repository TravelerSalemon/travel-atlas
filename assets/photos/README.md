# 照片目录

- `provinces/`：省级封面图，建议横向 4:3 或 3:2。
- `cities/`：城市封面图，建议横向 4:3 或 3:2。
- `spots/`：景点照片，可放多张。

如果 `travel-data.js` 中指定的图片不存在，网页会自动显示设计好的占位卡，不会破坏排版。

为单个景点增加照片示例：

```js
{
  name: '故宫博物院',
  photos: [
    'assets/photos/spots/beijing-gugong-01.jpg',
    'assets/photos/spots/beijing-gugong-02.jpg'
  ],
  district: '东城区'
}
```
