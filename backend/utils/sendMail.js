const Brevo = require("@getbrevo/brevo");

const sendMail = async (options) => {
  const apiInstance = new Brevo.TransactionalEmailsApi();
  apiInstance.authentications["apiKey"].apiKey = process.env.BREVO_API_KEY;

  const sendSmtpEmail = new Brevo.SendSmtpEmail();
  sendSmtpEmail.sender = { name: "E-Shop", email: process.env.SMPT_MAIL };
  sendSmtpEmail.to = [{ email: options.email }];
  sendSmtpEmail.subject = options.subject;
  sendSmtpEmail.textContent = options.message;

  await apiInstance.sendTransacEmail(sendSmtpEmail);
};

module.exports = sendMail;
