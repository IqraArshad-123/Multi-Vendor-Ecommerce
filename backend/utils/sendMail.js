const { BrevoClient } = require("@getbrevo/brevo");

const sendMail = async (options) => {
  const client = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });

  await client.transactionalEmails.sendTransacEmail({
    sender: { name: "E-Shop", email: process.env.SMPT_MAIL },
    to: [{ email: options.email }],
    subject: options.subject,
    textContent: options.message,
  });
};

module.exports = sendMail;
