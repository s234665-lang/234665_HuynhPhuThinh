const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const Book = require('./models/Book');

const app = express();
app.use(cors());
app.use(express.json());

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

// Health check API
app.get('/health', (req, res) => res.status(200).json({ status: 'Backend is running' }));

// 1. GET danh sách / Tìm kiếm
app.get('/api/books', async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query = {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { author: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } }
        ]
      };
    }
    const books = await Book.find(query);
    res.json(books);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// 2. GET một sách
app.get('/api/books/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// 3. POST thêm sách
app.post('/api/books', async (req, res) => {
  try {
    const existingBook = await Book.findOne({ bookId: req.body.bookId });
    if (existingBook) return res.status(400).json({ message: 'bookId already exists' });
    
    const newBook = new Book(req.body);
    await newBook.save();
    res.status(201).json(newBook);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// 4. PUT cập nhật sách
app.put('/api/books/:id', async (req, res) => {
  try {
    const updatedBook = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedBook) return res.status(404).json({ message: 'Book not found' });
    res.json(updatedBook);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// 5. DELETE xóa sách
app.delete('/api/books/:id', async (req, res) => {
  try {
    const deletedBook = await Book.findByIdAndDelete(req.params.id);
    if (!deletedBook) return res.status(404).json({ message: 'Book not found' });
    res.json({ message: 'Book deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));