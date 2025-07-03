import express from 'express';
import dotenv from 'dotenv';
import OpenAI from 'openai'; // ✅ FIXED: default import
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || PORT;

// Parse JSON bodies
app.use(express.json());

// Setup for static files
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, '../../dist');

// Ensure dist directory exists
if (!fs.existsSync(distPath)) {
  fs.mkdirSync(distPath, { recursive: true });
}

app.use(express.static(distPath));

// In-memory cache
const termsCache = new Map();

// Initialize OpenAI client if API key is available
let openai;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  console.log("✅ OpenAI initialized");
} else {
  console.warn("⚠️ OPENAI_API_KEY not found. Definitions will not work.");
}

// Preload terms from file if available
try {
  const termsFilePath = path.join(__dirname, '../data/terms.json');
  if (fs.existsSync(termsFilePath)) {
    const termsData = JSON.parse(fs.readFileSync(termsFilePath, 'utf8'));
    for (const term of termsData) {
      termsCache.set(term.term.toLowerCase(), term);
    }
    console.log(`Loaded ${termsData.length} terms from terms.json`);
  }
} catch (error) {
  console.error('Error loading terms from file:', error);
}

// API route to define a term
app.get('/api/define', async (req, res) => {
  try {
    const { term } = req.query;

    if (!term) {
      return res.status(400).json({ error: 'Term parameter is required' });
    }

    const normalizedTerm = term.toLowerCase().trim();

    // Check cache first
    if (termsCache.has(normalizedTerm)) {
      return res.json(termsCache.get(normalizedTerm));
    }

    // ✅ SAFETY CHECK
    if (!openai) {
      return res.status(500).json({ error: 'OpenAI API is not configured' });
    }

    // Call OpenAI API
    const prompt = `Generate a JSON object explaining the React term "${term}"in simple, easy-to-understand language for beginners with keys:
      • purpose: a short sentence describing what it does
      • why: an array of 3–5 bullet points explaining why you'd use it
      • example: a real-world use case description
      • code: a concise copy-ready code snippet
      • summary: A brief scenario showing how you’d use it in a React app.

      Return only valid JSON. Do not include any other text.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const responseText = completion.choices[0].message.content.trim();

    console.log("📦 Raw OpenAI response:\n", responseText); // helpful debug log

    // Parse the JSON response
    let definitionData;
    try {
      const jsonMatch = responseText.match(/```(?:json)?([\s\S]*)```/) || [null, responseText];
      const jsonText = jsonMatch[1].trim();
      definitionData = JSON.parse(jsonText);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to parse OpenAI response' });
    }

    // Add term and timestamp
    definitionData.term = term;
    definitionData.createdAt = new Date().toISOString();

    // Cache it
    termsCache.set(normalizedTerm, definitionData);

    return res.json(definitionData);
  } catch (error) {
    console.error('Error in /api/define:', error);
    return res.status(500).json({ error: 'An error occurred while processing your request' });
  }
});

// API route to suggest a term
app.post('/api/suggest', (req, res) => {
  try {
    const { term, details } = req.body;

    if (!term) {
      return res.status(400).json({ success: false, message: 'Term is required' });
    }

    console.log('Term suggestion received:', { term, details });

    return res.json({ success: true, message: 'Your suggestion has been received and will be reviewed' });
  } catch (error) {
    console.error('Error in /api/suggest:', error);
    return res.status(500).json({ success: false, message: 'An error occurred while processing your request' });
  }
});

// Serve the React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
