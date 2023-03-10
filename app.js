const express = require("express")
const app = express();
const bodyParser = require("body-parser")
const cors = require('cors');
require('dotenv').config()
const { initCache } = require('./controller/cache');
const router = require("./router/router")
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json())
app.use(cors())
async function run() {
    app.use("/",router)
    await initCache()
    app.listen(process.env.PORT, () => {    
        console.log(`Now listening on port ${process.env.PORT}`); 
    });
}
run();


