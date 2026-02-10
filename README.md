# Kirazee Role-Based SuperAdmin Dashboard

A full-stack web application implementing role-based access control for the Kirazee platform administrative interface.

## Project Structure

```
kirazee-rbac-dashboard/
├── backend/                    # Django REST API
│   ├── api/                   # Main API app
│   │   ├── tests/            # Backend tests
│   │   ├── models.py         # Data models
│   │   ├── views.py          # API views
│   │   └── urls.py           # API routes
│   ├── kirazee_dashboard/    # Django project settings
│   │   ├── settings.py       # Configuration
│   │   ├── urls.py           # Root URL config
│   │   └── wsgi.py           # WSGI application
│   ├── manage.py             # Django management script
│   ├── requirements.txt      # Python dependencies
│   └── pytest.ini            # Pytest configuration
│
├── frontend/                  # React app
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   ├── contexts/         # React contexts
│   │   ├── utils/            # Utility functions
│   │   ├── types/            # Constants and types
│   │   ├── tests/            # Frontend tests
│   │   ├── App.jsx           # Main app component
│   │   └── main.jsx          # Entry point
│   ├── package.json          # Node dependencies
│   └── vite.config.js        # Vite configuration
│
└── .kiro/specs/              # Feature specifications
    └── kirazee-rbac-dashboard/
        ├── requirements.md   # Requirements document
        ├── design.md         # Design document
        └── tasks.md          # Implementation tasks
```

## Technology Stack

### Backend
- **Django 4.2.7** - Web framework
- **Django REST Framework 3.14.0** - REST API toolkit
- **PyJWT 2.8.0** - JWT token handling
- **bcrypt 4.1.2** - Password hashing
- **pytest 7.4.3** - Testing framework
- **hypothesis 6.92.1** - Property-based testing

### Frontend
- **React 18.2.0** - UI library
- **Vite 5.0.7** - Build tool
- **React Router 6.20.0** - Routing
- **Axios 1.6.2** - HTTP client
- **Vitest 1.0.4** - Testing framework
- **fast-check 3.15.0** - Property-based testing

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Run migrations:
   ```bash
   python manage.py migrate
   ```

6. Start the development server:
   ```bash
   python manage.py runserver
   ```

   The backend API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:3000`

## Running Tests

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Development Workflow

This project follows a spec-driven development approach:

1. **Requirements** - Defined in `.kiro/specs/kirazee-rbac-dashboard/requirements.md`
2. **Design** - Detailed in `.kiro/specs/kirazee-rbac-dashboard/design.md`
3. **Tasks** - Implementation plan in `.kiro/specs/kirazee-rbac-dashboard/tasks.md`

Follow the tasks sequentially to build the complete application.

## User Roles

The system supports six distinct user roles:

1. **Super_Admin** - Full access to all features
2. **Manager** - Business operations and order management
3. **Support** - Customer service and order status
4. **KYC_Associate** - Verification processes
5. **CA_Finance** - Financial reports and analytics
6. **Developer** - System logs and technical metrics

## Sample Credentials (for testing)

These will be available once the authentication system is implemented:

- Super Admin: `superadmin` / `admin123`
- Manager: `manager` / `manager123`
- Support: `support` / `support123`
- KYC Associate: `kyc` / `kyc123`
- Finance: `finance` / `finance123`
- Developer: `developer` / `dev123`

## API Documentation

API endpoints will be documented as they are implemented. The base URL for all API endpoints is `http://localhost:8000/api/`

## License

This is a prototype implementation for demonstration purposes.
