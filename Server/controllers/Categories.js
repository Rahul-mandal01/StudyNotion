const Category = require("../models/Category");

// create Tag ka handler function 

exports.createCategories = async (req, res) =>{
    try{

        // FETCH DATA
        const {name, description} = req.body;

        // VALIDATION	--400 Bad Request
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
        return res.status(201).json({
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

// categoryPageDetails handler function
exports.categoryPageDetails = async (req, res) => {
	try {
		// GET CATEGORY ID
		const { categoryId } = req.body;

		// Get courses for the specified category
		const selectedCategory = await Category.findById(categoryId)
			.populate("courses")
			.exec();
		console.log(selectedCategory);
		// Handle the case when the category is not found
		if (!selectedCategory) {
			console.log("Category not found.");
			return res.status(404).json({ 
				success: false, 
				message: "Category not found" 
			});
		}
		// Handle the case when there are no courses
		if (selectedCategory.courses.length === 0) {
			console.log("No courses found for the selected category.");
			return res.status(404).json({
				success: false,
				message: "No courses found for the selected category.",
			});
		}

		const selectedCourses = selectedCategory.courses;

		// Get courses for other categories
		const categoriesExceptSelected = await Category.find({
													_id: { $ne: categoryId },
												})
											.populate("courses")
											.exec();
		let differentCourses = [];
		for (const category of categoriesExceptSelected) {
			differentCourses.push(...category.courses);
		}

		// Get top-selling courses across all categories
		const allCategories = await Category.find().populate("courses");
		const allCourses = allCategories.flatMap((category) => category.courses);
		const mostSellingCourses = allCourses
			.sort((a, b) => b.sold - a.sold)
			.slice(0, 10);

		res.status(200).json({
			selectedCourses: selectedCourses,
			differentCourses: differentCourses,
			mostSellingCourses: mostSellingCourses,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Internal server error",
			error: error.message,
		});
	}
};
