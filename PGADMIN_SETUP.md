# Connecting pgAdmin 4 to Your PostgreSQL Database

This guide will help you connect pgAdmin 4 to your clinic_db database.

## Database Connection Details

✅ **Status**: PostgreSQL is running on port 5432

Based on your configuration:
- **Host**: localhost
- **Port**: 5432
- **Database**: clinic_db
- **Username**: postgres
- **Password**: postgres
- **Schema**: public

Connection String: `postgresql://postgres:postgres@localhost:5432/clinic_db?schema=public`

---

## Step-by-Step Instructions

### Step 1: ✅ Database is Already Running

Your PostgreSQL database is confirmed running on localhost:5432. You can proceed to the next step.

If you need to restart it in the future:
```
bash
# Using Docker
cd /home/brian/Clinic/backend
docker-compose up -d

# Or local PostgreSQL
sudo systemctl restart postgresql
```

### Step 2: Open pgAdmin 4

Launch pgAdmin 4 from your applications menu or by running:
```bash
pgadmin4
```

### Step 3: Add New Server Connection

1. In pgAdmin 4, right-click on "Servers" in the left sidebar
2. Select "Create" → "Server..."

### Step 4: Configure Connection Details

In the "Create - Server" dialog, fill in the following:

**General Tab:**
- Name: `Clinic Database` (or any name you prefer)

**Connection Tab:**
- Host name/address: `localhost`
- Port: `5432`
- Maintenance database: `clinic_db`
- Username: `postgres`
- Password: `postgres`

**Optional - Save password:**
- Check "Save password?" if you want pgAdmin to remember the password

### Step 5: Test Connection

Click the "Save" button. pgAdmin will attempt to connect to the database.

If successful, you'll see the server appear in the left sidebar under "Servers".

### Step 6: Explore Your Database

Once connected, you can:
- Expand the database tree in the left sidebar
- View `clinic_db` → Schemas → `public` → Tables
- You should see:
  - `Appointment` table
  - `ContactMessage` table

---

## Troubleshooting

### Connection Refused Error

If you get a connection refused error:
1. Check if Docker container is running: `docker ps`
2. Check if PostgreSQL port 5432 is exposed: `docker-compose.yml`
3. Try connecting with psql first: 
   
```
bash
   psql -h localhost -U postgres -d clinic_db
   
```

### Authentication Failed

- Verify username and password are correct
- Default credentials: `postgres` / `postgres`
- Check pg_hba.conf for authentication settings

### Cannot See Tables

1. Right-click on the database and refresh
2. Expand: clinic_db → Schemas → public → Tables
3. If tables don't appear, verify migrations were run:
   
```
bash
   cd /home/brian/Clinic/backend
   npx prisma migrate deploy
   
```

---

## Useful pgAdmin Features

- **Query Tool**: Right-click on database → Query Tool to run SQL queries
- **View Data**: Right-click on table → View Data → View All Rows
- **Table Structure**: Right-click on table → Properties to see schema

---

## Quick SQL Queries to Try

Once connected, you can run these queries in the Query Tool:

```
sql
-- View all appointments
SELECT * FROM "Appointment";

-- View all contact messages
SELECT * FROM "ContactMessage";

-- Count records
SELECT COUNT(*) FROM "Appointment";
SELECT COUNT(*) FROM "ContactMessage";
```

---

## Alternative: Connect via Command Line

If you prefer command-line access:

```
bash
# Connect to database
psql -h localhost -U postgres -d clinic_db

# List tables
\dt

# Exit
\q
```

---

For more help, refer to pgAdmin 4 documentation: https://www.pgadmin.org/docs/pgadmin4/latest/
