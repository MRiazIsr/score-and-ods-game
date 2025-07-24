# ⚽ TJ Score Game

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-15.3-black)
![React](https://img.shields.io/badge/React-19.1.0-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.1-38B2AC)

## 📋 Overview

TJ Score Game is a football prediction application that allows users to browse competitions, view upcoming matches, and make score predictions. The application is built with a modern tech stack including Next.js, React, TypeScript, and TailwindCSS, with data storage in AWS DynamoDB.

## 🚀 Features

- User authentication and session management using iron-session
- Browse football competitions with visual cards
- View upcoming matches for selected competitions
- Make score predictions for matches
- Responsive and modern UI with TailwindCSS
- Backend powered by DynamoDB and serverless functions

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS
- **Backend**: Next.js API routes, AWS Lambda functions
- **Database**: AWS DynamoDB
- **Authentication**: iron-session for cookie-based auth
- **Deployment**: Ready for Vercel or AWS

## ⚙️ Setup & Installation

### Prerequisites

- Node.js (v18 or later recommended)
- npm or bun package manager
- Docker and Docker Compose (for local DynamoDB)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/your-username/tj-score-game.git
cd tj-score-game
```

2. **Install dependencies**

```bash
npm install
# or
bun install
```

3. **Environment setup**

Create a `.env` file in the root directory with the following variables:

```
# Session
SESSION_PASSWORD=your-secure-password-min-32-chars

# AWS Configuration (for local development)
AWS_REGION=local
AWS_ACCESS_KEY_ID=dummy
AWS_SECRET_ACCESS_KEY=dummy
DYNAMODB_ENDPOINT=http://localhost:8000

# Football data API
FOOTBALL_DATA_API_KEY=your-api-key
```

4. **Start local DynamoDB**

```bash
docker-compose up -d
```

5. **Run the development server**

```bash
npm run dev
# or with Turbopack
npm run dev-no-turbo
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🚢 Deployment

### Deploy to Vercel

The easiest way to deploy the application is using Vercel:

1. Push your code to a GitHub repository
2. Import the project in the Vercel dashboard
3. Configure environment variables
4. Deploy

### Deploy to AWS

To deploy the serverless components:

1. Configure AWS credentials
2. Update the serverless.yml file if needed
3. Deploy using the Serverless Framework:

```bash
npm install -g serverless
serverless deploy
```

## 📝 License

MIT

---

Built with ❤️ by the TJ Score Game Team