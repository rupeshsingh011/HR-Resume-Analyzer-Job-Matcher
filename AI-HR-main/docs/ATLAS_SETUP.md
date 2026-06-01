# MongoDB Atlas setup (this project)

This app uses **MongoDB Atlas only**. You do not need MongoDB Compass or a local `mongod` server.

## What you need to do (about 10 minutes)

### Step 1 — Create a free Atlas account

1. Open [https://cloud.mongodb.com](https://cloud.mongodb.com) and sign up or log in.
2. Create an organization and project if prompted.
3. Click **Build a Database** → choose **M0 FREE** → create the cluster (any cloud region close to you is fine).

### Step 2 — Create a database user

1. Atlas will prompt for a database user, or go to **Security → Database Access → Add New Database User**.
2. Choose **Password** authentication.
3. Pick a **username** and **password** and save them somewhere safe.
4. Privileges: **Built-in Role** → `Atlas admin` or `Read and write to any database` (for dev), or `readWrite` on database `smart_hr_analyzer`.

You will give the app:

- Database username  
- Database password (not your Atlas login password)

### Step 3 — Allow your computer to connect

1. Go to **Security → Network Access → Add IP Address**.
2. Click **Add Current IP Address** (for development).
3. Click **Confirm**.

Without this step, the backend will fail with a connection timeout.

### Step 4 — Copy the connection string

1. Go to **Database → Connect** on your cluster.
2. Choose **Drivers**.
3. Driver: **Node.js**, version 5.5 or later.
4. Copy the connection string. It looks like:

   ```text
   mongodb+srv://myuser:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 5 — Put it in `backend/.env`

1. In the project folder, open or create `backend/.env` (copy from `backend/.env.example` if needed).
2. Set `MONGO_URI` like this (one line):

   ```env
   MONGO_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/smart_hr_analyzer?retryWrites=true&w=majority
   ```

   Replace:

   | Placeholder      | With                          |
   |------------------|-------------------------------|
   | `YOUR_USER`      | Database username from Step 2 |
   | `YOUR_PASSWORD`  | Database password from Step 2 |
   | `cluster0.xxxxx` | Your cluster hostname         |

   Rules:

   - Keep **`smart_hr_analyzer`** as the database name in the URL (before `?`).
   - If your password has `@ # / : ?`, URL-encode it ([urlencoder.org](https://www.urlencoder.org/)). Example: `P@ss` → `P%40ss`.
   - Remove `<` and `>` from the Atlas template.

3. Set a strong `JWT_SECRET` in the same file (any long random string).

### Step 6 — Load demo data and run the app

From the project root (`AI-HR-main`):

```bash
npm run seed
npm run dev:backend
```

In another terminal:

```bash
npm run dev:frontend
```

Open [http://localhost:5174](http://localhost:5174) and log in:

- Email: `admin@smarthr.local`
- Password: `Admin123!`

If the backend prints `MongoDB connected (smart_hr_analyzer @ ...)`, Atlas is configured correctly.

---

## What to send if you need help (do not post publicly)

Only share these **in private** if someone is helping you debug:

- Whether Step 6 shows `MongoDB connected` or the exact **error message** (not your password).
- Your cluster **hostname** (e.g. `cluster0.abc123.mongodb.net`) — not the full URI with password.

Never paste your full `MONGO_URI` or password in chat, GitHub, or screenshots.

---

## View data in Atlas (optional, no Compass)

In the Atlas website: **Database → Browse Collections** → database `smart_hr_analyzer` → collections `users`, `jobs`, `candidates`.

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| `bad auth` / authentication failed | Wrong username/password; URL-encode special characters in password |
| `Server selection timed out` | Add your IP under **Network Access** |
| `MONGO_URI is required` | Create `backend/.env` with `MONGO_URI=...` |
| Empty app after switch | Run `npm run seed` again, then re-upload resumes |

Resume PDF files are stored on disk in `backend/src/uploads/`, not in Atlas. After a fresh seed, upload resumes again from the **Upload** page.
