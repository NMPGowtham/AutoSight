# Legal Metrology Compliance System

An AI-assisted compliance validation system for checking packaged commodities against the requirements of the **Legal Metrology (Packaged Commodities) Rules, 2011**.

The system allows users to upload package images, process them through a backend validation pipeline, evaluate applicable compliance rules, review validation results, and generate inspection reports.

## Features

- User authentication using JWT
- Create and manage inspection sessions
- Upload packaged-commodity images
- Image-based validation
- Rule-based compliance evaluation
- Compliance score and overall status
- Field-level validation results
- Processed images with validation annotations
- Inspection result review
- Automated inspection report generation
- PDF report download
- PostgreSQL database
- REST API based frontend-backend integration

## System Architecture

```text
User
  │
  ▼
React Frontend
  │
  │ REST API + JWT
  ▼
FastAPI Backend
  │
  ├── Authentication
  ├── Validation API
  ├── Image API
  ├── Review API
  └── Report API
          │
          ▼
   Validation Pipeline
          │
          ├── Image Analysis
          ├── Rule Engine
          └── Processed Images
          │
          ▼
      PostgreSQL
          │
          ▼
    PDF Report
```

## Project Structure

```text
project-root/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   └── ...
│   ├── .env
│   ├── package.json
│   └── README.md
│
├── backend/
│   ├── api/
│   │   └── v1/
│   │       ├── auth.py
│   │       ├── images.py
│   │       ├── validation.py
│   │       ├── review.py
│   │       └── reports.py
│   │
│   ├── core/
│   ├── db/
│   ├── models/
│   ├── services/
│   │   └── validation_pipeline.py
│   ├── ruleEngine/
│   ├── uploads/
│   ├── main.py
│   ├── requirements.txt
│   └── README.md
│
└── README.md
```

## Application Workflow

### 1. Authentication

The user logs into the application through the frontend.

```text
Login
  │
  ▼
POST /api/auth/login
  │
  ▼
JWT Access Token
  │
  ▼
GET /api/auth/me
  │
  ▼
Authenticated User
```

The JWT token is automatically attached to protected API requests.

### 2. Create Inspection

When a new inspection is started, the frontend creates a validation session.

```http
POST /api/validation/
```

The backend creates a validation record with an initial status of `PENDING`.

The returned `validation_id` identifies the inspection throughout the workflow.

### 3. Upload Package Image

The selected package image is uploaded using:

```http
POST /api/validation/{validation_id}/images
```

Supported image formats:

- JPEG
- PNG
- WebP

### 4. Process Validation

The frontend starts the validation pipeline using:

```http
POST /api/validation/{validation_id}/process
```

The pipeline produces validation results, compliance status, validation score, processed images, and rule-level explanations.

### 5. Review Results

The frontend displays:

- Overall validation status
- Compliance score
- Product information
- Package information
- Individual validation results
- Applicable rules
- Original images
- Processed images

### 6. Generate Report

An inspection report can be generated using:

```http
POST /api/validation/{validation_id}/report
```

The generated report can be retrieved using:

```http
GET /api/validation/{validation_id}/report
```

## Backend API

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticate user |
| `GET` | `/api/auth/me` | Get current authenticated user |

### Validation

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/validation/` | Create validation |
| `GET` | `/api/validation/` | List validations |
| `GET` | `/api/validation/{id}` | Get validation |
| `PUT` | `/api/validation/{id}` | Update validation |
| `DELETE` | `/api/validation/{id}` | Delete validation |
| `POST` | `/api/validation/{id}/process` | Run validation pipeline |

### Images

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/validation/{id}/images` | Upload image |
| `GET` | `/api/validation/{id}/images` | List images |
| `GET` | `/api/validation/{id}/images/{image_id}` | Get image |
| `PUT` | `/api/validation/{id}/images/{image_id}` | Update image |
| `DELETE` | `/api/validation/{id}/images/{image_id}` | Delete image |

### Reports

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/validation/{id}/report-data` | Get report data |
| `POST` | `/api/validation/{id}/report` | Generate report |
| `GET` | `/api/validation/{id}/report` | Download PDF report |

### Review

The review API allows validation results to be reviewed and decisions/comments to be submitted for individual validation results.

## Technology Stack

### Frontend

- React
- Vite
- Tailwind CSS
- Axios
- React Router
- Lucide React

### Backend

- Python
- FastAPI
- SQLAlchemy
- PostgreSQL
- JWT Authentication
- OpenCV

### Validation

- Image analysis
- Rule-based compliance engine
- Legal Metrology compliance rules
- Processed image generation

## Local Development

### Prerequisites

- Node.js
- npm
- Python 3
- PostgreSQL

## Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend: `http://localhost:8000`

FastAPI documentation: `http://localhost:8000/docs`

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Create `.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_USE_MOCK_API=false
```

Frontend: `http://localhost:5173`

## Frontend → Backend Integration

The frontend communicates with the backend through REST APIs using Axios.

Authenticated requests include:

```text
Authorization: Bearer <access_token>
```

Main frontend services include:

- `api.js`
- `authService.js`
- `inspectionService.js`

## Inspection Data Flow

```text
Create Validation
       │
       ▼
Upload Image
       │
       ▼
Start Processing
       │
       ▼
Validation Pipeline
       │
       ├── Image Analysis
       ├── Rule Evaluation
       └── Processed Image Generation
       │
       ▼
Validation Results
       │
       ▼
Inspection Result
       │
       ▼
Report Data
       │
       ▼
Generate PDF
```

## Image Handling

Uploaded images are stored according to their validation session and exposed through `/uploads/`.

Typical structure:

```text
uploads/
└── <validation_id>/
    └── <generated_image_name>.<extension>
```

## Compliance Results

Each validation produces rule-level results containing information such as:

- Rule identifier
- Field being validated
- Validation status
- Reason or explanation
- Evidence information

The inspection also produces an overall compliance status and score.

Possible validation states include:

- `PASS`
- `FAIL`
- `REVIEW`
- `PENDING`

## Reports

The report data contains information about:

- Inspection
- Product
- Package
- Images
- Validation results
- Applicable rules
- Inspection status
- Compliance score

The backend generates the final PDF report, which can be downloaded from the frontend.

## Security

The application uses authenticated API requests. Protected backend resources verify the authenticated user before allowing access to validation and inspection data.

The frontend stores the JWT access token and automatically attaches it to API requests through an Axios interceptor.

## Project Purpose

The system is designed to assist with the inspection of packaged commodities by combining image-based analysis, rule-based validation, persistent inspection records, and automated reporting.

The complete workflow is:

**Image Upload → Validation → Review → Compliance Report**
