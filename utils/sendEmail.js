const nodemailer = require('nodemailer');
const sendEmail = async (subject, message, send_to, sent_from, reply_to) =>{
    const transsporter = nodemailer.createTransport({
        hos: process.env.EMAIL_HOST,
        port: 587,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        tls: {
            rejectUnauthorized: false
        }
    })
    const options = {
        from: sent_from,
        to: send_to,
        replyTo: reply_to,
        subjectl: subject,
        html: message,

    }
    // ;send email
    transsporter.sendMail(options, function (err, info) {
        if(err) {
            console.log(err)
        }
        console.log(info)
    })

    

}

module.exports = sendEmail