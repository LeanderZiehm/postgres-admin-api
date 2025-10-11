from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from dotenv import load_dotenv
import psycopg
import os

# Load environment variables
load_dotenv()

DB_CONFIG = {
    "host": os.getenv("DB_HOST"),
    "port": int(os.getenv("DB_PORT", 5432)),
    "dbname": os.getenv("DB_NAME"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
}

app = FastAPI()
templates = Jinja2Templates(directory="templates")

def get_connection(db_name=None):
    config = DB_CONFIG.copy()
    if db_name:
        config["dbname"] = db_name
    return psycopg.connect(**config)

# Home route: list all databases
@app.get("/", response_class=HTMLResponse)
def dashboard(request: Request):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT datname FROM pg_database WHERE datistemplate = false;")
    databases = [row[0] for row in cur.fetchall()]
    cur.close()
    conn.close()
    return templates.TemplateResponse("index.html", {
        "request": request,
        "databases": databases,
        "tables": [],
        "selected_db": None,
        "message": ""
    })

# Select a database to list tables
@app.post("/select_db", response_class=HTMLResponse)
def select_db(request: Request, db_name: str = Form(...)):
    conn = get_connection(db_name=db_name)
    cur = conn.cursor()
    cur.execute("""
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema='public'
        ORDER BY table_name;
    """)
    tables = [row[0] for row in cur.fetchall()]
    cur.close()
    conn.close()

    # Re-fetch databases for dropdown
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT datname FROM pg_database WHERE datistemplate = false;")
    databases = [row[0] for row in cur.fetchall()]
    cur.close()
    conn.close()

    return templates.TemplateResponse("index.html", {
        "request": request,
        "databases": databases,
        "tables": tables,
        "selected_db": db_name,
        "message": ""
    })

# Create a new table in selected database
@app.post("/create_table", response_class=HTMLResponse)
def create_table(
    request: Request, 
    table_name: str = Form(...), 
    columns: str = Form(...),
    db_name: str = Form(...)
):
    conn = get_connection(db_name=db_name)
    cur = conn.cursor()
    try:
        cur.execute(f"CREATE TABLE {table_name} ({columns});")
        conn.commit()
        message = f"Table '{table_name}' created successfully!"
    except Exception as e:
        conn.rollback()
        message = f"Error: {str(e)}"

    # Fetch updated table list
    cur.execute("""
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema='public'
        ORDER BY table_name;
    """)
    tables = [row[0] for row in cur.fetchall()]
    cur.close()
    conn.close()

    # Refresh database list
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT datname FROM pg_database WHERE datistemplate = false;")
    databases = [row[0] for row in cur.fetchall()]
    cur.close()
    conn.close()

    return templates.TemplateResponse("index.html", {
        "request": request,
        "databases": databases,
        "tables": tables,
        "selected_db": db_name,
        "message": message
    })
