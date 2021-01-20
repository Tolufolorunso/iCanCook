const nodemailer = require('nodemailer');
// const { options } = require('../routes/authRoutes');
const sendEmail = async options => {
	// create reusable transporter object using the default SMTP transport
	let transporter = nodemailer.createTransport({
		host: process.env.EMAIL_HOST,
		port: process.env.EMAIL_PORT,
		auth: {
			user: process.env.EMAIL_USERNAME,
			pass: process.env.EMAIL_PASSWORD
		}
	});

	// send mail with defined transport object
	const message = {
		from: `iCanCook <hello@icancook.com>`,
		to: options.email,
		subject: options.subject,
		text: options.message
	};

    // Actually send the email 
	const info = await transporter.sendMail(message);

	console.log('Message sent: %s', info.messageId);
};

module.exports = sendEmail;