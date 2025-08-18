# VERSSAI Professional Frontend

This is the React frontend for the VERSSAI VC Intelligence Platform.

## Features

- Professional VC interface matching industry standards
- Real-time academic intelligence integration
- Complete deal analysis with research backing
- Expert advisor recommendations
- Market validation insights

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Make sure the backend is running on port 8080:
   ```bash
   python3 backend/complete_verssai_backend.py
   ```

## API Integration

The frontend automatically connects to the VERSSAI backend API at http://localhost:8080

Available endpoints:
- GET /api/deals - Get all deals
- GET /api/academic/stats - Get academic platform statistics  
- GET /api/academic/validate-founder - Validate founder credentials
- GET /api/deals/{id}/complete-academic-analysis - Get complete deal analysis

## Building for Production

```bash
npm run build
```
