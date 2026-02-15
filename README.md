#  Pollaris – Real-Time Polling Platform

Pollaris is a full-stack real-time polling web application where users can create polls, share links, and vote live with instant result updates.

##  Live Project
Frontend: https://pollaris-frontend.vercel.app  
Backend: https://pollaris-backend.onrender.com

## Tech Stack
- React + Vite (Frontend)
- Node.js + Express (Backend)
- MongoDB Atlas (Database)
- Socket.io (Real-time updates)
- Render & Vercel (Deployment)

##  Features
- Create and share poll links
- Real-time vote updates using Socket.io
- One vote per user (IP + session protection)
- Close poll functionality (stop voting anytime)

##  Fairness 
1. One vote per IP address
2. One vote per session (browser session tracking)

These prevent duplicate or spam voting.

## Known Limitations
- No authentication (anyone with link can create poll)
- IP-based voting may not work perfectly on shared networks
- Poll creator control is basic (no login system yet)

##  Edge Cases Handled
- Empty options validation
- Less than 2 options blocked
- Multiple vote prevention
- Invalid poll ID handling
- Closed poll vote restriction

## Future Improvements
- Add user authentication (login/signup with JWT)
- Dashboard for users to manage created polls
- Edit & delete poll feature
- Poll expiration timer

## Installation (Local Setup)

Clone repo:
git clone https://github.com/yourusername/pollaris.git


- Backend:

  cd backend

  npm install

  npm start


- Frontend:

  cd frontend

  npm install

  npm run dev

Built as part of full-stack internship assignment.
