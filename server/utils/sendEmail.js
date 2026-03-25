const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    try {
        console.log('Attempting to send email to:', options.email);
        console.log('Email user configured:', process.env.EMAIL_USER ? 'Yes' : 'No');

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS, // Use Gmail App Password here
            },
        });

        const mailOptions = {
            from: `"JobFlow Portal" <${process.env.EMAIL_USER}>`,
            to: options.email,
            subject: options.subject,
            html: options.html,
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', result.messageId);
        return result;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

module.exports = sendEmail;