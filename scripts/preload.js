import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';

// Load environment variables
dotenv.config();

// Check for OpenAI API key
if (!process.env.OPENAI_API_KEY) {
  console.error('Error: OPENAI_API_KEY environment variable is required');
  process.exit(1);
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Directory setup
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '../src/data');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// List of common React terms to preload
const reactTerms = [
  'useState',
  'useEffect',
  'useContext',
  'useReducer',
  'useCallback',
  'useMemo',
  'useRef',
  'useLayoutEffect',
  'useImperativeHandle',
  'useDebugValue',
  'memo',
  'lazy',
  'Suspense',
  'React.memo',
  'React.lazy',
  'React.Fragment',
  'React.StrictMode',
  'React.Children',
  'React.cloneElement',
  'React.createElement',
  'React.createRef',
  'React.forwardRef',
  'React.isValidElement',
  'useState hook',
  'useEffect hook',
  'useContext hook',
  'useReducer hook',
  'props',
  'state',
  'context',
  'lifecycle methods',
  'componentDidMount',
  'componentDidUpdate',
  'componentWillUnmount',
  'render',
  'virtual DOM',
  'JSX',
  'React Router',
  'Link',
  'NavLink',
  'Route',
  'Routes',
  'Redux',
  'Provider',
  'connect',
  'useSelector',
  'useDispatch',
  'styled-components',
  'axios',
  'fetch',
  'key prop',
  'controlled component',
  'uncontrolled component'
];

// Generate definition for a single term
async function generateDefinition(term) {
  try {
    console.log(`Generating definition for "${term}"...`);
    
    const prompt = `Generate a JSON object describing the React term "${term}" with keys:
      • purpose: a short sentence describing what it does
      • why: an array of 3–5 bullet points explaining why you'd use it
      • example: a real-world use case description
      • code: a concise copy-ready code snippet
      • summary: a one-line takeaway
      
      Return only valid JSON. Do not include any other text.`;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });
    
    const responseText = completion.choices[0].message.content.trim();
    
    // Parse the JSON response
    try {
      // Extract JSON if it's wrapped in markdown code blocks
      const jsonMatch = responseText.match(/```(?:json)?([\s\S]*)```/) || [null, responseText];
      const jsonText = jsonMatch[1].trim();
      const definition = JSON.parse(jsonText);
      
      // Add term and created date
      definition.term = term;
      definition.createdAt = new Date().toISOString();
      definition.moderated = true;
      
      return definition;
    } catch (error) {
      console.error(`Error parsing response for "${term}":`, error);
      console.error('Response text:', responseText);
      return null;
    }
  } catch (error) {
    console.error(`Error generating definition for "${term}":`, error);
    return null;
  }
}

// Main function to generate all definitions
async function generateAllDefinitions() {
  console.log(`Starting to generate definitions for ${reactTerms.length} React terms...`);
  
  const definitions = [];
  const existingDefinitionsPath = path.join(dataDir, 'terms.json');
  
  // Load existing definitions if available
  if (fs.existsSync(existingDefinitionsPath)) {
    try {
      const existingData = JSON.parse(fs.readFileSync(existingDefinitionsPath, 'utf8'));
      definitions.push(...existingData);
      console.log(`Loaded ${existingData.length} existing definitions`);
    } catch (error) {
      console.error('Error loading existing definitions:', error);
    }
  }
  
  // Get existing terms
  const existingTerms = new Set(definitions.map(d => d.term.toLowerCase()));
  
  // Filter out terms that already exist
  const termsToGenerate = reactTerms.filter(term => !existingTerms.has(term.toLowerCase()));
  
  console.log(`Generating definitions for ${termsToGenerate.length} new terms...`);
  
  // Generate definitions for new terms
  for (const term of termsToGenerate) {
    const definition = await generateDefinition(term);
    if (definition) {
      definitions.push(definition);
      
      // Save after each successful generation
      fs.writeFileSync(existingDefinitionsPath, JSON.stringify(definitions, null, 2));
      console.log(`Saved definition for "${term}"`);
      
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log(`Completed! Generated ${definitions.length} total definitions.`);
}

// Run the script
generateAllDefinitions().catch(error => {
  console.error('Error in generation process:', error);
  process.exit(1);
});