# 简历照片替换说明

## 📸 照片位置

简历照片文件位于：
```
quickview/public/images/photo-placeholder.jpg
```

## 🔄 如何替换照片

### 方法一：直接替换文件

1. 准备你的个人照片（建议使用证件照）
2. 将照片重命名为 `photo-placeholder.jpg`
3. 替换 `quickview/public/images/photo-placeholder.jpg` 文件
4. 刷新浏览器页面即可看到新照片

### 方法二：使用不同的文件名

1. 将你的照片放到 `quickview/public/images/` 目录
2. 编辑 [`ResumeHeader.tsx`](quickview/src/components/resume/ResumeHeader.tsx:44) 文件
3. 修改第 44 行的图片路径：

```tsx
<img 
  src="/images/your-photo-name.jpg"  // 改为你的照片文件名
  alt="个人照片" 
  className="w-[118px] h-[165px] object-cover border-2 border-gray-300"
/>
```

## 📏 照片尺寸建议

### 一寸照片（当前使用）
- **像素尺寸**: 295 x 413 像素
- **显示尺寸**: 118 x 165 像素（2.5cm x 3.5cm）
- **适用场景**: 标准简历

### 二寸照片（可选）
- **像素尺寸**: 413 x 626 像素
- **显示尺寸**: 165 x 250 像素（3.5cm x 5.3cm）
- **修改方式**: 在 [`ResumeHeader.tsx`](quickview/src/components/resume/ResumeHeader.tsx:44) 中修改 `className`：

```tsx
className="w-[165px] h-[250px] object-cover border-2 border-gray-300"
```

## 🎨 照片要求

### 推荐规格
- **格式**: JPG 或 PNG
- **背景**: 纯色背景（白色、蓝色或红色）
- **着装**: 正装
- **表情**: 自然、微笑
- **清晰度**: 高清，无模糊

### 文件大小
- **建议**: 小于 500KB
- **最大**: 不超过 2MB

## 🔧 调整照片样式

如需调整照片的显示效果，编辑 [`ResumeHeader.tsx`](quickview/src/components/resume/ResumeHeader.tsx:44)：

```tsx
<img 
  src="/images/photo-placeholder.jpg" 
  alt="个人照片" 
  className="
    w-[118px]           /* 宽度 */
    h-[165px]           /* 高度 */
    object-cover        /* 裁剪方式 */
    border-2            /* 边框粗细 */
    border-gray-300     /* 边框颜色 */
    rounded             /* 添加圆角（可选）*/
  "
/>
```

### 常用样式调整

**圆角照片：**
```tsx
className="w-[118px] h-[165px] object-cover border-2 border-gray-300 rounded-lg"
```

**圆形照片：**
```tsx
className="w-[118px] h-[118px] object-cover border-2 border-gray-300 rounded-full"
```

**无边框：**
```tsx
className="w-[118px] h-[165px] object-cover"
```

**阴影效果：**
```tsx
className="w-[118px] h-[165px] object-cover border-2 border-gray-300 shadow-lg"
```

## 💡 提示

1. **照片比例**: 使用 `object-cover` 可以自动裁剪照片以适应容器，保持比例不变形
2. **照片质量**: 建议使用专业证件照，确保清晰度和专业性
3. **文件命名**: 使用英文命名，避免中文和特殊字符
4. **打印效果**: 打印前预览照片显示效果，确保清晰可见

## 🐛 常见问题

**Q: 照片不显示？**
A: 检查文件路径是否正确，确保照片在 `public/images/` 目录下。

**Q: 照片变形了？**
A: 确保使用 `object-cover` 类名，它会自动裁剪照片保持比例。

**Q: 照片太大或太小？**
A: 修改 `w-[118px] h-[165px]` 中的数值来调整显示尺寸。

**Q: 打印时照片不清晰？**
A: 使用更高分辨率的原始照片（建议至少 300 DPI）。
