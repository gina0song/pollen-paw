# 🐾 Pollen Paw - Frontend

React-based frontend for pet health tracking with pollen correlation analysis.

---

## 📋 Quick Reference

| Item | Details |
|------|---------|
| **Framework** | React 18 + TypeScript |
| **Port** | http://localhost:3000 |
| **State Management** | React hooks (useState, useContext) |
| **HTTP Client** | Axios |
| **Routing** | React Router v6 |
| **Charts** | Recharts |
| **Styling** | CSS3 with variables |

---

## 🚀 Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- Backend API URL (ask instructor)

### Step-by-Step Setup

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env

# 4. Edit .env with your backend API URL
# REACT_APP_API_URL=https://your-api-id.execute-api.us-east-2.amazonaws.com/dev

# 5. Start development server
npm start
```

The app opens automatically at `http://localhost:3000` ✨

---

## 📂 Project Structure

```
frontend/
├── public/
│   └── index.html              # HTML entry point
├── src/
│   ├── components/
│   │   └── layout/
│   │       ├── Header.tsx      # Top navigation header
│   │       ├── Navigation.tsx  # Bottom tab navigation
│   │       └── Layout.tsx      # Main layout wrapper
│   ├── pages/
│   │   ├── Dashboard.tsx       # 🏠 Home screen
│   │   ├── LogSymptoms.tsx     # ➕ Symptom entry form
│   │   ├── Analysis.tsx        # 📊 Correlation analysis
│   │   ├── AIInsights.tsx      # 🧠 AI recommendations
│   │   ├── PetProfile.tsx      # 🐱 Pet management
│   │   ├── Login.tsx           # 🔑 Login page
│   │   ├── Register.tsx        # 📝 Sign up page
│   │   └── styles/
│   │       └── AllPages.css    # Page-level styles
│   ├── services/
│   │   ├── api.ts              # Axios configuration
│   │   ├── authService.ts      # Login/Register API
│   │   ├── petService.ts       # Pet CRUD operations
│   │   ├── symptomService.ts   # Symptom logging API
│   │   ├── environmentalService.ts # Pollen data API
│   │   └── analysisService.ts  # Correlation API
│   ├── types/
│   │   └── index.ts            # All TypeScript interfaces
│   ├── App.tsx                 # Main app component with routes
│   ├── App.css                 # App-level styles
│   ├── index.tsx               # React entry point
│   ├── index.css               # Global styles & CSS variables
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

---

## 🎨 Key Pages

### 1. **Dashboard** (`/`)
**What it shows:**
- Welcome message with user's current pet
- Three stats cards:
  - Days logged (total symptom entries)
  - Average pollen level
  - Average symptom severity
- Current pollen levels (tree, grass, weed)
- Recent symptom logs (last 5 with photos)
- Quick "Log Today's Symptoms" button

**Code:** `src/pages/Dashboard.tsx`

### 2. **Log Symptoms** (`/log-symptoms`)
**What it does:**
- Let you select which pet to log for
- Rate 4 symptom categories on 1-5 scale:
  - Eye symptoms
  - Fur quality
  - Skin irritation
  - Respiratory issues
- Optional photo upload
- Optional notes
- Save button to submit

**Code:** `src/pages/LogSymptoms.tsx`

### 3. **Analysis** (`/analysis`)
**What it shows:**
- Interactive chart with two lines:
  - Blue line: symptom severity over time
  - Orange line: top trigger pollen over time
- Correlation coefficients (r-values) for each pollen type
- Insights section explaining the correlation
- Visual pattern recognition

**Code:** `src/pages/Analysis.tsx`

### 4. **Pet Profile** (`/pet-profile`)
**What you can do:**
- View all your pets
- Edit pet information
- Add new pet
- Update account settings (email, ZIP code)

**Code:** `src/pages/PetProfile.tsx`

### 5. **Login** (`/login`)
**What it does:**
- Enter email to login
- Backend verifies and returns JWT token
- Token stored in localStorage
- Redirects to dashboard

**Code:** `src/pages/Login.tsx`

### 6. **Register** (`/register`)
**What it does:**
- Create new account with email and ZIP code
- Backend creates user record
- Auto-login after registration
- Redirects to pet setup

**Code:** `src/pages/Register.tsx`

---

## 🧪 Manual Testing Guide

### Quick Test Flow

1. **Start the app**: 
   ```bash
   npm start
   ```

2. **Register a new account**:
   - Go to `/register`
   - Enter email: `test@example.com`
   - Enter ZIP: `96753`
   - Click "Register"

3. **You'll be auto-logged in and redirected to Dashboard** ✅

4. **Add a pet**:
   - Go to "Pet Profile" tab
   - Click the `+` button to add new pet
   - Fill in: Name, Type, Age, Breed
   - Click "Save Changes"

5. **Log a symptom**:
   - Go to "Log Symptoms" tab
   - Select your pet
   - (Optional) Upload a photo
   - Adjust symptom sliders (1-5 for each category)
   - Add notes
   - Click "Save Entry"

6. **View your data**:
   - Go back to Dashboard
   - See your stats updated
   - View recent photos

7. **Try other features**:
   - Go to **Analysis** page - see symptom vs pollen charts
   - Go to **AI Insights** - see personalized recommendations

---

## 🔑 Environment Variables

Create `.env` file in `/frontend`:

```bash
# Required: Your backend API URL
REACT_APP_API_URL=https://your-api-id.execute-api.us-east-2.amazonaws.com/dev

# For local backend development (if running locally):
# REACT_APP_API_URL=http://localhost:3000/dev
```

See `.env.example` for template.

---

## 🛠️ API Services

All services in `src/services/`. They handle communication with the backend.

### authService.ts
```typescript
// Login with email
authService.login({ email: 'user@example.com' })

// Register new account
authService.register({ 
  email: 'user@example.com', 
  zip_code: '96753' 
})

// Logout (clears token)
authService.logout()

// Check if user is logged in
authService.isAuthenticated()
```

### petService.ts
```typescript
// Get all pets for current user
petService.getPets()

// Get single pet by ID
petService.getPet(petId)

// Create new pet
petService.createPet({ 
  name: 'Buddy', 
  species: 'Dog', 
  age: 3 
})

// Update pet info
petService.updatePet(petId, { name: 'Buddy Jr' })

// Delete pet
petService.deletePet(petId)
```

### symptomService.ts
```typescript
// Get all symptom logs for a pet
symptomService.getSymptoms(petId)

// Create new symptom log
symptomService.createSymptom({
  pet_id: 13,
  eye_symptoms: 2,
  fur_quality: 3,
  skin_irritation: 1,
  respiratory: 2,
  notes: 'Had a rough day'
})

// Update existing log
symptomService.updateSymptom(logId, { eye_symptoms: 3 })

// Delete log
symptomService.deleteSymptom(logId)

// Upload photo to S3
symptomService.uploadPhoto(file)
```

### environmentalService.ts
```typescript
// Get pollen data for ZIP code
environmentalService.getPollenData(zipCode)

// Get air quality data for ZIP code
environmentalService.getAirQualityData(zipCode)
```

### analysisService.ts
```typescript
// Get correlation analysis for a pet
analysisService.getCorrelation(petId)
```

---

## 📊 How Data Flows

### Example: Logging a Symptom

```
User fills form and clicks "Save"
        ↓
LogSymptoms.tsx calls symptomService.createSymptom()
        ↓
api.ts sends POST request with JWT token
        ↓
AWS API Gateway receives request
        ↓
Lambda function validates and processes
        ↓
Data inserted into RDS database
        ↓
Photo uploaded to S3 (if provided)
        ↓
Backend returns success response
        ↓
Frontend shows success message
        ↓
Dashboard updates with new entry
```

### Example: Viewing Correlation Chart

```
User navigates to /analysis
        ↓
Analysis.tsx loads and calls analysisService.getCorrelation(petId)
        ↓
api.ts sends GET request with token
        ↓
Backend queries database for symptom logs and pollen data
        ↓
Backend calculates correlation coefficients
        ↓
Backend returns chart data and insights
        ↓
Recharts renders interactive chart
        ↓
User sees symptoms and pollen lines with r-values
```

---

## 🔐 Authentication Flow

### Login Process
1. User enters email on `/login`
2. Frontend calls `authService.login()`
3. Backend validates email exists
4. Backend generates JWT token
5. Frontend stores token in `localStorage`
6. Frontend sets token in all future requests
7. User redirected to `/` (dashboard)

### Protected Routes
- All pages except `/login` and `/register` require token
- If no token, redirect to `/login`
- Every API request includes: `Authorization: Bearer <token>`

### Logout
- Clears `localStorage` token
- Redirects to `/login`

---

## 🎨 Styling System

### CSS Variables (in `src/index.css`)

```css
/* Colors */
--primary-blue: #4A90FF
--success-green: #10B981
--warning-orange: #F59E0B
--error-red: #EF4444
--gray-light: #F9FAFB
--gray-dark: #111827

/* Spacing */
--spacing-xs: 4px
--spacing-sm: 8px
--spacing-md: 16px
--spacing-lg: 24px
--spacing-xl: 32px

/* Borders */
--radius-sm: 4px
--radius-md: 8px
--radius-lg: 12px

/* Shadows */
--shadow-sm: 0 1px 3px rgba(0,0,0,0.1)
--shadow-md: 0 4px 6px rgba(0,0,0,0.1)
```

### Using in Components
```typescript
// Import CSS
import './MyComponent.css'

// Use variables
const styles = {
  backgroundColor: 'var(--primary-blue)',
  padding: 'var(--spacing-md)'
}
```

### Responsive Breakpoints
```css
/* Mobile first - default styles */
.component {
  padding: var(--spacing-md);
}

/* Tablet and up (768px) */
@media (min-width: 768px) {
  .component {
    padding: var(--spacing-lg);
  }
}

/* Desktop and up (1024px) */
@media (min-width: 1024px) {
  .component {
    padding: var(--spacing-xl);
  }
}
```

---

## 📦 Dependencies Explained

| Package | Purpose |
|---------|---------|
| **react** | UI framework |
| **react-dom** | React to browser rendering |
| **react-router-dom** | Page navigation |
| **axios** | HTTP requests |
| **typescript** | Type checking |
| **recharts** | Data visualization charts |
| **react-chartjs-2** | Alternative charting |
| **chart.js** | Chart library |
| **date-fns** | Date formatting |
| **lucide-react** | Icon library |

---

## 📦 Available Scripts

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Run linter (if configured)
npm run lint
```

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot find module 'react'"
**Solution:**
```bash
npm install
```

### Issue: "REACT_APP_API_URL is not defined"
**Solution:**
```bash
# Check .env exists
cat .env

# Make sure it has:
# REACT_APP_API_URL=https://your-api-url/dev

# Restart dev server (IMPORTANT!)
npm start
```

### Issue: "API calls return 401 Unauthorized"
**Solution:**
- Check if you're logged in
- Try logging in again
- Check localStorage has token: `localStorage.getItem('token')`
- Verify `.env` has correct API URL

### Issue: "Port 3000 already in use"
**Solution:**
```bash
# Find process using port 3000
lsof -ti:3000

# Kill it
kill -9 <PID>

# Or use different port
PORT=3001 npm start
```

### Issue: "Photos don't upload"
**Solution:**
- Check file size < 5MB
- Check browser console for error
- Verify backend S3 credentials

### Issue: "Charts show 'No data'"
**Solution:**
- Need at least 2 symptom logs to show trends
- Log symptoms for 2+ days first
- Check backend returned data in Network tab (DevTools)

### Issue: "TypeScript errors"
**Solution:**
```bash
npm install --save-dev typescript @types/react @types/react-dom
npm start
```

### Issue: "Blank page or infinite redirect loop"
**Solution:**
1. Open browser console (F12)
2. Check for error messages
3. Most likely causes:
   - Missing dependencies: `npm install`
   - Missing .env: `cp .env.example .env`
   - Backend not running: Check API URL
   - Token expired: Log in again

---

## 📚 TypeScript Types

All types in `src/types/index.ts`:

```typescript
// User
interface User {
  id: number
  email: string
  zip_code: string
  created_at: string
}

// Pet
interface Pet {
  id: number
  user_id: number
  name: string
  species: string
  age?: number
  breed?: string
  created_at: string
}

// Symptom Log
interface SymptomLog {
  id: number
  pet_id: number
  log_date: string
  eye_symptoms: number
  fur_quality: number
  skin_irritation: number
  respiratory: number
  notes?: string
  photo_url?: string
  created_at: string
}

// Environmental Data
interface EnvironmentalData {
  id: number
  zip_code: string
  date: string
  tree_pollen: number
  grass_pollen: number
  weed_pollen: number
  air_quality: number
  created_at: string
}

// Correlation Analysis
interface CorrelationResult {
  status: string
  daysLogged: number
  petName: string
  correlations: {
    treeCorr: number
    grassCorr: number
    weedCorr: number
    topTrigger: string
    topTriggerValue: number
  }
  chartData: ChartDataPoint[]
  insights: {
    topTriggerInsight: string
    thresholdInsight: string
    actionRecommendation: string
  }
}

interface ChartDataPoint {
  date: string
  symptomSeverity: number
  pollenLevel: number
}
```

---

## 🔧 Development Tips

### Adding New Pages

1. Create component in `src/pages/MyNewPage.tsx`
2. Add route in `src/App.tsx`
3. Add navigation item in `src/components/layout/Navigation.tsx`
4. Create styles in `src/pages/styles/`

### API Calls

Always use service methods from `src/services/`:

```typescript
import { petService } from '../services/petService';

// Good ✅
const pets = await petService.getPets();

// Avoid ❌
const response = await fetch('/api/pets');
```

### Error Handling

```typescript
try {
  await petService.createPet(data);
  alert('Success!');
} catch (error) {
  console.error('Error:', error);
  alert('Failed. Please try again.');
}
```

### Changing Colors

Edit `src/index.css`:
```css
:root {
  --primary-blue: #YOUR_COLOR;
  /* Change any CSS variable */
}
```

---

## 🚀 Building for Production

### Create Optimized Build
```bash
npm run build
```

Output goes to `build/` directory.

### Deploy to Vercel
```bash
npx vercel
```

### Deploy to Netlify
```bash
npm run build
# Upload build/ to Netlify Dashboard
```

### Deploy to AWS S3 + CloudFront
```bash
npm run build
aws s3 sync build/ s3://your-bucket-name
```

---

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Run Specific Test
```bash
npm test -- Dashboard.test.tsx
```

### Generate Coverage Report
```bash
npm test -- --coverage
```

---

## 📞 Getting Help

1. **Check this README** - Most questions answered here
2. **Check browser console** - Error messages are logged
3. **Check Network tab** - See API responses
4. **Check main README** - Architecture overview
5. **Ask instructor** - Backend/AWS questions

---

## 🎓 Learning Resources

- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [React Router Docs](https://reactrouter.com)
- [Recharts Docs](https://recharts.org)
- [Axios Docs](https://axios-http.com)

---

## ✅ Pre-Launch Checklist

Before going live:
- [ ] Backend API is deployed and running
- [ ] `npm install` completed successfully
- [ ] `.env` file exists with correct API_URL
- [ ] Port 3000 is available
- [ ] Manual testing completed (see Testing Guide above)
- [ ] No errors in browser console
- [ ] All pages load correctly

---

**Happy coding! 🚀**
