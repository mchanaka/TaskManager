# Task Manager

Full-stack task management sample: **ASP.NET Core 8 Web API**, **Angular 19**, and **SQL Server** (LocalDB, SQL Server, or Express) with **cookie-based authentication** (no JWT).

## Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js LTS](https://nodejs.org/) (for Angular)
- SQL Server, **SQL Server Express**, or **LocalDB** (Windows)

## Repository layout

- `backend/` — Web API (`TaskManagerApi`)
- `frontend/` — Angular SPA (`task-manager-ui`)
- `database/schema.sql` — idempotent SQL script generated from EF Core migrations (optional if you use `dotnet ef database update` instead)

## Database connection (LocalDB by default)

The repo defaults to **SQL Server LocalDB** (`Server=(localdb)\\mssqllocaldb`) in [backend/appsettings.json](backend/appsettings.json).

**If you see error 52 (“Unable to locate a Local Database Runtime”)**, install LocalDB, then **restart Cursor** (or open a new terminal) so `sqllocaldb` is on PATH:

- Download **SQL Server Express** and include **LocalDB**, or install the **LocalDB** package: [Microsoft SQL Server Express LocalDB](https://go.microsoft.com/fwlink/?LinkID=799012)  
- Optional (Windows): `winget install Microsoft.SQLServer.2022.Express` — in the installer, include the **LocalDB** feature if offered.

Verify in a terminal:

```powershell
sqllocaldb info
sqllocaldb start mssqllocaldb
```

Or run [scripts/ensure-localdb.ps1](scripts/ensure-localdb.ps1) — it starts the default instance and prints errors if LocalDB is missing.

To use a full SQL Server instance instead, edit `ConnectionStrings:DefaultConnection` (for example `Server=localhost` or `Server=localhost\\SQLEXPRESS`).

## Cursor / VS Code

Open the **repository root** (`TaskManager`) as the workspace folder so `.vscode/tasks.json` is used.

1. Install **LocalDB** (see above).
2. **Run the API with LocalDB started first:**  
   **Terminal → Run Task…** → **“Backend: dotnet run (after LocalDB)”**  
   or press **Ctrl+Shift+B** (default build task runs LocalDB, then `dotnet run`).
3. You can also run **`.\scripts\ensure-localdb.ps1`** manually in the integrated terminal, then `cd backend` and **`dotnet run`**.

Cursor uses the same tasks and terminal behavior as VS Code for this setup.

On first run, the API applies pending EF Core migrations automatically (`MigrateAsync` in `Program.cs`).

Alternatively, from `backend/`:

```bash
dotnet ef database update
```

To re-generate the SQL script after changing the model:

```bash
cd backend
dotnet ef migrations script --idempotent -o ../database/schema.sql
```

## Run the API

With LocalDB, start the instance first (see **Cursor / VS Code** above), or:

```powershell
.\scripts\ensure-localdb.ps1
cd backend
dotnet run
```

By default (see `Properties/launchSettings.json`):

- HTTP: `http://localhost:5133`
- HTTPS: `https://localhost:7050`

CORS allows the Angular dev server at `http://localhost:4200` and `https://localhost:4200` with credentials.

Trust the dev HTTPS certificate if needed:

```bash
dotnet dev-certs https --trust
```

## Run the Angular app

```bash
cd frontend
npm install
npx ng serve
```

Open `http://localhost:4200`. The dev build uses [frontend/src/environments/environment.development.ts](frontend/src/environments/environment.development.ts) and points to `http://localhost:5133` for the API.

Production build uses [frontend/src/environments/environment.ts](frontend/src/environments/environment.ts) (`https://localhost:7050`); adjust both to match your deployment URLs.

## Usage

1. Start SQL Server / LocalDB and the API.
2. Start the Angular app.
3. **Register** a user (email must be unique), or **sign in**.
4. Tasks are listed on the left; use the right panel to **add** or **edit** (select a row). Use the checkbox to **mark complete** without opening the form.
5. Use **search**, **All / Active / Done** filters, and **sort** options above the list.

HTTP calls use `withCredentials: true` so the auth cookie is sent to the API.

## GitHub

Create a new repository on GitHub, then from the project root:

```bash
git init
git add .
git commit -m "Initial commit: Task Manager API and Angular client"
git remote add origin https://github.com/<your-account>/<your-repo>.git
git branch -M main
git push -u origin main
```

Share the repository URL as required by your assignment.

## Security notes (production)

- Use **HTTPS** everywhere; configure cookie `Secure` and appropriate `SameSite` for your real front-end and API domains.
- Store secrets with **User Secrets**, environment variables, or a vault—not committed `appsettings.json` values.
