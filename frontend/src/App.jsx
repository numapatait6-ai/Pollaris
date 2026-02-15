import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CreatePoll from './components/CreatePoll';
import Poll from './components/Poll';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <header className="header">
          <div className="container">
            <h1>Pollaris - Real Time Poll Rooms</h1>
          </div>
        </header>
        <main className="container">
          <Routes>
            <Route path="/" element={<CreatePoll />} />
            <Route path="/poll/:id" element={<Poll />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;