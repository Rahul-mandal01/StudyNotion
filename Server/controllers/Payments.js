const {instance} = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const {courseEnrollmentEmail} = require("../mail/templates/courseEnrollmentEmail");


// CAPTURE THE PAYMENT AND INITIATE THE RAZORPAY ORDER
exports.capturePayment = async (req, res)=> {
    try{

        // FETCH ID'S
        const {course_id} = req.body;
        const user_id = req.user.id;

        // VALID COURSE ID
        if(!course_id){
            return res.json({
                success: false,
                message: "Please provide valid course ID",
            })
        }

        // VALID COURSE DETAIL
        let course;
        try{
            course = await Course.findById(course_id);
            if(!course){
                return res.json({
                    success: false,
                    message: "Could not find the course",
                });
            }

            // CHECK IF USER ALREADY PAY FOR THE SAME COURSE
            const uid = new mongoose.Types.ObjectId(user_id);
            if(course.studentsEnrolled.includes(uid)){
                return res.json({
                    success: false,
                    message: "User has already enrolled for this course",
                });
            }

        }catch(error){
            console.error(error);
            return res.status().json({
                success: false,
                message: `An error occurred while fetching course details ${error.message}`,
            });
        }
        
        // CREATE ORDER
        const amount = course.price;
        const currency = "INR";

        const options = {
            amount: amount * 100,
            currency,
            receipt: Math.random(Date.now()).toString(),
            notes:{
                courseId: course_id,
                user_id,
            }
        };

        try{
            // INITIATE THE PAYMENT USING RAZORPAY
            const paymentResponse = await instance.orders.create(options);
            console.log(paymentResponse);

        }catch(error){
            console.error(error);
            return res.status(500).json({
                success: false,
                message: `An error occurred while creating order ${error.message}`,
            });
        }

        // RETURN RESPONSE
        return res.status(200).json({
            success: true,
            courseName: courseName,
            courseDescription: course.courseDescription,
            thumbnail:course.thumbnail,
            orderId: paymentResponse.id,
            currency: paymentResponse.currency,
            amount: paymentResponse.amount,
            message: "Payment captured successfully",
        })

    }catch(error){

    }
}

// VERIFY SIGNATURE OF RAZORPAY SERVER
exports.verifySignature = async(req, res) => {
    const webhookSecret = "123456789";
    const signature = req.headers['x-razorpay-signature'];

    // below 3 rules convert our webhookSecret into a hashed string
    const shasum = crypto.createHmac("sha256", webhookSecret);            //Hmac -- hashed based message authentication codes
    // CONVERT INTO STRING FORMAT
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if(signature === digest){
        console.log("Payment is authorized");

        const {courseId, user_id} = req.body.payload.payment.entity.notes;

        try{
            // FULFILL THE ACTION
            // FIND THE COURSE AND ENROLL THE STUDENT INTO IT
            const enrolledCourse = await Course.findOneAndUpdate(
                                            {_id: courseId},
                                            {$push: {studentsEnrolled: user_id}},
                                            {new: true},
            );

            if(!enrolledCourse){
                return res.status(500).json({
                    success: false,
                    message: "Course not found",
                });
            }

            console.log(enrolledCourse);

            // FIND THE STUDENT AND ADD THE COURSE TO THEIR LIST ENROLLED COURSES ME
            const enrolledStudent = await User.findOneAndUpdate(
                                                {_id: user_id},
                                                {$push: {enrolledCourses: courseId}},
                                                {new: true},
            );

            console.log(enrolledStudent);

            // NEED TO SEND CONFIRMATION MAIL
            // const emailResponse = await mailSender(
            //                         enrolledStudent.email,
            //                         "Congratulations on Your Enrollment in the New CodeHelp Course!",       //EMAIL TITLE
            //                         "Welcome to CodeHelp! Your Enrollment is Confirmed",       //EMAIL HEADING
            //                         courseEnrollmentEmail(enrolledCourse, enrolledStudent)
            // );

            // console.log(emailResponse);
            // return res.status(200).json({
            //     success: true,
            //     message: "Payment verified successfully",
            // })

        }catch(error){
            console.error(error);
            return res.status(500).json({
                success: false,
                message: `An error occurred while verifying payment ${error.message}`,
            });
        }
    }
    else{
        console.log("Payment signature does not match");
        return res.status(400).json({
            success: false,
            message: "Payment signature does not match",
        });
    }
}