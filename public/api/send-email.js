const nodemailer = require('nodemailer');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { to, subject, htmlContent, textContent, smtpConfig } = req.body;

  if (!to || !subject || !htmlContent || !smtpConfig) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const transporter = nodemailer.createTransporter({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.port === 465,
      auth: {
        user: smtpConfig.username,
        pass: smtpConfig.password,
      },
    });

    const mailOptions = {
      from: `"${smtpConfig.from_name}" <${smtpConfig.from_email}>`,
      to: to,
      subject: subject,
      html: htmlContent,
      text: textContent,
    };

    await transporter.sendMail(mailOptions);
    
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send email', error: error.message });
  }
}