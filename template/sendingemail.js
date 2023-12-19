const nodemailer = require('nodemailer')

function sendRegistrationEmail(email) {
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'ashimavineet2729@gmail.com',
            pass: 'suqo spfj ajsb fieb', 
        }
    })
    const mailOptions = {
        from: 'ashimavineet2729@gmail.com',
        to: email,
        subject: 'Your Profile Approved',
        html: `
            
            <p class="message">Your registration details are as follows:</p>
            <p class="message">You can access your account <a href="https://immigration.phanomprofessionals.com/stafflogin"> click here</a>.</p>
            <p class="message">Please use these credentials to access your account.</p>
        `,
    };
    

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}


module.exports ={
    sendRegistrationEmail
}