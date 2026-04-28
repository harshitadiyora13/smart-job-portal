const express = require('express');

const dotenv = require('dotenv');

const cors = require('cors');

const connectDB = require('./config/db.js');

const authRoutes = require('./routes/authRoutes.js');

const jobRoutes = require('./routes/jobRoutes.js');

const applicationRoutes = require('./routes/applicationRoutes.js');

const userRoutes = require('./routes/userRoutes.js');

const interviewRoutes = require('./routes/interviewRoutes.js');

const notificationRoutes = require('./routes/notificationRoutes.js');

const resumeRoutes = require('./routes/resumeRoutes.js');

const recruiterRoutes = require('./routes/recruiterRoutes.js');

const uploadRoutes = require('./routes/uploadRoutes.js');

const reviewRoutes = require('./routes/reviews.js');

const adminRoutes = require('./routes/admin.js');

const fs = require('fs');

const path = require('path');



// Load env vars

dotenv.config();



// Connect to Database

connectDB().catch(err => {

    console.error('Failed to connect to MongoDB:', err);

    console.log('Starting server without database connection...');

});



const app = express();



// Create uploads directory if it doesn't exist

const uploadsDir = path.join(__dirname, 'uploads/resumes');

const companyImagesDir = path.join(__dirname, 'uploads/company-images');



if (!fs.existsSync(uploadsDir)) {

    fs.mkdirSync(uploadsDir, { recursive: true });

}



if (!fs.existsSync(companyImagesDir)) {

    fs.mkdirSync(companyImagesDir, { recursive: true });

}



// Middleware

app.use(express.json());

app.use(cors());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// Basic Route

app.get('/', (req, res) => {

    res.send('API is running...');

});



app.use('/v1/api/auth', authRoutes);

app.use('/v1/api/jobs', jobRoutes);

app.use('/v1/api/applications', applicationRoutes);

app.use('/v1/api/users', userRoutes);

app.use('/v1/api/interviews', interviewRoutes);

app.use('/v1/api/notifications', notificationRoutes);

app.use('/v1/api/resumes', resumeRoutes);

app.use('/v1/api/recruiters', recruiterRoutes);

app.use('/v1/api/upload', uploadRoutes);

app.use('/v1/api/reviews', reviewRoutes);

app.use('/v1/api/admin', adminRoutes);



const PORT = process.env.PORT || 5000;





app.listen(PORT, () => {

    console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);

});