const cors = require('cors')
const express = require('express');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();
const PORT = 8000;
const SECRET_KEY = 'your_secret_key';

app.use(express.json());
app.use(cors())
// Helper functions to read/write users & notes
const readData = (file) => {
    if (!fs.existsSync(file)) {
        fs.writeFileSync(file, JSON.stringify([]));
        return [];
    }
    const data = fs.readFileSync(file, 'utf8');
    return data ? JSON.parse(data) : [];
};

const writeData = (file, data) => {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

// Middleware for validation
const validateRegistration = (req, res, next) => {
    const { name, email, password, phone, age, address } = req.body;
    let errors = {};
    if (!name) errors.name = "Name is required";
    if (!email) errors.email = "Email is required";
    if (!password) errors.password = "Password is required";
    if (!phone) errors.phone = "Phone number is required";
    if (!age) errors.age = "Age is required";
    if (!address) errors.address = "Address is required";

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ errors });
    }
    next();
};

const validateNote = (req, res, next) => {
    const { title, content, category, priority, tags } = req.body;
    let errors = {};
    if (!title) errors.title = "Title is required";
    if (!content) errors.content = "Content is required";
    if (!category) errors.category = "Category is required";
    if (!priority) errors.priority = "Priority is required";
    if (!tags) errors.tags = "Tags are required";

    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ errors });
    }
    next();
};

// User registration
app.post('/register', validateRegistration, async (req, res) => {
    const { name, email, password, phone, age, address } = req.body;
    const users = readData('users.json');
    if (users.find(user => user.email === email)) {
        return res.status(400).json({ message: "User already exists" });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        users.push({ name, email, password: hashedPassword, phone, age, address });
        writeData('users.json', users);
        const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: '12h' });
        res.status(201).json({ token });
    } catch (err) {
        res.status(500).json({ message: "Error hashing password", error: err.message });
    }
});

// User login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }
    const users = readData('users.json');
    const user = users.find(u => u.email === email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: '12h' });
    res.json({ token });
});

// Middleware for authentication
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({ message: "No token provided" });
    }
    const token = authHeader.split(" ")[1];
    try {
        req.user = jwt.verify(token, SECRET_KEY);
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
};

// CRUD operations for Notes
app.get('/notes', authenticate, (req, res) => {
    const notes = readData('notes.json').filter(note => note.email === req.user.email);
    res.json(notes);
});

app.get("/notes/:id", authenticate, (req, res) => {
  const notes = readData("notes.json");
  const note = notes.find(
    (n) => n.id == req.params.id && n.email === req.user.email // loose == is fine: string ‑> number
  );

  if (!note) {
    return res.status(404).json({ message: "Note not found" });
  }
  res.json(note);
});


app.post('/notes', authenticate, validateNote, (req, res) => {
    const { title, content, category, priority, tags } = req.body;
    const notes = readData('notes.json');
    const newNote = { id: Date.now(), email: req.user.email, title, content, category, priority, tags };
    notes.push(newNote);
    writeData('notes.json', notes);
    res.json(newNote);
});
//For Updating speciefic note
app.put('/notes/:id', authenticate, validateNote, (req, res) => {
    let notes = readData('notes.json');
    const noteIndex = notes.findIndex(n => n.id == req.params.id && n.email === req.user.email);
    if (noteIndex === -1) return res.status(404).json({ message: "Note not found" });
    notes[noteIndex] = { ...notes[noteIndex], ...req.body };
    writeData('notes.json', notes);
    res.json(notes[noteIndex]);
});

//For Deleting Notes
app.delete('/notes/:id', authenticate, (req, res) => {
    let notes = readData('notes.json');
    const newNotes = notes.filter(n => n.id != req.params.id || n.email !== req.user.email);
    writeData('notes.json', newNotes);
    res.json({ message: "Note deleted" });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
