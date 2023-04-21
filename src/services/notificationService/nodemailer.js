const nodemailer = require('nodemailer');

async function sendEmail({ to, subject, text }) {
    console.log(`1----=-----=----=----=----=----=----- { to, subject, text }dddfdsfadsf -----=-----=-----=-----=-- 1`)
    console.log({ to, subject, text });
    console.log(`2----=-----=----=----=----=----=----- { to, subject, text }dddfdsfadsf -----=-----=-----=-----=-- 2`)
    
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Выберите почтовый сервис, который будет использоваться для отправки писем
    auth: {
      user: 'alex.serbinov.dci.3@gmail.com', // Ваш адрес электронной почты
      pass: 'gtohzigiggtnulgh', // Ваш пароль от электронной почты
    },
  });

  const mailOptions = {
    from: 'alex.serbinov.dci.3@gmail.com', // Ваш адрес электронной почты
    to,
    subject,
    text,
  };
//"alex.serbinov.dci@gmail.com", "testMailNodemailer", "hi, this is test mail"
  try {
    console.log(`1----=-----=----=----=----=----=----- { to, subject, text } -----=-----=-----=-----=-- 1`)
    console.log({ to, subject, text });
    console.log(mailOptions);
    
    console.log(`2----=-----=----=----=----=----=----- { to, subject, text } -----=-----=-----=-----=-- 2`)
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
  } catch (error) {
    console.error('Error while sending email:', error);
  }
}

module.exports = sendEmail;
