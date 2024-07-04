const express = require('express');
const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

app.post('/api/referral', async (req, res) => {
  const { referrerName, referrerEmail, refereeName, refereeEmail } = req.body;

  if (!referrerName || !referrerEmail || !refereeName || !refereeEmail) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const newReferral = await prisma.referral.create({
    data: {
      referrerName,
      referrerEmail,
      refereeName,
      refereeEmail
    }
  });

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: refereeEmail,
    subject: 'Referral Invitation',
    text: `Hi ${refereeName},\n\nYou have been referred by ${referrerName}.`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).json({ error: 'Failed to send email' });
    }
    res.status(201).json(newReferral);
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
