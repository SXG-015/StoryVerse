# StoryVerse — Architecture & Code Explained

> A beginner-friendly overview of how all the pieces fit together — useful for project presentations.

---

## The Big Picture

A web app has **three layers** that talk to each other:

```
┌─────────────┐        HTTP Requests        ┌─────────────┐        SQL Queries        ┌─────────────┐
│             │  ──────────────────────────► │             │  ──────────────────────► │             │
│  FRONTEND   │     (JSON data over API)     │   BACKEND   │    (reads/writes data)   │  DATABASE   │
│  (Browser)  │  ◄────────────────────────── │  (Server)   │  ◄────────────────────── │ (PostgreSQL)│
│             │        JSON Responses        │             │        Query Results      │             │
└─────────────┘                              └─────────────┘                          └─────────────┘
    client/                                      server/                                database/
```

**In simple terms:** The *frontend* is what the user sees and clicks. The *backend* is the brain that processes requests. The *database* is the memory that stores everything permanently.

---

## 1. Frontend — What the User Sees (`client/`)

The frontend is everything that runs **inside the user's browser**.

| Technology | What It Does | StoryVerse Example |
|---|---|---|
| **HTML** | The skeleton/structure of the page | The search bar, buttons, and text on the Home page |
| **CSS** | The styling — colors, fonts, layout, animations | Our Oceanic Sapphire/Mint Breeze themes, gradient buttons, glassmorphism effects |
| **JavaScript** | The behavior — handles clicks, loads data, updates the page | When you click "Search," JS fetches matching stories without reloading the page |
| **React** | A JS library that builds the UI from reusable *components* | `<Navbar />`, `<ThemeToggle />`, `<StoryCard />` — snap together like LEGO blocks |
| **Vite** | The local development tool that bundles everything and auto-refreshes | Run `npm run dev` → see changes instantly in the browser |

**Key folders:**
- `pages/` → Each page (Home, Login, Dashboard, etc.) is a separate React component
- `components/` → Reusable UI pieces shared across pages (Navbar, Footer, ThemeToggle)
- `context/` → Shared state (who's logged in? dark or light theme?)
- `App.css` → The entire design system — ~100 CSS variables that control every color in the app

**How does a page get built?**
1. **React Router** looks at the URL (e.g., `/login`) and picks the matching page component
2. That component **renders HTML** using JSX (HTML written inside JavaScript)
3. **CSS** styles it using the CSS variables defined in `App.css`
4. When data is needed (e.g., story list), **Axios** sends an API request to the backend

---

## 2. Backend — The Brain (`server/`)

The backend is a **Node.js server** running on your machine (port 5000). It never shows anything on screen — it just receives requests, processes them, and sends back JSON data.

| Technology | What It Does | StoryVerse Example |
|---|---|---|
| **Node.js** | Lets us run JavaScript *outside* the browser, on a server | The entire `server/` folder runs on Node.js |
| **Express** | A framework that makes it easy to define API routes | `GET /api/stories` → returns a list of stories |
| **JWT (JSON Web Tokens)** | Handles login sessions — proves "this user is authenticated" | After login, a token is stored so you don't re-enter your password on every page |
| **bcryptjs** | Hashes passwords so they're never stored in plain text | `"MyPass123"` → `"$2a$10$xK9z..."` (irreversible) |
| **express-validator** | Validates incoming data to prevent bad/malicious input | Rejects a registration if the email format is invalid |

**How does an API request work?**
```
User clicks "Search" → Frontend sends GET /api/stories?search=fantasy
                              ↓
                        server/routes/stories.js  →  receives the request
                              ↓
                        server/controllers/storyController.js  →  builds a SQL query
                              ↓
                        PostgreSQL  →  finds matching stories
                              ↓
                        Server sends back JSON: [{ title: "Dragon Quest", ... }]
                              ↓
                        Frontend displays the story cards
```

**The folder structure follows a pattern called MVC:**
- **Routes** → Define *what URLs exist* (`GET /api/stories`)
- **Controllers** → Define *what happens* when a route is hit (query the database, return data)
- **Middleware** → Code that runs *before* the controller (e.g., check if the user is logged in)

---

## 3. Database — The Memory (`database/`)

**PostgreSQL** is a relational database — it stores data in structured **tables** (like Excel spreadsheets).

| Table | Stores | Key Fields |
|---|---|---|
| `users` | All registered accounts | username, email, hashed password, role (reader/writer) |
| `stories` | All published/draft stories | title, description, genre, author (linked to users) |
| `chapters` | Individual chapters of stories | title, content (HTML from rich text editor), chapter order |

**How tables relate:**
```
users  ─────┐
  (1 user)  │──►  stories  ─────┐
             │    (has many)     │──►  chapters
             │                   │    (has many)
```
One user can write many stories, and each story can have many chapters. These relationships are enforced using **foreign keys**.

**Extra features in our schema:**
- **Enums** — Restrict values (e.g., genre can only be 'fantasy', 'romance', 'sci-fi', etc.)
- **Triggers** — Automatically update `updated_at` timestamps when a row changes
- **UUIDs** — Every row gets a unique ID like `a3b8d1b6-0b3b-4b1a-...` instead of simple numbers

---

## 4. How It All Connects — A Complete Example

> **Scenario:** A user registers, logs in, and creates a story.

| Step | What Happens | Layer |
|---|---|---|
| 1 | User fills out the Register form and clicks "Create Account" | Frontend |
| 2 | React validates fields (email format, password length) | Frontend |
| 3 | Axios sends `POST /api/auth/register` with the form data | Frontend → Backend |
| 4 | Express receives it, `express-validator` checks the data again | Backend |
| 5 | `bcryptjs` hashes the password | Backend |
| 6 | SQL `INSERT INTO users (...)` stores the new account | Backend → Database |
| 7 | Server returns the user profile + a JWT token | Backend → Frontend |
| 8 | React stores the token and redirects to the Dashboard | Frontend |
| 9 | User clicks "Write" → fills in story details → clicks "Publish" | Frontend |
| 10 | Axios sends `POST /api/stories` with the JWT in the header | Frontend → Backend |
| 11 | Middleware checks the JWT — is this user really logged in? | Backend |
| 12 | Controller inserts the story into the `stories` table | Backend → Database |
| 13 | Dashboard updates to show the new story | Frontend |

---

## 5. The Theme System — CSS Variables in Action

This is a great example of how **CSS alone** can create a major feature without any JavaScript logic in the page components.

```css
/* In App.css — define colors as variables */
:root {                                    /* Dark mode (default) */
    --color-bg-primary: #060b18;
    --color-text-primary: #e8edf5;
}
[data-theme='light'] {                     /* Light mode overrides */
    --color-bg-primary: #f4faf8;
    --color-text-primary: #1e293b;
}
```

```css
/* Every component uses variables, never hardcoded colors */
body { background: var(--color-bg-primary); }
```

```jsx
/* ThemeContext.jsx — one line switches the entire app's theme */
document.documentElement.setAttribute('data-theme', 'light');
// → Every element instantly picks up the new colors via CSS variables!
```

**Why this is powerful:** We wrote ~100 CSS variables. When the theme toggles, *every single color in the entire application* updates simultaneously through pure CSS — no component re-renders needed.
