# 🐾 Pollen Paw Frontend

A React-based frontend application for tracking pet health symptoms in correlation with environmental data (pollen levels, air quality).

---

## 📋 Features

- ✅ **User Authentication** (Email-based, JWT Token)
- ✅ **Pet Profile Management** (Add, edit multiple pets)
- ✅ **Symptom Logging** (Track daily symptoms with photos)
- ✅ **Dashboard** (View statistics and trends)
- ✅ **Correlation Analysis** (Symptoms vs Pollen levels)
- ✅ **AI Insights** (Health recommendations)
- ✅ **Responsive Design** (Mobile-friendly)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Backend API running (see `pollen-paw-backend`)

### Installation

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env and set REACT_APP_API_URL to your backend API URL

# 4. Start development server
npm start
```

The app will open at `http://localhost:3000`

---

## 📁 Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── layout/          # Header, Navigation, Layout
│   │   ├── common/          # Buttons, Inputs, Cards
│   │   ├── dashboard/       # Dashboard-specific components
│   │   ├── symptoms/        # Symptom logging components
│   │   ├── analysis/        # Analysis components
│   │   ├── insights/        # AI Insights components
│   │   └── profile/         # Pet Profile components
│   ├── pages/               # Page-level components
│   │   ├── Dashboard.tsx    # Home screen
│   │   ├── LogSymptoms.tsx  # Symptom logging page
│   │   ├── Analysis.tsx     # Correlation analysis
│   │   ├── AIInsights.tsx   # AI-generated insights
│   │   ├── PetProfile.tsx   # Pet & account management
│   │   ├── Login.tsx        # Login page
│   │   └── Register.tsx     # Registration page
│   ├── services/            # API service layers
│   │   ├── api.ts           # Axios configuration
│   │   ├── authService.ts   # Authentication API
│   │   ├── petService.ts    # Pet management API
│   │   └── symptomService.ts # Symptom logging API
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts         # All interface definitions
│   ├── App.tsx              # Main App component with routing
│   ├── App.css              # App-level styles
│   ├── index.tsx            # Application entry point
│   └── index.css            # Global styles
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔑 Key Technologies

- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **Lucide React** - Icon library
- **CSS3** - Styling (CSS Variables, Flexbox, Grid)

---

## 🎨 Design System

### Color Palette

- **Primary Blue**: `#4A90FF` - Main brand color
- **Success Green**: `#10B981` - Positive actions
- **Warning Orange**: `#F59E0B` - Alerts
- **Error Red**: `#EF4444` - Errors
- **Gray Scale**: `#F9FAFB` to `#111827` - UI elements

### Typography

- **Headings**: System fonts (SF Pro, Segoe UI, Roboto)
- **Body**: 16px base size, 1.6 line-height
- **Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

---

## 🔐 Authentication Flow

1. **Register** (`/register`):
   - User provides email and ZIP code
   - Backend creates user account
   - Auto-login after registration

2. **Login** (`/login`):
   - User provides email (no password for demo)
   - Backend returns JWT token
   - Token stored in localStorage

3. **Protected Routes**:
   - All main pages require authentication
   - Automatic redirect to login if no token
   - Token included in all API requests

---

## 📱 Pages Overview

### 1. Dashboard (`/`)
- Welcome card with user info
- Statistics cards (days logged, avg pollen, avg symptoms)
- Pollen levels visualization
- Recent symptom photos
- Quick access to log symptoms

### 2. Log Symptoms (`/log-symptoms`)
- Pet selector
- Photo upload
- Symptom sliders (Eye, Fur, Skin, Respiratory)
- Additional notes field
- Save button

### 3. Analysis (`/analysis`)
- Date range selector
- Correlation chart (Symptoms vs Pollen)
- Top trigger identification
- Photo comparison (low vs high pollen days)

### 4. AI Insights (`/ai-insights`)
- Time range selector (30 days, 7 days, all time)
- Key insights card
- Pattern detection
- Personalized recommendations
- Share with vet functionality

### 5. Pet Profile (`/pet-profile`)
- Pet list with edit functionality
- Add new pet button
- Pet information form (name, type, age, breed)
- Account settings (email, ZIP code)
- Save changes button

---

## 🛠️ API Integration

### Base Configuration

```typescript
// src/services/api.ts
const API_BASE_URL = process.env.REACT_APP_API_URL;

// All requests automatically include:
// - Authorization: Bearer <token>
// - Content-Type: application/json
```

### Service Methods

```typescript
// Authentication
authService.login({ email })
authService.register({ email, zip_code })
authService.logout()
authService.isAuthenticated()

// Pets
petService.getPets()
petService.createPet(data)
petService.updatePet(id, data)
petService.deletePet(id)

// Symptoms
symptomService.getSymptoms(petId?)
symptomService.createSymptom(data)
symptomService.uploadPhoto(file)
```

---

## 🎯 Environment Variables

Create a `.env` file:

```bash
# Required: Your backend API URL
REACT_APP_API_URL=https://your-api-id.execute-api.us-east-2.amazonaws.com/dev

# For local development:
# REACT_APP_API_URL=http://localhost:3000/dev
```

---

## 📦 Available Scripts

```bash
# Start development server
npm start

# Build for production
npm build

# Run tests
npm test

# Eject configuration (one-way operation)
npm run eject
```

---

## 🔧 Development Tips

### Adding New Pages

1. Create component in `src/pages/`
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

---

## 🚨 Common Issues

### 1. CORS Errors

**Problem**: `Access-Control-Allow-Origin` error

**Solution**: Ensure your backend has CORS enabled in `serverless.yml`:
```yaml
cors: true
```

### 2. 401 Unauthorized

**Problem**: "No authorization header provided"

**Solution**: 
- Check if logged in
- Token might be expired (login again)
- Verify `authService.isAuthenticated()` returns `true`

### 3. API URL Not Found

**Problem**: "Network Error" or "Failed to fetch"

**Solution**:
- Check `.env` file exists
- Verify `REACT_APP_API_URL` is correct
- Restart development server after .env changes

---

## 🎨 Styling Guidelines

### CSS Variables

Use CSS variables from `index.css`:

```css
.my-component {
  color: var(--primary-blue);
  padding: var(--spacing-md);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-md);
}
```

### Responsive Design

Mobile-first approach:

```css
/* Mobile styles (default) */
.component {
  padding: var(--spacing-md);
}

/* Tablet and up */
@media (min-width: 768px) {
  .component {
    padding: var(--spacing-lg);
  }
}
```

---

## 📚 TypeScript Types

All types are defined in `src/types/index.ts`:

```typescript
import { Pet, Symptom, User } from '../types';

const myPet: Pet = {
  id: 1,
  user_id: 1,
  name: 'Buddy',
  species: 'Dog',
  // ...
};
```

---

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

Output in `build/` directory.

### Deploy to Vercel

```bash
npx vercel
```

### Deploy to Netlify

```bash
npm run build
# Upload build/ directory to Netlify
```

### Deploy to AWS S3 + CloudFront

```bash
npm run build
aws s3 sync build/ s3://your-bucket-name
```

---

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

---

## 📄 License

MIT License - Feel free to use this project for learning and demos.

---

## 📞 Support

For issues or questions:
1. Check this README
2. Review `IMPLEMENTATION_GUIDE.md` in the backend
3. Check browser console for errors
4. Verify backend is running and accessible

---

**Happy coding!** 🎉
