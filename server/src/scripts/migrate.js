import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  console.log('🌾 AgriPulse AI — Database Migration Runner 🌾');
  console.log('------------------------------------------------');

  const migrationFilePath = path.resolve(__dirname, '../../../supabase/migrations/001_initial_schema.sql');

  if (!fs.existsSync(migrationFilePath)) {
    console.error(`❌ Migration file not found at: ${migrationFilePath}`);
    process.exit(1);
  }

  const sqlContent = fs.readFileSync(migrationFilePath, 'utf8');
  console.log(`📄 Read migration file (Length: ${sqlContent.length} bytes)`);

  const dbUrl = process.env.DATABASE_URL;

  if (dbUrl && !dbUrl.includes('your-db-password') && !dbUrl.includes('your-project-id')) {
    console.log('🔌 Connecting to PostgreSQL database via DATABASE_URL...');
    const client = new pg.Client({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false },
    });

    try {
      await client.connect();
      console.log('✅ Connected to database successfully.');
      console.log('🚀 Executing 001_initial_schema.sql...');

      await client.query(sqlContent);

      console.log('✅ Migration applied successfully!');
      console.log('   - Tables created (profiles, plots, soil_records, crop_recommendations, etc.)');
      console.log('   - Row Level Security (RLS) enabled on all tables');
      console.log('   - Storage buckets and policies created');
      console.log('   - ICAR reference crop data seeded');
      await client.end();
      process.exit(0);
    } catch (err) {
      console.error('❌ Migration failed:', err.message);
      if (client) await client.end();
      process.exit(1);
    }
  } else {
    console.log(`
ℹ️  DATABASE_URL is not set or contains default placeholders in .env.
To automatically apply migrations to your Supabase Cloud PostgreSQL:
1. Open server/.env and provide your Supabase database connection string:
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
2. Run: npm run migrate

Alternatively, you can copy the contents of:
  supabase/migrations/001_initial_schema.sql
and paste it directly into the Supabase Cloud Dashboard -> SQL Editor -> Run!
------------------------------------------------
    `);
  }
}

runMigration().catch((err) => {
  console.error('Fatal migration error:', err);
  process.exit(1);
});
