import express from "express";
import multer from "multer"; //handle file uploads
import { v2 as cloudinary } from "cloudinary";
import { pool } from "../database.js";
import dotenv from "dotenv";

dotenv.config();

export const router = express.Router();

//save uploaded image file in the server folder
const upload = multer({ dest: ".uploads/" });

//configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

router.get("/", async (req, res) => {
  try {
    const [result] = await pool.query("SELECT * FROM projects");
    res.render("projects", { projects: Array.isArray(result) ? result : [] });
  } catch (err) {
    console.error("Error fetching projects:", err);
    res.status(500).send("Server error");
  }
});

router.get("/create", (req, res) => {
  res.render("createProject");
});

//route to handle the data uploaded by the user
router.post('/', upload.single('image'), async (req, res) => {
  try {
      if (!req.file) {
          console.error('No file uploaded');
          return res.status(400).json({ error: 'No image file uploaded' });
      }
      const { title, description } = req.body;
      const filePath = req.file.path;

      // Upload image to Cloudinary
      const result = await cloudinary.uploader.upload(filePath, { folder: 'my-projects' });
      const imageUrl = result.secure_url;
      console.log('Cloudinary URL:', imageUrl);

      // Save to MySQL
      const [queryResult] = await pool.query(
          'INSERT INTO projects (title, description, image_url) VALUES (?, ?, ?)',
          [title, description, imageUrl]
      );

      res.status(200).json({ success: true });
  } catch (err) {
      console.error('Error in POST /projects:', err);
      res.status(500).json({ error: 'Failed to create project'});
  }
});