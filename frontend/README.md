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

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- `.env` file with `REACT_APP_API_URL`

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env and add your backend API URL
# REACT_APP_API_URL=https://your-api-id.execute-api.us-east-2.amazonaws.com/dev

# Start development server
npm start
```

App opens automatically at `http://localhost:3000`

---

## 📁 Project Structure

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

### 7. **Register** (`/register`)
**What it does:**
- Create new account with email and ZIP code
- Backend creates user record
- Auto-login after registration
- Redirects to pet setup

**Code:** `src/pages/Register.tsx`

---

## 🔑 Environment Variables

Create `.env` file in `/frontend`:

```bash
# Required: Your backend API URL
REACT_APP_API_URL=https://your-api-id.execute-api.us-east-2.amazonaws.com/dev

# For local backend development:
# REACT_APP_API_URL=http://localhost:3000/dev
```

See `.env.example` for template.

---

## 🛠️ API Services

All services are in `src/services/`. They handle communication with the backend.

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

## 🐛 Common Issues & Solutions

### Issue: "Cannot GET /" after refresh
**Cause:** React Router not configured for production
**Solution:** Enable client-side routing on your hosting

### Issue: API calls return 401 Unauthorized
**Cause:** Token missing or expired
**Solution:**
- Check `.env` has correct API URL
- Check localStorage has token: `localStorage.getItem('token')`
- Try logging in again

### Issue: Photos don't upload
**Cause:** S3 permissions or file size issue
**Solution:**
- Check file size < 5MB
- Check browser console for error
- Verify backend S3 credentials

### Issue: Charts show "No data"
**Cause:** Need at least 2 data points
**Solution:** Log symptoms for 2+ days before viewing analysis

### Issue: Environment variables not loading
**Cause:** .env file not found or dev server not restarted
**Solution:**
- Ensure `.env` exists in `/frontend`
- Restart `npm start` after changing .env
- Check file is named exactly `.env` (not `.env.local`)

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

## 🔗 Component Communication

### State Management
- **Local state:** `useState` hooks in components
- **Prop drilling:** Pass data to child components
- **Context:** Could add for global state (auth, theme)

### Example: Dashboard fetching data
```typescript
const [pets, setPets] = useState<Pet[]>([])
const [loading, setLoading] = useState(true)

useEffect(() => {
  const loadPets = async () => {
    try {
      const data = await petService.getPets()
      setPets(data)
    } catch (error) {
      console.error('Failed to load pets:', error)
    } finally {
      setLoading(false)
    }
  }
  loadPets()
}, [])

if (loading) return <div>Loading...</div>
return <div>{pets.map(pet => <PetCard key={pet.id} pet={pet} />)}</div>
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

**Happy coding! 🚀**
