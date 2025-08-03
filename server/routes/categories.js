const express = require('express');
const router = express.Router();

const categories = [
  'Web Application',
  'Mobile App',
  'Desktop Software',
  'AI/ML',
  'Business Software',
  'Analytics',
  'Finance',
  'E-commerce',
  'Game Development',
  'DevOps Tools',
  'UI/UX Design',
  'Graphic Design',
  'Data Science',
  'Machine Learning',
  'Blockchain',
  'IoT',
  'Cybersecurity',
  'Cloud Computing',
  'API Development',
  'Database Design'
];

// GET /api/categories
router.get('/', (req, res) => {
  res.json({ categories });
});

module.exports = router;
