import app from "./server.ts"
import createDatabase from "./database.ts";

const port = 3000;


app.get("/create-database",(req,res) => {
    createDatabase("secrets")
});

app.listen(3000, () => {
    console.log("hi");
});

