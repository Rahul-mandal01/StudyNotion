const Tag = require("../models/Tag");

// create Tag ka handler function 

exports.createCategories = async (req, res) =>{
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

        const categoriesDetails = await Category.create({
            name: name,
            description: description,
        });
        console.log(categoriesDetails);


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


exports.showAllcategories = async ( req, res ) => {
    try{
        const allCategories = await Category.find({}, {name:true, description:true});
        res.status(200).json({
            success: true,
            message: "All Categories retrieved/return successfully",
            data: allCategories,
        })

    }catch(error){
        res.status(500).json({
            success: false,
            message: `An error occurred: ${error.message}`,
        })
    }
}

