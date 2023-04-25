// const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const HTTP = require("../constant/response.constant");

const usermodel = require("../model/userModel");
const { otpEmail } = require("../email/email");
const { encodeData, decodeData } = require("../public/partials/cryptoJS");

const random = Math.random().toString().substr(2, 4);

const register = async (req, res) => {
  try {
    const { name, email, password, contact, verify_otp } = req.body;

    const userEmail = await usermodel.findOne({ email });

    if (userEmail) {
      return res.status(HTTP.SUCCESS).send({
        status: true,
        code: HTTP.SUCCESS,
        message: "Email Is Already Taken",
      });
    }

    if (!userEmail) {
      const passwordHash = await bcrypt.hash(password, 10);
      const user = {
        name,
        email,
        password: passwordHash,
        contact,
        otp: random,
        verify_otp,
      };
      await otpEmail(user);
      await usermodel(user).save();
      return res.status(HTTP.SUCCESS).send({
        status: true,
        code: HTTP.SUCCESS,
        message: "Entity saved successfully",
        data: user,
      });
    }
  } catch (error) {
    if (error) {
      return res.status(HTTP.BAD_REQUEST).send({
        status: true,
        code: HTTP.BAD_REQUEST,
        message: error,
      });
    }
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    var compare = await usermodel.findOne({ email: email });

    if (compare.verify_otp == false) {
      return res.status(HTTP.SUCCESS).send({
        status: true,
        code: HTTP.SUCCESS,
        message: "You are not verify for login because your otp not verify",
      });
    }

    bcrypt.compare(password, compare.password, (err, result) => {
      if (result == true) {
        const token = jwt.sign(
          { id: compare._id, email: compare.email },
          process.env.SECRET_KEY
        );
        return res.status(HTTP.SUCCESS).send({
          status: true,
          code: HTTP.SUCCESS,
          message: "Login successfully",
          data: token,
        });
      } else {
        return res.status(HTTP.SUCCESS).send({
          status: true,
          code: HTTP.SUCCESS,
          message: "Enter valid password",
        });
      }
    });
  } catch (error) {
    return res.status(HTTP.FORBIDDEN).send({
      status: true,
      code: HTTP.FORBIDDEN,
      message: "Email is not valid",
    });
  }
};

const getUser = async (req, res) => {
  try {
    new Promise(async (resolve, reject) => {
      try {
        const userData = await usermodel.find();
        resolve();
        return res.status(HTTP.SUCCESS).send({
          status: true,
          code: HTTP.SUCCESS,
          message: "User data found",
          data: userData,
        });
      } catch (error) {
        reject();
      }
    });
  } catch (error) {
    return res.status(HTTP.FORBIDDEN).send({
      status: true,
      code: HTTP.FORBIDDEN,
      message: "Data not found",
    });
  }
};

/***********************************************/
//-------------- for development only ----------/
/***********************************************/

//Decode data(only for developement)
const encodeReqData = (req, res) => {
  try {
    console.log("🚀 ~ encodeReqData ~ encodeReqData:", req.body.decData);

    if (req.body.decData) {
      return res.status(200).send({
        status: true,
        message: "encoded data",
        data: encodeData(req.body.decData),
      });
    } else {
      return res
        .status(401)
        .send({ status: false, message: "Please provide data", data: {} });
    }
  } catch (e) {
    return res.status(HTTP.SUCCESS).send({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      message: "Something went wrong!",
      data: {},
    });
  }
};

//Decode data(only for developement)
const decodeResData = (req, res) => {
  try {
    console.log("🚀 ~ decodeResData ~ req.body.encData:", req.body.encData);
    if (req.body.encData) {
      return res.send(decodeData(req.body.encData));
    } else {
      return res
        .status(401)
        .send({ status: false, message: "Please provide data", data: {} });
    }
  } catch (e) {
    return res.status(HTTP.SUCCESS).send({
      status: false,
      code: HTTP.INTERNAL_SERVER_ERROR,
      message: "Something went wrong!",
      data: {},
    });
  }
};

module.exports = {
  register,
  login,
  getUser,
  encodeReqData,
  decodeResData,
};
