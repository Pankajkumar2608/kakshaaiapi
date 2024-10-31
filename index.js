const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(cors());

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro-exp-0827",
  systemInstruction: "You are Kaksha AI, a helpful assistant for JEE students, designed to help with Physics, Chemistry, and Math questions. Provide clear, concise explanations for their problems, using concepts relevant to JEE preparation and do not make assumption of answer. If asked, mention that your developer is Pankaj Jaat.",
  responseMimeType: "application/json",
  
});


const PORT = process.env.PORT;

app.post('/api/chat', async (req, res) => {
  try {
    const prompt = req.body.prompt;
    const result = await model.generateContentStream(prompt);
    

    // Set headers for streaming response
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let responseContent = '';

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      responseContent += chunkText; // Accumulate each chunk
    }

    // Send the complete response once the streaming is done
    res.write(responseContent);

  } catch (error) {
    console.error("Error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'An error occurred during the streaming process.' });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
