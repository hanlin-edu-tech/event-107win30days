# event-107win30days
國中考前30天107版

# 開發時編譯
gulp build

# 打包至dist目錄
gulp package

# 部署上傳至GCS

### 認證配置
[點此參考 Google 文件](https://cloud.google.com/docs/authentication/getting-started)

### 測試環境
gulp uploadGCSTest

### 正式環境
gulp uploadGCSProd

### 注意事項
ehanlin-loader.js 的版本需隨環境手動切換

