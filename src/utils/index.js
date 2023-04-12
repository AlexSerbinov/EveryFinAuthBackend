const Datauri = require("datauri");
const path = require("path");

const cloudinary = require("../config/cloudinary");

async function uploader(req) {
  if (!req.files.avatar) throw new Error('for downloading images try to use key "avatar"');
  let path = JSON.stringify(req.files.avatar["path"]).replace(/\"|\"/g, "");

  const result = await new Datauri(path, (err, content, meta) => {
    if (err) {
      throw err;
    }
  });

  let cloudinar = await cloudinary.uploader.upload(result.fileName, (err, url) => {
    if (err) throw err;
    return url.url;
  });

  // console.log(cloudinar.url);
  return cloudinar.url;
}

const nodemailer = require("nodemailer");

function sendEmail(mailOptions) {
  return new Promise((resolve, reject) => {
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "explorbtcu@gmail.com",
        pass: "explorbtcu11!",
      },
    });

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) return reject(error);
      console.log(info.response);
      return resolve(info.response);
    });
  });
}

module.exports = { uploader, sendEmail };
