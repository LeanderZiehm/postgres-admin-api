import { Pool} from 'pg'
import dotenv from "dotenv";

dotenv.config();

const POSTGRES_HOST = process.env.POSTGRES_HOST;
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD;
const POSTGRES_USER = process.env.POSTGRES_USER;

console.log(`POSTGRES_HOST:${POSTGRES_HOST} POSTGRES_USER:${POSTGRES_USER} `)

const pool = new Pool({
  host: POSTGRES_HOST || 'localhost',
  user: POSTGRES_USER || 'postgres',
  database: "bookmarkdb",
  password: POSTGRES_PASSWORD,
  port:5432,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  maxLifetimeSeconds: 60
})



export async function get(name:string){
    const client = await pool.connect();
    const res = await client.query(`SELECT * FROM ${name};`);
    // console.log(res.rows[0]);
    client.release();
    return res
}

export async function add(text:string){
    const client = await pool.connect();
    await client.query(`INSERT INTO bookmarks ("text", user_agent, ip_address, device_hash) VALUES('${text}', 'user_agent', ip, 'hash');`);
    client.release();
}

// export default get;add;
