import nodemailer from "nodemailer";
// import { createTransport } from "nodemailer";

async function MailSender(otp, mail) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    secure: false, // true for port 465, false for other ports
    auth: {
      user: "sunnysahu.in2001@gmail.com",
      pass: "rjtvybsfqcsjzuaw",
    },
  });
  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: '"VogueVault 👻" <sunnysahu.in2001@gmail.com>', // sender address
    to: mail, // list of receivers
    subject: "OTP verification", // Subject line
    text: "Hello world?", // plain text body
    html: `Your otp is <b>${otp}</b>`, // html body
  });

  console.log("Message sent: %s", info);
  // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
}

export default MailSender;
