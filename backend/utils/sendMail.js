const SibApiV3Sdk = require("@getbrevo/brevo");

const sendMail = async (options) => {
  const defaultClient = SibApiV3Sdk.ApiClient.instance;
  defaultClient.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.sender = { name: "E-Shop", email: process.env.SMPT_MAIL };
  sendSmtpEmail.to = [{ email: options.email }];
  sendSmtpEmail.subject = options.subject;
  sendSmtpEmail.textContent = options.message;

  await apiInstance.sendTransacEmail(sendSmtpEmail);
};

module.exports = sendMail;
