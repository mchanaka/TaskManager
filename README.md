# Task Manager

Full-stack task management sample: **ASP.NET Core 8 Web API**, **Angular 19**, and **SQL Server Express (MSSQL Express)** with **cookie-based authentication** (no JWT).

## Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js LTS](https://nodejs.org/) (for Angular)
- SQL Server Express (Windows)

## Repository layout

- `backend/` — Web API (`TaskManagerApi`)
- `frontend/` — Angular SPA (`task-manager-ui`)
- `database/schema.sql` — idempotent SQL script generated from EF Core migrations (optional if you use `dotnet ef database update` instead)

## Database connection (SQL Server Express default)

The default connection string in `backend/appsettings.json` is:

- `Server=localhost\\SQLEXPRESS`
If you installed SQL Server Express under a different instance name, update `ConnectionStrings:DefaultConnection` accordingly.

## Cursor / VS Code

Open the **repository root** (`TaskManager`) as the workspace folder so `.vscode/tasks.json` is used.

If you keep the default **SQL Server Express** connection (`localhost\\SQLEXPRESS`), you can run:

```powershell
cd backend
dotnet run
```

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

Start the API:

```powershell
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

1. Start the API, then the Angular app.
2. **Register** a user (email must be unique), or **sign in**.
3. Tasks are listed on the left; use the right panel to **add**/**edit** (select a row). Use the checkbox to mark complete.
4. Use search, **All / Active / Done** filters, and sort options above the list.

HTTP calls use `withCredentials: true` so the auth cookie is sent to the API.

## GitHub

Create a new repository on GitHub, then from the project root:

```bash
git init
git add .
git commit -m "Initial commit: Task Manager API and Angular client"
git remote add origin https://github.com/<your-account>/<your-repo>.git
git branch -M master
git push -u origin master
```

Share the repository URL as required by your assignment.

## Security notes (production)

- Use **HTTPS** everywhere; configure cookie `Secure` and appropriate `SameSite` for your real front-end and API domains.
- Store secrets with **User Secrets**, environment variables, or a vault—not committed `appsettings.json` values.
