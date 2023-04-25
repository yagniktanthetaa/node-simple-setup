const nodemailer = require("nodemailer");
const path = require("path");

const otpEmail = async (data) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 443,
      secure: true,
      service: "gmail",
      auth: {
        user: "kenilmangroliya18@gmail.com",
        pass: "vyyxrbisvczzgyvb",
      },
    });

    const mailOptions = {
      from: "<kenilmangroliya18@gmail.com>",
      to: data.email,
      subject: "Welcome!",
      template: "email", // the name of the template file i.e email.handlebars
      html: `<b>${data.otp}</b>`,
      // context: {
      //   name: data.name,
      //   otp: data.otp,
      // },
    };

    // trigger the sending of the E-mail
    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        return error.message;
      }
      console.log("Mail send success");
    });
  } catch (error) {
    console.log("🚀 ~ otpEmail ~ error:", error);
  }
};

module.exports = { otpEmail };
