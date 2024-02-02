const mongoose = require('mongoose')
require('dotenv').config()


const dbConnect = () => mongoose.set('strictQuery', true).connect(process.env.MONGO_URI)
.then(() => console.log('DB Connected Successfully'))
.catch((error)=>console.log(error))

module.exports = { 
    dbConnect
}
