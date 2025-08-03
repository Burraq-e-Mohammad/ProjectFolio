const express = require('express');
const router = express.Router();

const instructions = `
1. Register or log in to your account.
2. Go to "Post Ad" and fill in all required project details.
3. Choose the correct category for your project.
4. Upload clear images/screenshots of your project.
5. Set a fair price and provide a detailed description.
6. Submit your ad for customers to view and purchase.
`;

router.get('/', (req, res) => {
  res.json({ instructions });
});

module.exports = router;
