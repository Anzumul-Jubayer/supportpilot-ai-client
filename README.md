# SupportPilot AI — Intelligent Customer Support Platform

**AI-powered customer support. Smarter ticket management. Faster resolutions.**

SupportPilot AI is a full-stack customer support management platform designed to help support teams manage customer requests, organize tickets, monitor agent performance, and improve response efficiency with AI-powered ticket analysis.

Built with **Next.js, TypeScript, Node.js, Express, PostgreSQL, Prisma, and Google Gemini AI**, the platform provides role-based access, secure authentication, ticket workflows, agent management, analytics, and AI-generated support suggestions.

🌐 **Live Application:** https://supportpilot-ai-client.vercel.app  
⚙️ **Backend API:** https://supportpilot-ai-g2xp.onrender.com  
📚 **API Documentation:** https://supportpilot-ai-g2xp.onrender.com/api-docs

---

## ✨ Key Features

### 🤖 AI-Powered Ticket Analysis

Integrates Google Gemini AI to help support teams understand and respond to customer tickets more efficiently.

- Automatically identifies ticket categories.
- Recommends ticket priority.
- Generates concise ticket summaries.
- Suggests professional customer replies.
- Stores AI-generated analysis for future reference.
- Preserves the original ticket priority while storing AI recommendations separately.

### 🎫 Ticket Management

A complete ticket workflow for customer support operations.

- Create and submit support tickets.
- View ticket details and descriptions.
- Track ticket status.
- Manage ticket priorities.
- Assign tickets to support agents.
- Add comments and communicate through ticket discussions.
- Filter and paginate ticket lists.
- View tickets according to user permissions.

### 👥 Role-Based Access Control

Three user roles with different permissions:

| Role | Permissions |
|---|---|
| Customer | Create tickets, view personal tickets, and communicate through comments. |
| Support Agent | Manage assigned tickets and assist customers. |
| Administrator | Manage users, agents, tickets, assignments, and platform operations. |

### 🔐 Authentication & Security

- Email and password authentication.
- Secure password hashing with bcrypt.
- JWT-based authentication.
- Google OAuth authentication.
- Protected API routes.
- Role-based authorization.
- Server-side user verification.
- Input validation with Zod.

### 📊 Dashboard & Analytics

Provides operational insights for support teams.

- Overview of support activity.
- Ticket statistics.
- Ticket status breakdown.
- User and agent statistics for administrators.
- Agent workload overview.
- Support performance monitoring.

### 🧑‍💼 User & Agent Management

Administrative tools for managing the support team.

- View registered users.
- Filter users by role.
- Update eligible user roles.
- View available support agents.
- Assign tickets to agents.
- Monitor agent workloads and ticket progress.

### 📱 Responsive Interface

- Modern dashboard interface.
- Responsive layouts.
- Organized navigation.
- Dedicated authentication pages.
- User-friendly ticket management screens.
- Role-specific dashboard experiences.

---

## 🛠️ Technology Stack

### Frontend

| Technology | Purpose |
|---|---|
| Next.js 16 | React framework and application routing |
| React | Component-based user interface |
| TypeScript | Type safety |
| Tailwind CSS | Responsive styling |
| Axios | API communication |
| TanStack Query | Server-state management |
| React Hook Form | Form handling |
| Zod | Client-side validation |
| Lucide React | Interface icons |

### Backend

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js 5 | REST API development |
| TypeScript | Type-safe backend development |
| PostgreSQL | Relational database |
| Prisma ORM 7 | Database access and migrations |
| Zod | Request validation |
| JWT | Authentication |
| bcryptjs | Password hashing |
| Google Gemini AI | AI-powered ticket analysis |

### Testing & Deployment

| Technology | Purpose |
|---|---|
| Vitest | Backend unit testing |
| Supertest | API testing |
| Swagger | API documentation |
| Git & GitHub | Version control |
| Vercel | Frontend deployment |
| Render | Backend deployment |
| Neon | Managed PostgreSQL database |

---

## 🏗️ System Architecture

SupportPilot AI follows a client-server architecture.

```text
                  CUSTOMER / AGENT / ADMIN
                            |
                            v
                 Next.js Frontend
                 (Vercel Deployment)
                            |
                            v
                  Axios API Client
                            |
                            v
                 Express REST API
                 (Render Deployment)
                            |
             +--------------+--------------+
             |              |              |
             v              v              v
         Authentication   Ticket       Dashboard
           & Users       Management    & Analytics
             |              |              |
             +--------------+--------------+
                            |
                            v
                      Prisma ORM
                            |
                            v
                     PostgreSQL
                     (Neon Database)

                            |
                            v
                    Google Gemini AI
                  (Ticket Analysis)
```

---

## 📁 Project Structure

The frontend and backend are maintained as separate projects.

### Backend

```text
supportpilot-ai/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── config/
│   ├── lib/
│   ├── modules/
│   │   ├── auth/
│   │   ├── ai/
│   │   ├── dashboard/
│   │   ├── tickets/
│   │   └── users/
│   └── server.ts
├── generated/
├── prisma.config.ts
├── package.json
└── tsconfig.json
```

### Frontend

```text
supportpilot-ai-client/
├── app/
│   ├── (auth)/
│   └── (dashboard)/
├── components/
├── hooks/
├── lib/
├── public/
├── package.json
└── tsconfig.json
```

*The structure above is a high-level overview; actual route-group and component names may vary.*

---

## 🚀 Getting Started

Follow these steps to run SupportPilot AI locally.

### Prerequisites

Make sure you have installed:

- Node.js 22 or later
- npm
- PostgreSQL database or Neon account
- Git

### 1. Clone the repositories

**Backend**

```bash
git clone YOUR_BACKEND_REPOSITORY_URL
cd supportpilot-ai
npm install
```

**Frontend**

```bash
git clone YOUR_FRONTEND_REPOSITORY_URL
cd supportpilot-ai-client
npm install
```

Replace the repository URLs with your actual GitHub repository URLs.

### 2. Configure the Backend

Create a `.env` file in the backend root directory.

```env
PORT=5000
DATABASE_URL="YOUR_DATABASE_CONNECTION_STRING"
DATABASE_URL_UNPOOLED="YOUR_DIRECT_DATABASE_CONNECTION_STRING"
JWT_SECRET="YOUR_SECURE_JWT_SECRET"
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
```

Add any additional environment variables required by your Google OAuth configuration.

**Important:** Never commit `.env` files or expose API keys, database credentials, or JWT secrets.

### 3. Generate Prisma Client

```bash
npx prisma generate
```

Run database migrations when setting up a fresh database:

```bash
npx prisma migrate deploy
```

### 4. Start the Backend

```bash
npm run dev
```

The backend should now be available at:

```text
http://localhost:5000
```

Use the port configured in your environment if it differs.

### 5. Configure the Frontend

Create `.env.local` in the frontend root directory.

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Configure any additional frontend environment variables required for Google OAuth.

### 6. Start the Frontend

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

You should now be able to access the SupportPilot AI application.

---

## 🧪 Testing

The backend includes automated tests using Vitest and Supertest.

Run the complete test suite:

```bash
npm test
```

Run TypeScript type checking:

```bash
npm run typecheck
```

Build the backend:

```bash
npm run build
```

Run an individual test file:

```bash
npx vitest run src/modules/ai/ai.service.test.ts
```

The AI service tests cover scenarios including:

- Handling tickets that do not exist.
- Saving AI-generated analysis.
- Preserving the original ticket priority.
- Rejecting invalid AI recommendations.
- Handling database errors.

**Test status:** 17 backend tests passed across the three test files during development. Run the commands above to verify the current repository state.

---

## 📚 API Documentation

Interactive API documentation is available through Swagger.

**[Open SupportPilot AI API Documentation](https://supportpilot-ai-g2xp.onrender.com/api-docs)**

### Main API Modules

| Module | Base Endpoint | Description |
|---|---|---|
| Authentication | `/api/v1/auth` | Registration, login, Google authentication, current user |
| Tickets | `/api/v1/tickets` | Ticket creation, listing, details, assignment and comments |
| AI | `/api/v1/ai` | AI-powered ticket analysis |
| Users | `/api/v1/users` | User and agent management |
| Dashboard | `/api/v1/dashboard` | Dashboard statistics |
| Health | `/api/v1/health` | Backend health status |

All protected endpoints require appropriate authentication and permissions.

---

## 🔒 Security Considerations

Security is an important part of the application architecture.

- Passwords are hashed before storage.
- JWT tokens protect authenticated endpoints.
- Middleware verifies user identity and permissions.
- Zod validates incoming data.
- Role-based authorization restricts sensitive operations.
- AI recommendations are stored separately from original ticket priority.
- Sensitive credentials are managed through environment variables.

---

## 🌍 Deployment

The application is deployed using separate frontend and backend hosting.

| Component | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | Neon PostgreSQL |
| AI Provider | Google Gemini |

**Live Links**

- [Open Application](https://supportpilot-ai-client.vercel.app)
- [Check Backend Health](https://supportpilot-ai-g2xp.onrender.com/api/v1/health)
- [Explore API Documentation](https://supportpilot-ai-g2xp.onrender.com/api-docs)

*The backend may take some time to respond after inactivity when hosted on a free-tier service.*

---

## 💡 Engineering Highlights

SupportPilot AI demonstrates practical full-stack engineering concepts:

- Designing RESTful APIs with Express.
- Structuring backend code using modular architecture.
- Implementing JWT authentication and role-based access control.
- Modeling relational data with PostgreSQL and Prisma.
- Integrating third-party AI services.
- Handling asynchronous operations and API errors.
- Managing frontend and backend communication.
- Writing automated tests for backend services.
- Deploying a full-stack application.
- Building dashboards and workflows around real-world business requirements.

---

## 🔮 Future Improvements

Potential areas for future development:

- Real-time ticket notifications.
- WebSocket-based customer-agent messaging.
- Ticket attachment uploads.
- Advanced reporting and analytics.
- AI-powered sentiment analysis.
- SLA tracking and escalation workflows.
- Email notifications.
- More extensive end-to-end testing.

---

## 👨‍💻 Author

**S. M. Anzumul Jubayer**  
Full-Stack Web Developer

Interested in building practical, scalable web applications and solving real-world problems through modern web technologies.


---

## ⭐ SupportPilot AI

SupportPilot AI was built to demonstrate how modern full-stack technologies and AI can work together to improve customer support operations.

If you find this project interesting, consider giving the repositories a ⭐ on GitHub.

**Built with TypeScript, modern web technologies, and a focus on real-world problem solving.**

