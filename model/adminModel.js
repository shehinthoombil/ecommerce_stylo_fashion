const mongoose = require('mongoose')

//model to connect to the database  of admin or creating collection
const adminSchema = new mongoose.Schema ({

    name:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
})

module.exports = mongoose.model('admin',adminSchema)



