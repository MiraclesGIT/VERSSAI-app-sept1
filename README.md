# 🚀 VERSSAI VC Intelligence Platform

A comprehensive AI-powered venture capital intelligence platform that combines founder signal analysis, due diligence automation, portfolio management, and fund assessment capabilities.

## 🏗️ Architecture Overview

VERSSAI consists of 6 core frameworks:

1. **Founder Signal Fit Framework** - AI-powered founder analysis and scoring
2. **Due Diligence Data Room Framework** - Automated document analysis and risk assessment
3. **Portfolio Management Framework** - Real-time portfolio monitoring and KPI tracking
4. **Fund Assessment & Backtesting Framework** - Historical performance analysis and simulation
5. **Fund Allocation & Deployment Framework** - Monte Carlo optimization and risk management
6. **Fund Vintage Management Framework** - Multi-fund performance comparison and LP reporting

## 🛠️ Technology Stack

### Backend
- **FastAPI** - High-performance Python web framework
- **PostgreSQL** - Primary relational database
- **MongoDB** - Document storage and caching
- **ChromaDB** - Vector database for RAG (Retrieval-Augmented Generation)
- **Google Gemini Pro** - AI analysis and document processing
- **LangGraph** - Workflow orchestration and AI agent management

### Frontend
- **React 19** - Modern React with hooks and context
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing

### Infrastructure
- **Docker & Docker Compose** - Containerization and orchestration
- **N8N** - Workflow automation and integration
- **ChromaDB** - Vector database for semantic search

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- Docker & Docker Compose
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd VERSSAI-engineAug10
```

### 2. Run Setup Script
```bash
./setup.sh
```

This script will:
- Create necessary directories
- Set up environment configuration files
- Install dependencies
- Generate secure secrets
- Validate system requirements

### 3. Configure Environment Variables

#### Backend Configuration (`backend/.env`)
```bash
# Copy template and configure
cp backend/env.template backend/.env

# Edit with your actual values
nano backend/.env
```

**Required API Keys:**
- `GEMINI_API_KEY` - Google Gemini Pro API key
- `OPENAI_API_KEY` - OpenAI API key (fallback)
- `GOOGLE_API_KEY` - Google Custom Search API key
- `TWITTER_BEARER_TOKEN` - Twitter API bearer token

#### Frontend Configuration (`frontend/.env`)
```bash
# Copy template and configure
cp frontend/env.template frontend/.env

# Edit with your actual values
nano frontend/.env
```

#### Docker Configuration (`.env`)
```bash
# Copy template and configure
cp docker.env .env

# Edit with your actual values
nano .env
```

### 4. Start Services

#### Start Infrastructure Services
```bash
docker-compose up -d
```

This starts:
- PostgreSQL database
- ChromaDB vector database
- N8N workflow automation

#### Start Backend
```bash
cd backend
python3 server.py
```

#### Start Frontend
```bash
cd frontend
npm start
```

### 5. Access the Platform

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **N8N Workflows**: http://localhost:5678

## 🔧 Configuration

### Environment Variables

#### Backend (`.env`)
| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_URL` | PostgreSQL connection string | `postgresql://verssai_user:password@localhost:5432/verssai_vc` |
| `MONGO_URL` | MongoDB connection string | `mongodb://localhost:27017/verssai` |
| `GEMINI_API_KEY` | Google Gemini Pro API key | Required |
| `GOOGLE_API_KEY` | Google Custom Search API key | Required |
| `TWITTER_BEARER_TOKEN` | Twitter API bearer token | Required |
| `UPLOAD_PATH` | File upload directory | `/app/uploads` |
| `CORS_ORIGINS` | Allowed CORS origins | `http://localhost:3000,http://localhost:3001` |

#### Frontend (`.env`)
| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_BACKEND_URL` | Backend API URL | `http://localhost:8000` |
| `REACT_APP_API_VERSION` | API version | `v1` |

#### Docker (`.env`)
| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_PASSWORD` | PostgreSQL password | `verssai_secure_password_2024` |
| `N8N_BASIC_AUTH_PASSWORD` | N8N admin password | `verssai_n8n_2024` |

## 🧪 Testing

### Run Backend Tests
```bash
cd backend
python3 -m pytest tests/
```

### Run Frontend Tests
```bash
cd frontend
npm test
```

### Run Stress Tests
```bash
python3 stress_test_runner.py
```

## 🚨 Security Considerations

### Production Deployment
1. **Change Default Passwords**: Update all default passwords in `.env` files
2. **Secure API Keys**: Use environment-specific API keys
3. **HTTPS**: Enable HTTPS in production
4. **CORS**: Restrict CORS origins to your domain
5. **Database Security**: Use strong database passwords and network isolation
6. **Secrets Management**: Use proper secrets management (e.g., Kubernetes secrets, AWS Secrets Manager)

### Environment Variables
- Never commit `.env` files to version control
- Use different API keys for development and production
- Rotate API keys regularly
- Monitor API usage and set rate limits

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Errors
```bash
# Check PostgreSQL status
docker-compose ps postgres

# Check logs
docker-compose logs postgres

# Restart service
docker-compose restart postgres
```

#### API Key Issues
```bash
# Check environment variables
cd backend
python3 -c "import os; print('GEMINI_API_KEY:', bool(os.environ.get('GEMINI_API_KEY')))"
```

#### Port Conflicts
```bash
# Check port usage
lsof -i :8000  # Backend
lsof -i :3000  # Frontend
lsof -i :5432  # PostgreSQL
```

### Logs
- **Backend**: Check `backend/logs/` directory
- **Docker**: `docker-compose logs [service-name]`
- **Frontend**: Check browser console

## 📚 API Documentation

### Core Endpoints

#### Founder Signal Analysis
```http
POST /api/founder-signal/analyze
Content-Type: multipart/form-data

file: [pitch_deck.pdf]
company_name: "Example Corp"
```

#### Due Diligence
```http
POST /api/due-diligence/upload
Content-Type: multipart/form-data

files: [document1.pdf, document2.pdf]
company_name: "Example Corp"
```

#### Portfolio Management
```http
GET /api/portfolio/companies
GET /api/portfolio/performance
POST /api/portfolio/companies
```

### Authentication
Currently, the platform uses basic authentication. JWT-based authentication is planned for future releases.

## 🔄 Development Workflow

### Code Structure
```
VERSSAI-engineAug10/
├── backend/                 # FastAPI backend
│   ├── ai_agents.py        # AI agent implementations
│   ├── database.py         # Database models and connections
│   ├── rag_service.py      # RAG system implementation
│   ├── server.py           # Main FastAPI application
│   └── requirements.txt    # Python dependencies
├── frontend/               # React frontend
│   ├── src/               # Source code
│   ├── package.json       # Node.js dependencies
│   └── public/            # Static assets
├── tests/                  # Test files
├── docker-compose.yml      # Service orchestration
└── setup.sh               # Setup script
```

### Adding New Features
1. Create feature branch: `git checkout -b feature/new-feature`
2. Implement changes following existing patterns
3. Add tests for new functionality
4. Update documentation
5. Submit pull request

## 📊 Performance Monitoring

### Metrics to Monitor
- API response times
- Database query performance
- AI processing latency
- Memory and CPU usage
- File upload/download speeds

### Monitoring Tools
- Built-in FastAPI metrics
- Docker resource monitoring
- Application logging
- Performance testing scripts

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### Code Standards
- Follow PEP 8 for Python code
- Use ESLint for JavaScript/React code
- Write comprehensive tests
- Document new features
- Follow existing naming conventions

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For support and questions:
- Check the troubleshooting section
- Review API documentation
- Check existing issues
- Contact the development team

---

**⚠️ Important**: This is a development version. Do not use in production without proper security review and configuration.
