import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const prisma = new PrismaClient();
import cloudinary from "../../config/cloudinary.config";
const fs = require("fs");

const deleteResources = async (filePath) => {
  await fs.unlink(filePath, (err) => {
    if (err) {
      console.log(err);
    }
  });
};

export const processLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashed = await bcrypt.hash("Aroma@@", 12);
    console.log(hashed);
    const isUserValid = await prisma.user.findUnique({
      where: {
        Email: email,
      },
    });
    if (isUserValid) {
      const isPasswordValid = await bcrypt.compare(
        password,
        isUserValid.Password
      );
      if (isPasswordValid) {
        const secretKey = process.env.JWT_SECRET_KEY;
        const jwtToken = jwt.sign(
          { ...isUserValid, Role: "admin" },
          secretKey,
          {
            expiresIn: "24h",
          }
        );
        res.status(200).json({
          status: true,
          jwtToken,
          data: isUserValid,
          message: "User Logged In Successfully",
        });
      } else {
        res.status(401).json({
          status: false,
          message: "Wrong Credentials",
        });
      }
    } else {
      res.status(401).json({
        status: false,
        message: "Wrong Credentials",
      });
    }
  } catch (error) {
    res.status(401).json({
      status: false,
      message: error.message,
    });
  } finally {
    await prisma.$disconnect();
  }
};

export const getMyInfo = async (req, res) => {
  try {
    const jwtToken = req.headers.authorization?.split(" ")[1];
    const secretKey = process.env.JWT_SECRET_KEY;
    const userDetails = jwt.verify(
      jwtToken,
      process.env.JWT_SECRET_KEY ?? ""
    );
    res.status(200).json({
      status: true,
      data: userDetails,
      message: "User Data Fetched Successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  } finally {
    await prisma.$disconnect();
  }
};

export const userPassAvatarChange = async (req, res) => {
  try {
    const { newPassword, currentPassword, id, isPhotoChanged } = req.body;
    const uploadedPhoto = req.file?.path;
    const user = await prisma.user.findUnique({
      where: {
        User_Id: Number(id),
      },
    });
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.Password
    );
    if (isCurrentPasswordValid) {
      const hashedPassword = await bcrypt.hash(
        newPassword,
        Number(process.env.BCRYPT_SALT_ROUND)
      );
      if (isPhotoChanged) {
        if (user.photo_public_id !== null) {
          await cloudinary.v2.uploader.destroy(user.photo_public_id);
        }
        const newPhoto = await cloudinary.v2.uploader.upload(uploadedPhoto, {
          gravity: "face", // Use 'face' gravity to focus on the detected face
          width: 300,
          height: 300,
          crop: "thumb", // You can use 'thumb' for face-based cropping
        });
        deleteResources(uploadedPhoto);
        const updatedUser = await prisma.user.update({
          where: {
            User_Id: Number(id),
          },
          data: {
            Password: hashedPassword,
            photo: newPhoto.secure_url,
            photo_public_id: newPhoto.public_id,
          },
        });
        res.status(200).json({
          status: true,
          data: updatedUser,
          message: "User Details Updated Successfully",
        });
      } else {
        const updatedUser = await prisma.user.update({
          where: {
            User_Id: Number(id),
          },
          data: {
            Password: hashedPassword,
          },
        });
        res.status(200).json({
          status: true,
          data: updatedUser,
          message: "User Details Updated Successfully",
        });
      }
    } else {
      res.status(401).json({
        status: false,
        message: "Current Password doesn't match",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  } finally {
    await prisma.$disconnect();
  }
};

export const userProfilePicUpdate = async (req, res) => {
  try {
    const { id } = req.body;
    const uploadedPhoto = req.file?.path;
    const user = await prisma.user.findUnique({
      where: {
        User_Id: Number(id),
      },
    });
    if (user.photo_public_id !== null) {
      await cloudinary.v2.uploader.destroy(user.photo_public_id);
    }
    const newPhoto = await cloudinary.v2.uploader.upload(uploadedPhoto, {
      gravity: "face", // Use 'face' gravity to focus on the detected face
      width: 300,
      height: 300,
      crop: "thumb", // You can use 'thumb' for face-based cropping
    });
    deleteResources(uploadedPhoto);
    const updatedUser = await prisma.user.update({
      where: {
        User_Id: Number(id),
      },
      data: {
        photo: newPhoto.secure_url,
        photo_public_id: newPhoto.public_id,
      },
    });
    res.status(200).json({
      status: true,
      data: updatedUser,
      message: "User Details Updated Successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  } finally {
    await prisma.$disconnect();
  }
};
