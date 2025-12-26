# LectureMate

## Project info

**URL**: [Add your project URL here]

## Getting Started

To run this project locally, you will need Node.js & npm installed.

Follow these steps:

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd LectureMatev3

# Step 3: Install dependencies
npm install

# Step 4: Start the development server
npm run dev
```

## Technologies

This project is built with:

- [Vite](https://vitejs.dev/)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/)
- [TanStack Query](https://tanstack.com/query/latest)

## Deployment

You can deploy this project to any hosting provider that supports Vite/React apps (e.g., Vercel, Netlify, Railway).

## Backend Configuration

This project uses Supabase Edge Functions for AI features.
To configure the AI explain feature:

1. Obtain a **Google Gemini API Key** from [Google AI Studio](https://aistudio.google.com/).
2. Set the `GEMINI_API_KEY` environment variable in your Supabase project.

```sh
supabase secrets set GEMINI_API_KEY=your_key_here
```
