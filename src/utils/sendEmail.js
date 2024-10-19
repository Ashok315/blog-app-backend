import nodemailer from "nodemailer";

const sendEmail=async (email,resetLink)=>{
    try {
        const transporter=nodemailer.createTransport({
            service:"Gmail",
            auth:{
                user:process.env.EMAIL_FROM,
                pass:process.env.EMAIL_PASSWORD
            }
        });
         

        const htmlTemplate = `
            <h1>Password Reset</h1>
            <p>You requested to reset your password. Please click the link below to reset it:</p>
            <a href="${resetLink}" target="_blank">${resetLink}</a>
      `;

        await transporter.sendMail({
            from:process.env.EMAIL_FROM,
            to:email,
            subject:"Reset Password",
            html:htmlTemplate
        });
        
        
    } catch (error) {
        throw new Error(error.message)
    }
}

export {sendEmail}