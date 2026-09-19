# AI Student Planner

An AI-powered student planning application that transforms upcoming exams, projects, events, competitions and deadlines into actionable plans.

## Features
- **Dynamic Plan Creation**: Automatically adjusts form inputs based on the type of activity (Exam, Hackathon, College Event, etc.).
- **AI Generation**: Uses Google's Gemini AI to break down complex tasks into a detailed checklist, study schedule, and resource list.
- **Smart Refinement**: Ask the AI to tweak the plan (e.g., "Make the schedule less intense", "Reduce budget to $300") without losing existing data.
- **Progress Tracking**: Check off tasks to see real-time progress updates on the dashboard.
- **Fully Responsive**: Works seamlessly across mobile, tablet, and desktop viewports.

## Technology Stack
- **Frontend**: Vanilla JavaScript (ES6), HTML5, Tailwind CSS (via CDN), Phosphor Icons.
- **Backend / API**: Vercel Serverless Functions (Node.js).
- **AI Provider**: Google Gemini API (`gemini-1.5-flash`).
- **Data Persistence**: Browser `localStorage`.

## Project Structure
```
├── api/                   # Vercel Serverless Functions (Node.js backend)
│   ├── generate.js        # Endpoint for initial AI plan generation
│   └── refine.js          # Endpoint for AI plan refinement
├── css/                   # Custom stylesheet overrides
├── js/                    # Frontend JavaScript
│   ├── components/        # UI component rendering logic
│   ├── services/          # API service logic
│   ├── store/             # Global state and localStorage persistence
│   └── app.js             # Main initialization
├── index.html             # Application entry point
├── vercel.json            # Deployment configuration
└── .env.example           # Environment variables template
```

## Local Setup

To run this project locally, you will need a Vercel CLI environment or a local server capable of running Node.js serverless functions, as the API requests are routed through `/api/`.

1. Clone the repository.
2. Install the Vercel CLI: `npm i -g vercel`
3. Copy the environment template:
   ```bash
   cp .env.example .env
   ```
4. Add your Gemini API key to the `.env` file.
5. Run the local development server:
   ```bash
   vercel dev
   ```

## Environment Variables
The application requires the following environment variable to be set in your deployment environment (e.g., Vercel project settings):

- `GEMINI_API_KEY`: Your private Google Gemini API key.

**Security Note:** Never commit your `.env` file or expose your API key in the frontend client code.

## Deployment Instructions (Vercel + GitHub)
This project is configured for seamless deployment on Vercel.

1. Push this repository to GitHub.
2. Log into [Vercel](https://vercel.com/) and click **Add New > Project**.
3. Import your GitHub repository.
4. In the "Environment Variables" section, add `GEMINI_API_KEY` and paste your key.
5. Click **Deploy**.

Vercel will automatically provision the serverless functions in the `/api/` directory and serve the static frontend files. Any future pushes to the `main` branch will automatically trigger a new deployment.
