const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const crypto = require('crypto');
require('dotenv').config();

const Poll = require('./models/Poll');
const Vote = require('./models/Vote');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  }
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Session middleware
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
 store: new MongoStore({
  mongoUrl: process.env.MONGODB_URI
}),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  }
});

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

app.use(express.json());
app.use(sessionMiddleware);


io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
});


function hashIp(ip) {
  return crypto.createHash('sha256').update(ip + process.env.IP_SALT).digest('hex');
}

//  get poll results
async function getPollResults(pollId) {
  const poll = await Poll.findById(pollId);
 if (!poll) return res.status(404).json({ error: 'Poll not found' });

if (poll.isClosed) {
  return res.status(403).json({ error: "Voting closed for this poll" });
}
  const votes = await Vote.find({ pollId });
  const totalVotes = votes.length;
  const results = poll.options.map(opt => {
    const count = votes.filter(v => v.optionText === opt.text).length;
    return {
      text: opt.text,
      votes: count,
      percentage: totalVotes === 0 ? 0 : (count / totalVotes) * 100
    };
  });
  return { options: results, totalVotes };
}

// Socket.io
io.on('connection', (socket) => {
  socket.on('join-poll', (pollId) => {
    socket.join(pollId);
  });
  socket.on('leave-poll', (pollId) => {
    socket.leave(pollId);
  });
});

// Routes

// Create poll
app.post('/api/polls', async (req, res) => {
  try {
    const { question, options } = req.body;
    if (!question || !options || options.length < 2) {
      return res.status(400).json({ error: 'Question and at least 2 options required' });
    }
    const filteredOptions = options.filter(opt => opt.trim() !== '');
    if (filteredOptions.length < 2) {
      return res.status(400).json({ error: 'At least two non-empty options required' });
    }
    const poll = new Poll({
      question,
      options: filteredOptions.map(text => ({ text }))
    });
    await poll.save();
    res.status(201).json({ id: poll._id, shareLink: `/poll/${poll._id}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get poll details
app.get('/api/polls/:id', async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ error: 'Poll not found' });
    const results = await getPollResults(poll._id);
    res.json({
      id: poll._id,
      question: poll.question,
      options: poll.options,
      results
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Vote on poll
app.post('/api/polls/:id/vote', async (req, res) => {
  const pollId = req.params.id;
  const { optionText } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const voterIpHash = hashIp(ip);
  const sessionId = req.session.id;

  if (!optionText) return res.status(400).json({ error: 'optionText required' });

  try {
    // Verify poll exists and option is valid
    const poll = await Poll.findById(pollId);
    if (!poll) return res.status(404).json({ error: 'Poll not found' });
    const optionExists = poll.options.some(opt => opt.text === optionText);
    if (!optionExists) return res.status(400).json({ error: 'Invalid option' });

    // Check for existing vote from this IP or session
    const existingVote = await Vote.findOne({
      pollId,
      $or: [
        { voterIpHash },
        { sessionId }
      ]
    });

    if (existingVote) {
      return res.status(409).json({ error: 'You have already voted in this poll' });
    }

    // Create vote
    const vote = new Vote({
      pollId,
      optionText,
      voterIpHash,
      sessionId
    });
    await vote.save();

    // Get updated results and broadcast
    const results = await getPollResults(pollId);
    io.to(pollId).emit('update_results', results);

    res.status(201).json({ success: true });
  } catch (err) {
    // Handle duplicate key errors (race condition)
    if (err.code === 11000) {
      return res.status(409).json({ error: 'You have already voted in this poll' });
    }
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// CLOSE POLL
app.post('/api/polls/:id/close', async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ error: 'Poll not found' });

    poll.isClosed = true;
    await poll.save();

    res.json({ success: true, message: "Poll closed" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Server error' });
  }
});


const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});