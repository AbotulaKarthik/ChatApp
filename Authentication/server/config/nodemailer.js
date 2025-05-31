import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
})

export default transporter


/// we need SMTP details to send the email
// we can use any SMTP provider and can provide SMTP host name and credentials
// we can use google SMTP /// **** now we are using [brevo SMTP]