const Category = require("../models/Category");

exports.createCategory = async (req, res) => {
	try {
		const { name, description } = req.body;

		if (!name || !description) {
			return res
				.status(400)
				.json({ success: false, message: "All fields are required" });
		}
		const CategorysDetails = await Category.create({
			name: name,
			description: description,
		});
		console.log(CategorysDetails);
		return res.status(200).json({
			success: true,
			message: "Categories Created Successfully",
		});
	} catch (error) {
		console.error("Error in createCategory:", error.message); // Log concise error
		return res.status(500).json({
			success: false,
			message: "An error occurred while creating the category. Please try again later.",
		});
	}
};

exports.showAllCategories = async (req, res) => {
	try {
		const allCategorys = await Category.find(
			{},
			{ name: true, description: true }
		);
		res.status(200).json({
			success: true,
			data: allCategorys,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

//categoryPageDetails 

exports.categoryPageDetails = async (req, res) => {
	try {
			//get categoryId
			const {categoryId} = req.body;
			//get courses for specified categoryId
			const selectedCategory = await Category.findById(categoryId)
											.populate("courses")
											.exec();
			//validation
			if(!selectedCategory) {
				return res.status(404).json({
					success:false,
					message:'Data Not Found',
				});
			}
			//get coursesfor different categories
			const differentCategories = await Category.find({
										 _id: {$ne: categoryId},
										 })
										 .populate("courses")
										 .exec();

			//get top 10 selling courses
			//HW - write it on your own

			//return response
			return res.status(200).json({
				success:true,
				data: {
					selectedCategory,
					differentCategories,
				},
			});

	}
	catch(error ) {
		console.log(error);
		return res.status(500).json({
			success:false,
			message:error.message,
		});
	}
}