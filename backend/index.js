import OpenAI from 'openai';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import PdfParse from 'pdf-parse';

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(cors());

/*
const embedPDF = async (pdfPath) => {
  const pdfBuffer = await fs.readFileSync(pdfPath);
  const pdfText = await pdfParse(pdfBuffer);
  const textEmbeddings = await openai.encode({ input: pdfText });
  return textEmbeddings;
};
*/

const openai = new OpenAI({
  organization: "org-2slaGWbYKGZYev6DRYFarM1v",
  apiKey: "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",
});

app.post("/chat", async (request, response) => {
    //console.log("response:", response); // Debug print for received chats

  const { chats } = request.body;
  console.log("Received request.body:", request.body); // Debug print for received chats
  console.log("Received chats:", chats); // Debug print for received chats
  console.log("Received response.body:", response.body); // Debug print for received chats

  if (!Array.isArray(chats)) {
    return response.status(400).send("Invalid input: 'chats' should be an array.");
  }

  try {
    console.log("Sending chats to OpenAI..."); // Debug print before sending to OpenAI

    const result = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      //embeddings: pdfEmbeddings,
      messages: [
        { "role": "system", "content": "You are a chatbot, you can write emails, etc.!" },
        ...chats,
      ],
    });

    console.log("Received response from OpenAI..."); // Debug print before handling response

    if (!result.choices || result.choices.length === 0) {
      return response.status(500).send('No choices returned from OpenAI.');
    }

    // Extract the message content from the first choice
    const messages = result.choices[0].message; // Assuming 'message' contains the desired data

    console.log("Extracted message:", messages); // Debug print for extracted message

    response.json({
      output: messages,
    });
  } catch (error) {
    console.error(error); // Debug print for error
    response.status(500).send('An error occurred processing your request.');
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});