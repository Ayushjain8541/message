const express = require('express');
const cors = require('cors');
const app = express();
const port = 8000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (replace with a database in production)
let messages = [];
let drivers = [];

// Helper function to generate unique IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// Messages endpoints
app.get('/messages', (req, res) => {
  res.json({ messages });
});

app.post('/submit', (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const newMessage = {
    id: generateId(),
    text: message,
    timestamp: new Date().toISOString(),
    assignedDriver: null
  };

  messages.push(newMessage);
  res.status(201).json(newMessage);
});

app.delete('/messages/:id', (req, res) => {
  const { id } = req.params;
  const initialLength = messages.length;
  messages = messages.filter(msg => msg.id !== id);
  
  if (messages.length === initialLength) {
    return res.status(404).json({ error: 'Message not found' });
  }
  
  res.status(204).send();
});

app.post('/messages/:id/assign', (req, res) => {
  const { id } = req.params;
  const { driverId } = req.body;

  const message = messages.find(msg => msg.id === id);
  if (!message) {
    return res.status(404).json({ error: 'Message not found' });
  }

  const driver = drivers.find(d => d.id === driverId);
  if (!driver) {
    return res.status(404).json({ error: 'Driver not found' });
  }

  message.assignedDriver = driver;
  res.json(message);
});

// Drivers endpoints
app.get('/drivers', (req, res) => {
  res.json({ drivers });
});

app.post('/drivers', (req, res) => {
  const { name, phone } = req.body;
  
  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone are required' });
  }

  const newDriver = {
    id: generateId(),
    name,
    phone
  };

  drivers.push(newDriver);
  res.status(201).json(newDriver);
});

app.delete('/drivers/:id', (req, res) => {
  const { id } = req.params;
  
  // Remove driver from any assigned messages
  messages.forEach(msg => {
    if (msg.assignedDriver && msg.assignedDriver.id === id) {
      msg.assignedDriver = null;
    }
  });

  const initialLength = drivers.length;
  drivers = drivers.filter(driver => driver.id !== id);
  
  if (drivers.length === initialLength) {
    return res.status(404).json({ error: 'Driver not found' });
  }
  
  res.status(204).send();
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 