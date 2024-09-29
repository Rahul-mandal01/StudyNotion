const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    name:{
        type: "string",
        trim: true,
        required: true
    },

    description:{
        type: "string",
    },

    courses:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:"Course",
        }
    ]
})

module.exports = mongoose.model("Tag", categorySchema);