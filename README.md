# Morphiq

Morphiq is an AI-powered design engineering platform that translates inspiration images and wireframes into production-ready UI code. By leveraging Next.js, Convex, Inngest, Stripe, and Anthropic's Claude, Morphiq streamlines the UI generation process from visual moodboards to accessible, consistently styled React components.

## Getting Started

Follow the instructions below to set up and run the Morphiq development environment.

### Prerequisites

You need Node.js and a package manager (npm, pnpm, or yarn) installed. 
You also need the Stripe CLI installed to forward webhooks locally.

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory and populate it with the following keys. Ask your team administrator for the specific values.

```env
NEXT_PUBLIC_APP_URL=https://localhost:3000

NEXT_PUBLIC_CONVEX_SITE_URL=
NEXT_PUBLIC_CONVEX_URL=
CONVEX_DEPLOYMENT=

GOOGLE_CLIENT_SECRET=
GOOGLE_CLIENT_ID=

ANTHROPIC_API_KEY=

INNGEST_DEV=0 
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_STANDARD_PLAN_PRICE_ID=
STRIPE_WEBHOOK_SECRET=
STRIPE_SECRET_KEY=
```
*(Note: `INNGEST_DEV=0` disables Inngest Cloud and routes events through the local Inngest dev server instead.)*

### 3. Running the Development Servers

Morphiq requires several services to run concurrently in parallel terminals. Open four separate terminal windows and run one of the following commands in each:

**Terminal 1: Next.js App**
```bash
npm run dev
```

**Terminal 2: Convex Backend**
```bash
npx convex dev
```

**Terminal 3: Inngest Dev Server**
```bash
npx inngest-cli@latest dev
```

**Terminal 4: Stripe Webhook Forwarding**
```bash
stripe listen --forward-to https://localhost:3000/api/billing/webhook
```

### 4. Open the App
Once all services are running, open [https://localhost:3000](https://localhost:3000) with your browser to see the application.

---

### Tech Stack Overview
- **Frontend**: Next.js 16, React 19, Tailwind CSS v4, Redux Toolkit
- **Backend/DB**: Convex
- **Background Jobs**: Inngest
- **AI Generation**: Anthropic API
- **Payments**: Stripe

---

### Documentation

- [Convex — Next.js Quickstart](https://docs.convex.dev/quickstart/nextjs)
- [Inngest — Next.js Quickstart](https://www.inngest.com/docs/getting-started/nextjs-quick-start?ref=docs-home)
- [Stripe — Get Started](https://docs.stripe.com/get-started)
