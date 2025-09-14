export default async function handler(req, res) {
  console.log('Email API called:', { method: req.method, timestamp: new Date().toISOString() });
  
  if (req.method !== 'POST') {
    console.warn('Invalid method attempted:', req.method);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { to, subject, htmlContent, textContent, smtpConfig } = req.body;

  if (!to || !subject || !htmlContent || !smtpConfig) {
    console.warn('Missing required fields in request');
    return res.status(400).json({ message: 'Missing required fields' });
  }

  if (!smtpConfig.host || !smtpConfig.username || !smtpConfig.password) {
    console.warn('Invalid SMTP configuration provided');
    return res.status(400).json({ message: 'Invalid SMTP configuration' });
  }

  try {
    console.log('Attempting to send email to:', to.replace(/(.{3}).*@/, '$1***@'));
    
    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.default.createTransporter({
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
    
    console.log('Email sent successfully to:', to.replace(/(.{3}).*@/, '$1***@'));
    
    if (!res.headersSent) {
      res.status(200).json({ message: 'Email sent successfully' });
    }
  } catch (error) {
    console.error('Error sending email:', { 
      message: error.message, 
      code: error.code, 
      timestamp: new Date().toISOString() 
    });
    
    if (res.headersSent) {
      return;
    }
    
    if (error.code === 'EAUTH') {
      console.error('SMTP Authentication failed:', { host: smtpConfig.host, user: smtpConfig.username });
      return res.status(401).json({ message: 'Authentication failed', error: 'Invalid SMTP credentials' });
    }
    
    if (error.code === 'ECONNECTION') {
      console.error('SMTP Connection failed:', { host: smtpConfig.host, port: smtpConfig.port });
      return res.status(503).json({ message: 'Connection failed', error: 'Unable to connect to SMTP server' });
    }
    
    console.error('Unhandled email error:', { code: error.code, message: error.message });
    return res.status(500).json({ message: 'Failed to send email', error: error.message || 'Unknown error' });
  } finally {
    console.log('Email handler completed:', { timestamp: new Date().toISOString(), method: req.method });
  }
}