import { Pool} from 'pg'
import dotenv from "dotenv";

dotenv.config();

const POSTGRES_HOST = process.env.POSTGRES_HOST;
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD;
const POSTGRES_USER = process.env.POSTGRES_USER;
const POSTGRES_DATABASE = process.env.POSTGRES_DATABASE;

console.log(`POSTGRES_HOST:${POSTGRES_HOST} POSTGRES_USER:${POSTGRES_USER} POSTGRES_DATABASE:${POSTGRES_DATABASE}`)

const pool = new Pool({
  host: POSTGRES_HOST || 'localhost',
  user: POSTGRES_USER || 'postgres',
  database: POSTGRES_DATABASE || "bookmarkdb",
  password: POSTGRES_PASSWORD,
  port:5432,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  maxLifetimeSeconds: 60
})

// const client = await pool.connect()
// const res = await client.query('SELECT id, created_at, "text", user_agent, ip_address, device_hash FROM public.bookmarks;')
// console.log(res.rows[0])
// client.release()


async function createDatabase(name:string){

    const client = await pool.connect();
    const res = await client.query(`CREATE DATABASE ${name};`);
    console.log(res.rows[0]);
    client.release();
}

export default createDatabase;