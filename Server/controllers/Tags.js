const Tag = require("../models/Tag");

// create Tag ka handler function 

exports.createTag = async (req, res) =>{
    try{

        // FETCH DATA
        const {name, description} = req.body;

        // VALIDATION
        if(!name || !description){
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            })
        }

        // CREATE ENTRY IN DB

        const tagDetails = await Tag.create({
            name: name,
            description: description,
        });
        console.log(tagDetails);


        // RETURN RESPONSE
        return res.status(200).json({
            success: true,
            message: "Tag created successfully",
        })


    }catch(error){
        res.status(500).json({
            success: false,
            message: `An error occurred: ${error.message}`,
        })
    }
};



//  getAllTags handler function


exports.showAlltags = async ( req, res ) => {
    try{
        const allTags = await Tag.find({}, {name:true, description:true});
        res.status(200).json({
            success: true,
            message: "All tags retrieved/return successfully",
            data: allTags,
        })

    }catch(error){
        res.status(500).json({
            success: false,
            message: `An error occurred: ${error.message}`,
        })
    }
}