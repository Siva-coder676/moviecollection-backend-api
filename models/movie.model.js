const { Schema, model } = require("mongoose");


const schema=new Schema(
    {
    title:{
        type:String,
        required:true,
        unique:true
    },
    description:{
        type:String,
        required:true,
       
    },
    
});


const Movie=model("Movie",schema);

module.exports=Movie;