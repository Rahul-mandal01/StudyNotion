const Section = require("../models/Section");
const Course = require("../models/Course");

exports.createSection = async (req, res) => {
    try{
        // DATA FETCH
        const { courseId, sectionName } = req.body;

        // DATA VALIDATION
        if(!courseId || !sectionName){
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        // CREATE SECTION
        const newSection = await Section.create({sectionName});

        // UPDATE COURSE WITH SECTION OBJECTID
        const updatedCourseDetails = await Course.findByIdAndUpdate(
                                                    courseId,
                                                    { 
                                                        $push: {
                                                            courseContent: newSection._id,
                                                        }
                                                             
                                                    },
                                                    { new: true } // for updated documnet

                                            )
        // HOMEWORK : USE POPULATE TO REPLACE SECTIONS/SUBSECTION BOTH IN THE updatedCourseDetails 
        // RETURN RESPONSE
        return res.status(200).json({
            success: true,
            message: "Section created successfully",
            data: updatedCourseDetails,
        })

    }catch(error){
        return res.status(500).json({
            success: false,
            message: `Unable to create section: ${error.message}`,
        })
    }
}




exports.updateSection = async(req, res) => {
    try{
        // DATA FETCH
        const {sectionName, sectionId} = req.body;

        // DATA VALIDATION
        if(!sectionName || !sectionId){
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            })
        }

        // DATA UPDATE
        const section = await Section.findByIdAndUpdate(sectionId, // sectionId ka use krke data find out kiya
                                                            {sectionName}, // sectionName change kiya 
                                                            {new: true} // give updated data
                                                        );


        // RETURN RESPONSE
        return res.status(200).json({
            success: true,
            message: "Section updated successfully",
            data: section,
        })

    }catch(error){
        return res.status(500).json({
            success: false,
            message: `Unable to update section: ${error.message}`,
        })
    }
}



exports.deleteSection = async(req, res) => {
    try{

        // GET ID -- ASSUMING THAT WE ARE SENDING ID'S IN PARAMS
        const {sectionId} = req.params;

        // UPDATE COURSE WITH REMOVED SECTION OBJECTID
        await Section.findByIdAndDelete(sectionId);
        // TODO[TESTING]: DO WE NEED TO DELETE THE ENTRY FROM THE COURSE SCHEMA

        // RETURN RESPONSE
        return res.status(200).json({
            success: true,
            message: "Section deleted successfully",
        });


    }catch(error){
        return res.status(500).json({
            success: false,
            message: `Unable to delete section: ${error.message}`,
        })
    }
}