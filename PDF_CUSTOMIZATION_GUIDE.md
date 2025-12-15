# 🎨 How to Customize the PDF Guidelines

## Quick Customization Guide

### 📝 Changing the Guidelines Text

The guidelines are defined as an array starting around **line 760** in both:
- `backend/src/utils/pdfGenerator.js`
- `backend/utils/pdfgenerator.js`

```javascript
const guidelines = [
  {
    icon: '🤖',  // Change the emoji
    title: 'Your Title Here',  // Change the bold title
    text: 'Your description text goes here. Keep it concise and actionable.'
  },
  // Add more guidelines...
];
```

### 🎨 Changing Colors

Find these color codes in the file and replace them:

| Element | Current Color | Variable Name | Where Used |
|---------|--------------|---------------|------------|
| Primary Green | `#018940` | N/A | Headers, buttons, borders |
| Accent Green | `#05d8a7` | N/A | Links, highlights |
| Light Green 1 | `#f0fdf4` | N/A | Box backgrounds |
| Light Green 2 | `#e8f9f1` | N/A | Alternate box backgrounds |
| Text Dark | `#333333` | N/A | Body text |
| Text Gray | `#666666` | N/A | Secondary text |

**Example: Change to Blue Theme**
```javascript
// Replace in the file:
'#018940' → '#1e40af'  // Primary blue
'#05d8a7' → '#3b82f6'  // Light blue
'#f0fdf4' → '#eff6ff'  // Very light blue
'#e8f9f1' → '#dbeafe'  // Light blue background
```

### 📏 Adjusting Layout

**Guideline Box Height**
```javascript
doc.roundedRect(50, yPos, 495, 55, 5)  // Change 55 to adjust height
```

**Spacing Between Guidelines**
```javascript
yPos += 63;  // Change 63 to adjust spacing
```

**Icon Circle Size**
```javascript
doc.circle(75, yPos + 27, 18)  // Last number (18) is radius
```

### 🔤 Changing Fonts & Sizes

**Main Title**
```javascript
doc.fontSize(36)  // Change size
   .font('Helvetica-Bold')  // Change font
   .text('WellNest', ...)
```

**Guideline Titles**
```javascript
doc.fontSize(13)  // Title size
```

**Guideline Text**
```javascript
doc.fontSize(9.5)  // Description size
```

### 🔗 Updating Dashboard Link

**Page 1 Footer** (around line 830):
```javascript
doc.fillColor('#05d8a7').fontSize(13).font('Helvetica-Bold')
   .text('wellnest.sbs/dashboard', 50, 745, { 
     align: 'center',
     underline: true,
     link: 'https://wellnest.sbs/dashboard'  // Change URL here
   });
```

**Last Page Footer** (around line 960):
```javascript
doc.fillColor('#05d8a7').text('wellnest.sbs/dashboard', { 
  align: 'center',
  underline: true,
  link: 'https://wellnest.sbs/dashboard'  // Change URL here
});
```

### 📱 Common Customizations

#### 1. Add a New Guideline
```javascript
const guidelines = [
  // ... existing guidelines ...
  {
    icon: '🎯',
    title: 'Your New Guideline',
    text: 'Describe what users should do here.'
  }
];
```

#### 2. Change Welcome Message
Find around line 750:
```javascript
doc.fillColor('#018940').fontSize(16).font('Helvetica-Bold')
   .text(`👤 Welcome, ${username}!`, 70, 185);
```

Change to:
```javascript
doc.text(`👋 Hi ${username}, Let's Get Started!`, 70, 185);
```

#### 3. Modify Subtitle Text
Find around line 720:
```javascript
doc.fontSize(18).fillColor('#e8f9f1').font('Helvetica')
   .text('Your Personalized Nutrition Journey', 50, 75, { align: 'center' });
```

#### 4. Add Your Logo
```javascript
// After the header, add:
const logoPath = path.join(__dirname, 'assets', 'logo.png');
doc.image(logoPath, 250, 20, { width: 100 });
```

### 🧪 Testing Your Changes

After making changes:

```bash
cd backend
node test_pdfkit_mealplan.js
```

Open `test_pdfkit_mealplan.pdf` to preview your changes.

### 💾 Both Files Need Updates

Remember to update **both files**:
1. `backend/src/utils/pdfGenerator.js` (main)
2. `backend/utils/pdfgenerator.js` (backup)

### 🎯 Common Use Cases

**Make it More Concise**: Reduce guideline text length, decrease box heights
**Make it More Detailed**: Increase box heights, add more guidelines
**Brand it**: Change colors to match your brand palette
**Localize it**: Change all text strings to another language

### 📋 Testing Checklist

- [ ] Text fits within boxes (no overflow)
- [ ] Colors are consistent throughout
- [ ] Links are clickable
- [ ] Emojis display correctly
- [ ] Spacing looks balanced
- [ ] PDF generates without errors
- [ ] File size is reasonable (<50 KB for basic plan)

---

**Pro Tip**: Keep a backup of the original file before making major changes!

**Need Help?** The AI can help you with specific customizations. Just describe what you want!
