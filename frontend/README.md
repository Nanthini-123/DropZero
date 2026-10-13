# DropZero — Frontend

DropZero is a Student Success Intelligence and Dropout Early-Warning platform. It combines machine learning risk forecasting with interactive intervention tracking for academic advisors.

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   Ensure `.env.local` exists with:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Build for production**:
   ```bash
   npm run build
   ```

## Key Features

- **Cohort Intelligence Dashboard**: Real-time KPI metrics and priority tracking.
- **Student Directory**: Search and filter students by department and risk level.
- **Intervention Priority Queue**: Flagged cohort members needing proactive support.
- **Live Intervention Simulator**: Test hypothetical interventions via the real ML backend.
- **Model Transparency**: Full breakdown of model metrics and feature importance.
