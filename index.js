const express = require('express');
const { OpenAI }= require('openai'); 
const dotenv = require('dotenv');
dotenv.config();
const app = express();
const cors = require('cors')

const PORT = process.env.PORT ; 
app.use(express.json());

app.use(cors({
  origin: *, // Allow requests only from this domain
  methods: ['POST'], // Limit to POST requests
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY 
});

app.post('/api/chat', async (req, res) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are Kaksha AI, a helpful assistant for JEE students, designed to help with Physics, Chemistry, and Math questions. Provide clear, concise explanations for their problems, using concepts relevant to JEE preparation. If asked, mention that your developer is Pankaj Jaat."
        },
        {
          role: "user",
          content: req.body.prompt 
        }
      ],
      max_tokens: 1000,
      stream: true,
    });

   
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    response.on('data', (chunk) => {
      const data = JSON.parse(chunk.toString());
      if (data.choices && data.choices[0].delta && data.choices[0].delta.content) {
        res.write(data.choices[0].delta.content);
      }
    });

    response.on('end', () => {
      res.end();
    });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: 'An error occurred during the streaming process.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
