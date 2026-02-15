import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CreatePoll from './components/CreatePoll';
import Poll from './components/Poll';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
         <header className="header">
          <div className="container" style={{flexDirection:"column", alignItems:"center"}}>
            <h1>Pollaris - Real Time Poll Rooms</h1>
            <p style={{opacity:0.85, marginTop:"6px"}}>
      Create polls and share with friends in real-time
    </p>
          </div>
        </header>
        
      

        <main className="container">
          <Routes>
            <Route path="/" element={<CreatePoll />} />
            <Route path="/poll/:id" element={<Poll />} />
          </Routes>
        </main>
      
        <footer style={{
          marginTop:"60px",
          textAlign:"center",
          opacity:"0.6",
          fontSize:"14px"
         }}>
         © 2026 Pollaris • Built by Numa Patait
       </footer>

      </div>
    </BrowserRouter>
  );
}

export default App;