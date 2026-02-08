# 🐾 Pollen Paw

**A pet health tracking app that correlates your pet's symptoms with environmental pollen levels.**

Track your pet's health, understand their allergies, and get AI-powered insights to help them feel better.

---

## 🎯 What is Pollen Paw?

Pollen Paw helps pet owners monitor their pet's symptoms and understand how environmental factors (especially pollen) affect their health. By logging daily symptoms and comparing them with real environmental data, you can:

- **Identify allergen triggers** - See which pollen types affect your pet the most
- **Track patterns** - Understand seasonal trends and symptom severity
- **Get recommendations** - Receive AI-powered health insights
- **Share with vets** - Export data for veterinary appointments

---

## ✨ Key Features

- **📊 Symptom Tracking** - Log daily symptoms (eye irritation, fur quality, skin irritation, respiratory issues)
- **📷 Photo Documentation** - Attach photos to symptom logs for visual reference
- **📈 Correlation Analysis** - View interactive charts showing symptom-pollen relationships
- **🧠 AI Insights** - Get personalized health recommendations
- **🐱 Multi-Pet Support** - Track multiple pets in one account
- **📱 Responsive Design** - Works seamlessly on desktop and mobile
- **🔐 Secure Authentication** - JWT-based user authentication

---

## 🏗️ Project Architecture

```
Pollen Paw
├── Frontend (React + TypeScript)
│   ├── Local development: localhost:3000
│   ├── Dashboard, Symptom logging, Analysis, AI Insights
│   └── Responsive UI with Recharts visualizations
│
├── Backend (Node.js + TypeScript)
│   ├── AWS Lambda serverless functions
│   ├── RDS PostgreSQL database
│   ├── S3 for photo storage
│   └── Real environmental data API integration
│
└── Database (PostgreSQL on RDS)
    ├── Users, Pets, Symptoms
    ├── Environmental data (pollen, air quality)
    └── Correlations & insights
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and npm
- **.env file** with backend API URL (see setup below)
- **Backend running** on AWS (provided separately)

### Installation & Setup

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd pollen-paw

# 2. Install frontend dependencies
cd frontend
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env and add your backend API URL (provided by instructor)

# 4. Start the development server
npm start
```

The app will open at **http://localhost:3000**

---

## 📖 Documentation

### For Frontend Developers
**→ See [`frontend/README.md`](./frontend/README.md)**

Detailed guide including:
- Installation steps
- Project structure
- All 7 pages explained
- API service layer documentation
- Code examples
- Testing guide
- Troubleshooting
- Deployment options

### For Backend/Infrastructure
- Backend and database documentation provided separately
- API endpoints overview below

---

## 📋 How to Use Pollen Paw

### 1. Register & Login
- Sign up with your email and ZIP code
- Login with your email (no password for demo)

### 2. Add Your Pet
- Go to **Pet Profile** 
- Add pet information (name, species, age, breed)

### 3. Log Daily Symptoms
- Click **Log Symptoms**
- Select your pet
- Rate 4 symptom categories (1-5 scale)
- Optionally upload a photo
- Save

### 4. View Dashboard
- See pollen levels and symptom averages
- View recent symptom logs with photos
- Quick statistics

### 5. Analyze Correlations
- Go to **Analysis**
- View interactive chart showing symptoms vs pollen over time
- See correlation coefficients (r-values)
- Identify top trigger allergens

### 6. Get AI Insights
- Go to **AI Insights**
- View personalized health patterns
- Get recommendations for managing allergies
- Share findings with your vet

---

## 📁 Project Structure

### Frontend (`/frontend`)

```
src/
├── components/          # Reusable UI components
│   └── layout/         # Header, Navigation, Layout wrapper
├── pages/              # Full page components
│   ├── Dashboard.tsx   # Home screen with stats
│   ├── LogSymptoms.tsx # Symptom entry form
│   ├── Analysis.tsx    # Correlation chart
│   ├── AIInsights.tsx  # AI recommendations
│   ├── PetProfile.tsx  # Pet management
│   ├── Login.tsx       # Authentication
│   └── Register.tsx    # Sign up
├── services/           # API communication
│   ├── api.ts          # Axios setup
│   ├── authService.ts  # Auth endpoints
│   ├── petService.ts   # Pet endpoints
│   └── symptomService.ts # Symptom endpoints
├── types/              # TypeScript definitions
│   └── index.ts        # All interfaces
├── App.tsx             # Main app with routing
└── index.tsx           # Entry point
```

### Backend (AWS - Provided)

```
backend/
├── src/handlers/       # Lambda function handlers
│   ├── auth/          # Login, Register
│   ├── pets/          # CRUD operations
│   ├── symptoms/      # Symptom logging
│   ├── environmental/ # Pollen data
│   ├── insights/      # Correlation analysis
│   └── upload/        # Photo upload
├── src/services/      # Business logic
├── database/          # SQL schemas & migrations
└── serverless.yml     # AWS configuration
```

---

## 🔧 Technologies Used

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **React Router v6** - Navigation
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **Lucide React** - Icons
- **CSS3** - Responsive styling

### Backend
- **Node.js + TypeScript** - Runtime & language
- **AWS Lambda** - Serverless compute
- **PostgreSQL (RDS)** - Database
- **AWS S3** - Photo storage
- **JWT** - Authentication
- **Axios** - External API calls

---

## 📊 Data Flow

```
User Action (Frontend)
    ↓
HTTP Request (Axios)
    ↓
AWS API Gateway
    ↓
Lambda Function (Backend)
    ↓
RDS Database / External APIs
    ↓
Response → Frontend
    ↓
Display in React Component
```

**Example: Logging a symptom**
1. User fills form and clicks "Save"
2. Frontend calls `symptomService.createSymptom(data)`
3. Data sent to backend `/symptoms` endpoint
4. Lambda function validates and inserts into PostgreSQL
5. Photo uploaded to S3 if provided
6. Success response returns to frontend
7. Dashboard updates with new entry

---

## 🔐 Authentication & Security

- **Email-based login** (no password for demo simplicity)
- **JWT tokens** stored in browser localStorage
- **Token validation** on every API request
- **Protected routes** - Automatic redirect to login if unauthorized
- **CORS enabled** on backend for secure cross-origin requests

---

## 📱 API Endpoints Overview

All endpoints require JWT token in header: `Authorization: Bearer <token>`

### Authentication
- `POST /auth/login` - Login with email
- `POST /auth/register` - Create account

### Pets
- `GET /pets` - Get all user's pets
- `POST /pets` - Create new pet
- `PUT /pets/{id}` - Update pet info
- `DELETE /pets/{id}` - Delete pet

### Symptoms
- `GET /symptoms` - Get symptom logs
- `POST /symptoms` - Create symptom log
- `PUT /symptoms/{id}` - Update log
- `DELETE /symptoms/{id}` - Delete log
- `POST /upload` - Upload photo to S3

### Environmental Data
- `GET /pollen` - Get current pollen data
- `GET /air-quality` - Get air quality data

### Insights
- `GET /correlation/{petId}` - Get symptom-pollen correlation

---

## 🎨 UI/UX Design

- **Mobile-first responsive design** - Works on all devices
- **Accessibility** - Clear labels, good contrast, keyboard navigation
- **Consistent styling** - CSS variables for colors and spacing
- **Interactive charts** - Hover for details, responsive sizing
- **Intuitive navigation** - Bottom nav for main pages, clear icons

---

## 📚 Additional Documentation

- **Frontend Setup & Development** → [`frontend/README.md`](./frontend/README.md)
- **Backend Testing** → See backend docs for testing instructions
- **Environment Variables** → See `.env.example` in `/frontend`

---

## 👥 Team & Credits

**Developed by:** Gina Song

**Supervisor/Instructor:** [Professor Name]

**Technologies:** React, Node.js, AWS, PostgreSQL

---

## 📄 License

MIT License - Free to use for learning and demonstration purposes.

---

## 💡 Next Steps & Future Enhancements

**Potential improvements:**
- Push notifications for high pollen days
- Weather integration
- Social sharing of insights
- Prescription tracking
- Vet appointment scheduling
- Mobile app (React Native)
- Multiple location tracking
- Breed-specific recommendations
- Seasonal pattern analysis

---

## 🆘 Need Help?

1. **Frontend questions** → Check [`frontend/README.md`](./frontend/README.md)
2. **See detailed docs** → Navigate to that section for comprehensive guides
3. **Browser console** → Look for error messages
4. **Network tab** → Check API responses (F12 → Network tab)
5. **Ask instructor** → Backend/AWS configuration questions

---

## ✅ Quick Checklist

Before using:
- [ ] Node.js 18+ installed
- [ ] Backend API URL obtained from instructor
- [ ] Frontend installed: `npm install` in `/frontend`
- [ ] Environment configured: `.env` file created
- [ ] Backend running and accessible

---

**Happy pet health tracking! 🐾**
