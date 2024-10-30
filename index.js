const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai") ;
const dotenv = require('dotenv');
dotenv.config();
const app = express();
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: "You are Kaksha AI, a helpful assistant for JEE students, designed to help with Physics, Chemistry, and Math questions. Provide clear, concise explanations for their problems, using concepts relevant to JEE preparation and do not make assumption of answer. If asked, mention that your developer is Pankaj Jaat.",
});

const PORT = process.env.PORT ; 
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  try {
    
    const prompt = req.body.prompt;
    const result = await model.generateContentStream(prompt);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      res.write(chunkText);
    }

    res.end();

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: 'An error occurred during the streaming process.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

