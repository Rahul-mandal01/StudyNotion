const Subsection = require("../models/SubSection");
const Section = require("../models/Section");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

// CREATE SUBSECTION

exports.createSubsection = async(req, res) => {
    try{
        // DATA FETCH
        const {sectionId, title, timeDuration, description} = req.body;

        // EXTRACT FILE/VIDEO
        const video = req.files.videoFile;

        // DATA VALIDATION
        if(!sectionId || !title || !timeDuration || !description || !video){
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // UPLOAD ON MEDIA MANAGEMENT SERVICE FOR EG: CLOUDINARY
        const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);

        // CREATE A SUBSECTION
        const SubSectionDetails = await SubSection.create({
            title: title,
            timeDuration: timeDuration,
            description: description,
            videoUrl: uploadDetails.secure_url,
        })

        // UPDATE SECTION WITH THIS SUBSECTION OBJECTID
        const updatedSection = await Section.findByIdAndUpdate(
                                                    {_id: sectionId},
                                                    {$push:{
                                                        subSection: SubSectionDetails._id,
                                                    }},
                                                    {new:true}
      //HOMEWORK: LOG UPDATED SECTION HERE, AFTER ADDING POPULATE QUERY
        )

        // RETURN RESPONSE
        return res.status(200).json({
            success: true,
            message: "Subsection created successfully",
            subsection: SubSectionDetails
        })

    }catch(error){
        return res.status(500).json({
            success: false,
            message: `An error occurred: ${error.message}`,
        })
    }
}


// HOMEWORK: updateSubSection
// HOMEWORK: deleteSubSection