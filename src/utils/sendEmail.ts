import nodemailer from 'nodemailer';

interface sendEmailOTPtypo {
    toEmail: string;
    otpCode: string;
  }


const sendEmailOTP = async (toEmail:string, otpCode:string) => {
    const transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_SMTP_HOST,
        port: 587,
        secure: false, 
        auth: {
            user: process.env.MAILTRAP_SMTP_USERNAME,
            pass: process.env.MAILTRAP_SMTP_PASSWORD,
        },
    });

    const mailOptions = {
        from: `"CCPI Bank" <${process.env.MAILTRAP_EMAIL}>`,
        to: toEmail,
        subject: 'Your One-Time Password (OTP)',
        html: `
            <p>Hello,</p>
            <p>Your one-time password (OTP) for verification is: 
               <strong style="font-size: 24px;">${otpCode}</strong>
               <strong>${toEmail}<strong>
            </p>
            <p>This code is valid for 10 minutes.</p>
            <p>Thank you.</p>
        `,
    };

    try {
        let info = await transporter.sendMail(mailOptions);
        console.log("Message sent: %s", info.messageId);
        return true; 
    } catch (error) {
        console.error("Error sending email:", error);
        return false; 
    }
};

export default sendEmailOTP