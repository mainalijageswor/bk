import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/Uploads"); // Specify the destination folder for uploads
  },
  filename: (req, file, cb) => {
    const uniqueSuffix =
      Date.now() + "-" + Math.round(Math.random() * 1e9) + file.originalname;
    cb(null, uniqueSuffix);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Invalid File type. Only images are allowed."));
  }
};

export const upload = multer({
  storage,
  limits: {
    //60 mb max size
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter,
});
