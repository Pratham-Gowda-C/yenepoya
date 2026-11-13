# AgriPulse AI — Database Architecture & Supabase Guide

AgriPulse AI utilizes PostgreSQL hosted on **Supabase Cloud** with Row Level Security (RLS) enabled on every farmer-owned entity.

## 1. Entity-Relationship Overview

- **`profiles`**: Linked 1:1 with `auth.users(id)`
- **`plots`**: Belongs to `profiles(id)`
- **`soil_records`**: Belongs to `plots(id)` and `profiles(id)`
- **`crop_recommendations`**: Belongs to `profiles(id)` (optional plot reference)
- **`disease_diagnoses`**: Belongs to `profiles(id)` (optional plot reference)
- **`fertilizer_plans`**: Belongs to `profiles(id)` (optional plot reference)
- **`chat_conversations`**: Belongs to `profiles(id)`
- **`chat_messages`**: Belongs to `chat_conversations(id)` and `profiles(id)`
- **`weather_records`**: Belongs to `profiles(id)` (optional plot reference)
- **`crop_references`**: Public agricultural standards table seeded with ICAR benchmarks

---

## 2. Row Level Security (RLS) Policies

All application tables enforce strict RLS policies using PostgreSQL `auth.uid()`:

```sql
-- Example RLS Policy on plots
CREATE POLICY "Farmers can view own plots" ON public.plots
    FOR SELECT USING (auth.uid() = farmer_id);

CREATE POLICY "Farmers can insert own plots" ON public.plots
    FOR INSERT WITH CHECK (auth.uid() = farmer_id);

CREATE POLICY "Farmers can update own plots" ON public.plots
    FOR UPDATE USING (auth.uid() = farmer_id);

CREATE POLICY "Farmers can delete own plots" ON public.plots
    FOR DELETE USING (auth.uid() = farmer_id);
```

Cross-tenant data exposure is impossible at the database engine level.

---

## 3. How to Apply Migrations

### Method A: Automated Migration Runner
Configure `DATABASE_URL` in `server/.env`:
```bash
DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@db.[YOUR_PROJECT_REF].supabase.co:5432/postgres
```
Then run from root:
```bash
npm run migrate
```

### Method B: Supabase Cloud Dashboard
1. Log in to [Supabase Cloud](https://app.supabase.com)
2. Open your project -> **SQL Editor**
3. Paste the contents of `supabase/migrations/001_initial_schema.sql`
4. Click **Run**

---

## 4. Storage Buckets
The migration automatically provisions the `crop-images` storage bucket with public read and authenticated write access.
