# Backend - Legal Metrology Compliance System

The backend provides the REST API, authentication, database management, image handling, validation pipeline, rule-based compliance evaluation, review functionality, and inspection report generation for the Legal Metrology Compliance System.

It is built using **FastAPI**, **PostgreSQL**, and **SQLAlchemy**.

## Backend Responsibilities

- User authentication
- Validation/inspection session management
- Image upload and storage
- Image processing
- Compliance validation
- Rule-based evaluation
- Validation result generation
- Processed image generation
- Review of validation results
- Inspection report data
- PDF report generation
- PostgreSQL persistence

## Technology Stack

- Python
- FastAPI
- PostgreSQL
- SQLAlchemy
- Pydantic
- JWT Authentication
- OpenCV
- REST API

## Architecture

```text
                    Client / Frontend
                           │
                           │ HTTP / REST
                           ▼
                    ┌───────────────┐
                    │    FastAPI    │
                    │      API      │
                    └───────┬───────┘
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
          ▼                 ▼                 ▼
   Authentication     Validation API      Image API
          │                 │                 │
          │                 ▼                 ▼
          │        Validation Pipeline    File Storage
          │                 │
          │       ┌─────────┴─────────┐
          │       │                   │
          │       ▼                   ▼
          │  Image Analysis      Rule Engine
          │       │                   │
          │       └─────────┬─────────┘
          │                 ▼
          │        Validation Results
          │                 │
          └─────────────────┼─────────────────┐
                            │                 │
                            ▼                 ▼
                       PostgreSQL        Report Service
                                              │
                                              ▼
                                         PDF Report
```

## Project Structure

```text
backend/
│
├── api/
│   └── v1/
│       ├── auth.py
│       ├── images.py
│       ├── validation.py
│       ├── review.py
│       └── reports.py
│
├── core/
├── db/
│   ├── base.py
│   └── session.py
│
├── models/
├── services/
│   └── validation_pipeline.py
├── ruleEngine/
├── uploads/
├── main.py
├── requirements.txt
└── README.md
```

## API Modules

### Authentication

Authentication endpoints are implemented in `api/v1/auth.py`.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticate user and obtain JWT token |
| `GET` | `/api/auth/me` | Get current authenticated user |

### Validation

Validation endpoints are implemented in `api/v1/validation.py`.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/validation/` | Create validation session |
| `GET` | `/api/validation/` | List validations |
| `GET` | `/api/validation/{validation_id}` | Get validation |
| `PUT` | `/api/validation/{validation_id}` | Update validation |
| `DELETE` | `/api/validation/{validation_id}` | Delete validation |
| `POST` | `/api/validation/{validation_id}/process` | Run validation pipeline |

A newly created validation starts with the status `PENDING`.

### Images

Image endpoints are implemented in `api/v1/images.py`.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/validation/{validation_id}/images` | Upload image |
| `GET` | `/api/validation/{validation_id}/images` | List images |
| `GET` | `/api/validation/{validation_id}/images/{image_id}` | Get image |
| `PUT` | `/api/validation/{validation_id}/images/{image_id}` | Update image |
| `DELETE` | `/api/validation/{validation_id}/images/{image_id}` | Delete image |

Supported image formats:

- JPEG
- PNG
- WebP

### Reports

Report functionality is implemented in `api/v1/reports.py`.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/validation/{validation_id}/report-data` | Get report data |
| `POST` | `/api/validation/{validation_id}/report` | Generate inspection report |
| `GET` | `/api/validation/{validation_id}/report` | Download PDF report |

### Review

Review functionality is implemented in `api/v1/review.py`.

The review API allows individual validation results to be reviewed with a decision and optional comment.

## Image Storage

Uploaded images are stored under their validation session:

```text
uploads/
└── <validation_id>/
    └── <generated_uuid>.<extension>
```

The original filename is retained in the database while the physical file is stored using a generated filename.

Uploaded files are exposed through:

```text
/uploads/
```

## Validation Pipeline

The main validation workflow is implemented in:

`services/validation_pipeline.py`

### Pipeline Flow

```text
Uploaded Image
      │
      ▼
Image Loading
      │
      ▼
Image Analysis
      │
      ▼
Validation Results
      │
      ▼
Rule Evaluation
      │
      ▼
Processed Image Generation
      │
      ▼
Overall Compliance Result
```

The pipeline produces:

- Validation ID
- Overall validation status
- Compliance score
- Rule-level validation results
- Processed images

## Rule Engine

The rule-based compliance logic is maintained in:

`ruleEngine/`

The rule engine evaluates package information and detected evidence against applicable Legal Metrology compliance requirements.

Rule-level results can contain:

- Rule identifier
- Field being validated
- Validation status
- Reason or explanation
- Evidence information

## Rule Database Seeding

The Legal Metrology compliance rules are stored in PostgreSQL and are used by the validation pipeline during inspection processing.

Before running inspections against a fresh database, the rule data must be seeded.

### Prerequisites

Before seeding:

1. PostgreSQL must be running.
2. The application database must exist.
3. Backend environment variables must be configured.
4. The Python virtual environment must be activated.
5. Backend dependencies must be installed.

### Seed Command

Run the project's rule seed script from the `backend` directory.

If the seed module is configured as a Python module:

```bash
python -m ruleEngine.seed_rules
```

If the seed file is a standalone script:

```bash
python ruleEngine/seed_rules.py
```

Use the command corresponding to the actual seed entry point in the project.

### Seeding Workflow

```text
PostgreSQL Database
        │
        ▼
Run Rule Seed Script
        │
        ▼
Legal Metrology Rules
        │
        ▼
Rules Stored in Database
        │
        ▼
Validation Pipeline
        │
        ▼
Applicable Rules Evaluated
```

### Important

Run the seed operation after setting up a new database and before starting inspections.

If the seed script is not idempotent, do not run it repeatedly against a database that already contains the rules, as duplicate records may be created.

After seeding, verify that the rules are available in PostgreSQL before running the validation pipeline.

## Validation Results

A validation produces an overall result and individual rule-level results.

Example overall result:

```json
{
  "validation_id": "uuid",
  "overall_status": "FAIL",
  "score": 58.33
}
```

Possible validation statuses include:

- `PASS`
- `FAIL`
- `REVIEW`
- `PENDING`

## Processed Images

The validation pipeline generates processed images containing visual annotations for detected validation evidence.

OpenCV is used to:

- Load the original image
- Draw validation regions
- Add labels
- Save the processed image

The processed image is then made available to the frontend for inspection review.

## Database

The backend uses **PostgreSQL** for persistent storage.

**SQLAlchemy** is used as the ORM.

Database configuration and session management are handled through:

```text
db/base.py
db/session.py
```

The database stores information related to:

- Users
- Validations
- Images
- Validation results
- Rules
- Reviews
- Reports

The exact database models are maintained inside the `models/` directory.

## Authentication Flow

```text
Login Request
     │
     ▼
POST /api/auth/login
     │
     ▼
JWT Access Token
     │
     ▼
Authenticated API Request
     │
     ▼
Authorization: Bearer <token>
     │
     ▼
Protected Endpoint
```

Protected resources verify the authenticated user before accessing validation data.

## CORS Configuration

The backend allows requests from the local frontend development server.

Default frontend origin:

```text
http://localhost:5173
```

CORS is configured in `main.py`.

## Static File Serving

Uploaded images are exposed using FastAPI `StaticFiles`.

```text
/uploads/
```

The `/uploads` URL is mapped to the backend's local `uploads` directory.

## Main Application

The FastAPI application is initialized in:

`main.py`

The application:

- Creates the FastAPI instance
- Configures CORS
- Mounts uploaded files
- Initializes database tables
- Registers API routers

Registered routers include:

- Authentication
- Images
- Validation
- Review
- Reports

## Installation

### Prerequisites

Install:

- Python 3
- PostgreSQL
- pip

### Create Virtual Environment

From the backend directory:

```bash
python -m venv venv
```

Windows:

```bash
venv\Scripts\activate
```

Linux/macOS:

```bash
source venv/bin/activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

## Environment Configuration

Configure the backend environment variables required by the application.

The configuration should include the PostgreSQL database connection and authentication/application settings used by the backend.

Do not commit database credentials, API keys, JWT secrets, or other sensitive configuration values to Git.

## Database Setup

Create a PostgreSQL database for the application.

Configure the backend database connection using the project's environment configuration.

When the FastAPI application starts, the application initializes the SQLAlchemy metadata required by the configured models.

After database setup, seed the Legal Metrology rules before running inspections.

## Running the Backend

Start the development server:

```bash
uvicorn main:app --reload
```

Backend:

```text
http://localhost:8000
```

Swagger API documentation:

```text
http://localhost:8000/docs
```

ReDoc documentation:

```text
http://localhost:8000/redoc
```

## Recommended Setup Order

For a fresh backend installation:

```bash
# 1. Navigate to backend
cd backend

# 2. Create virtual environment
python -m venv venv

# 3. Activate virtual environment
venv\Scripts\activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Configure PostgreSQL and backend environment variables

# 6. Seed Legal Metrology rules
python -m ruleEngine.seed_rules

# 7. Start FastAPI
uvicorn main:app --reload
```

## Complete API Workflow

```text
POST /api/auth/login
          │
          ▼
POST /api/validation/
          │
          ▼
POST /api/validation/{id}/images
          │
          ▼
POST /api/validation/{id}/process
          │
          ▼
Validation Pipeline
          │
          ▼
Validation Results
          │
          ▼
GET /api/validation/{id}/report-data
          │
          ▼
POST /api/validation/{id}/report
          │
          ▼
GET /api/validation/{id}/report
```

## Development

The backend follows a modular architecture separating API endpoints, database models, validation services, and rule evaluation.

```text
API Layer
   │
   ▼
Service Layer
   │
   ▼
Validation Pipeline / Rule Engine
   │
   ▼
Database + File Storage
```

This separation allows the validation engine, rule engine, database layer, and APIs to be developed independently.

## Future Improvements

- Expanded Legal Metrology rule coverage
- Improved image detection and OCR accuracy
- More advanced validation evidence handling
- Better duplicate detection for overlapping image annotations
- Comprehensive audit history
- Role-based access control
- Cloud-based image storage
- Production database migrations
- Production deployment and monitoring

## Backend Summary

The backend provides the complete processing layer for the Legal Metrology Compliance System.

It connects:

**Authentication → PostgreSQL → Image Processing → Rule Engine → Validation Pipeline → Review → Report Generation**
