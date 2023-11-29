import React, { useState } from 'react';
import axios from 'axios';
import { PDFDocument } from 'pdf-lib';

function App() {
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  const sendChat = async () => {
    const chats = chatHistory.concat({ role: 'user', content: userInput });

    try {
      const response = await axios.post('http://localhost:3001/chat', { chats });

      if (response.data && response.data.output) {
        setChatHistory(chats.concat(response.data.output));
      }
    } catch (error) {
      console.error('Error:', error);
      // Handle error (show error message, etc.)
    }

    setUserInput(''); // Clear the input field after sending
  };

  const handleFileChange = async (event) => { // Make the function asynchronous
    const selectedFile = event.target.files[0];

    if (!selectedFile) {
      // Deselect the PDF file
      setSelectedFile(null);
      return;
    }

    if (selectedFile.type === 'application/pdf') {
      // Convert the selected PDF to text and save it to a TXT file
      try {
        const fileData = await selectedFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(fileData);
        const pages = pdfDoc.getPages();
        const text = [];

        for (const page of pages) {
          text.push(await page.getText());
        }

        const txtContent = text.join('\n');
        const fileName = selectedFile.name.replace('.pdf', '.txt');
        const saveableData = new Blob([txtContent], { type: 'text/plain' });

        const saveFile = (blob, fileName) => {
          if (window.navigator.msSaveBlob) {
            window.navigator.msSaveBlob(blob, fileName);
          } else {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = fileName;

            link.click();
            URL.revokeObjectURL(link.href);
          }
        };

        saveFile(saveableData, fileName);
      } catch (error) {
        console.error('Error:', error);
        // Handle file conversion error
      }
    } else {
      console.error('Invalid file type. Only PDF files are allowed.');
    }
  };

  return (
    <div className="App">
      <h1>Chat with AI</h1>

      <div>
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type your message"
          rows="2"
        />

        <button onClick={sendChat}>Send</button>
      </div>

      <input type="file" accept=".pdf" onChange={handleFileChange} />

      <button onClick={() => setSelectedFile(null)}>Deselect</button>

      <div>
        {chatHistory.map((chat, index) => (
          <p key={index}>
            <b>{chat.role === 'user' ? 'You' : 'Bot'}:</b> {chat.content}
          </p>
        ))}
      </div>
    </div>
  );
}

export default App;