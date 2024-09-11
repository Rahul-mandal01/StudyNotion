const mongoose = require("mongoose");

const tagSchema = new mongoose.Schema({
    name:{
        type: "string",
        trim: true,
        required: true
    },

    description:{
        type: "string",
    },

    course:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Course",
    }
})

module.exports = mongoose.model("Tag", tagSchema);