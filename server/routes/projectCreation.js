import express from "express";
import multer from "multer"; //handle file uploads
import { v2 as cloudinary } from "cloudinary";
import { pool } from "../database.js";
import dotenv from "dotenv";
import sharp from 'sharp';

dotenv.config();

export const router = express.Router();

// Configure multer to store files in memory for faster processing
const upload = multer({ storage: multer.memoryStorage() });



// Handle multiple file uploads
const uploadFields = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
  { name: 'image4', maxCount: 1 }
]);

//configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

//GET /projects - List all projects
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




// POST /projects - Create a new project
router.post("/", uploadFields, async (req, res) => {
  console.log("POST /projects received");
  const start = Date.now();
  try {
    const {
      title,
      description,
      project_link,
      image2_heading,
      image3_heading,
      image4_heading,
      technologies,
    } = req.body;
    const files = req.files;

    if (!files.image) {
      console.error("Main image is required");
      return res.status(400).json({ error: "Main image is required" });
    }

    // Resize and upload images to Cloudinary
    const uploadImage = async (file) => {
      if (!file) return null;
      const resized = await sharp(file.buffer)
        .resize({ width: 1024, withoutEnlargement: true }) // Resize to max 1024px
        .toBuffer();
      return new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            { folder: "my-projects", resource_type: "image" },
            (error, result) => {
              if (error) reject(new Error("Cloudinary upload failed"));
              resolve(result);
            }
          )
          .end(resized);
      });
    };

    const uploadStart = Date.now();
    const image = await uploadImage(files.image[0]);
    const image2 = files.image2 ? await uploadImage(files.image2[0]) : null;
    const image3 = files.image3 ? await uploadImage(files.image3[0]) : null;
    const image4 = files.image4 ? await uploadImage(files.image4[0]) : null;
    console.log(`Image uploads took ${Date.now() - uploadStart}ms`);

    const imageData = {
      image_url: image.secure_url,
      image2_url: image2 ? image2.secure_url : null,
      image2_heading: image2_heading || null,
      image3_url: image3 ? image3.secure_url : null,
      image3_heading: image3_heading || null,
      image4_url: image4 ? image4.secure_url : null,
      image4_heading: image4_heading || null,
    };

    console.log("Form data:", {
      title,
      description,
      project_link,
      ...imageData,
      technologies,
    });

    const queryStart = Date.now();
    const [queryResult] = await pool.query(
      `INSERT INTO projects (title, description, project_link, image_url, image2_url, image2_heading, 
      image3_url, image3_heading, image4_url, image4_heading, technologies) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description,
        project_link,
        imageData.image_url,
        imageData.image2_url,
        imageData.image2_heading,
        imageData.image3_url,
        imageData.image3_heading,
        imageData.image4_url,
        imageData.image4_heading,
        technologies,
      ]
    );
    console.log(`Query took ${Date.now() - queryStart}ms`);
    console.log("Query Result:", queryResult);

    console.log(`Total request took ${Date.now() - start}ms`);
    res.status(200).json({ success: true, message: "Project added successfully" });
  } catch (err) {
    console.error("Error in POST /projects:", err);
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        error: "Project title already exists. Please choose a different title.",
      });
    }
    res.status(500).json({ error: "Failed to create project", details: err.message });
  }
});

// GET /projects/:id - Project details page
router.get('/:id', async (req, res) => {
  try {
      const [result] = await pool.query('SELECT * FROM projects WHERE id = ?', [req.params.id]);
      if (result.length === 0) {
          return res.status(404).render('404');
      }
      res.render('projectDetails', { project: result[0] });
  } catch (err) {
      console.error('Error fetching project details:', err);
      res.status(500).send('Server error');
  }
});
