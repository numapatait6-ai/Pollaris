import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import socket from '../socket';
import Results from './Results';

export default function Poll() {
  const { id } = useParams();
  const [poll, setPoll] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [voted, setVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState('');
  const [voteError, setVoteError] = useState('');
  const [isClosed, setIsClosed] = useState(false);


  const pollUrl = `${window.location.origin}/poll/${id}`;

  useEffect(() => {
    socket.emit('join-poll', id);
    socket.on('update_results', (updatedResults) => {
      setResults(updatedResults);
    });

    fetch(`${import.meta.env.VITE_API_URL}/api/polls/${id}`, {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setPoll(data);
        setResults(data.results);
        setIsClosed(data.isClosed);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });

    return () => {
      socket.off('update_results');
      socket.emit('leave-poll', id);
    };
  }, [id]);

  const handleVote = async (e) => {
    e.preventDefault();
    if (!selectedOption) {
      setVoteError('Please select an option');
      return;
    }
    setVoteError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/polls/${id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionText: selectedOption }),
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          setVoteError('You have already voted in this poll.');
          setVoted(true);
        } else {
          throw new Error(data.error || 'Vote failed');
        }
      } else {
        setVoted(true);
      }
    } catch (err) {
      setVoteError(err.message);
    }
  };

  if (loading) return <div className="loading">Loading poll...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="poll-card">
      <h2>{poll.question}</h2>

     
      <div className="share-link">
        Share this poll: {pollUrl}
      </div>

      <div style={{marginTop:"10px", display:"flex", gap:"10px", flexWrap:"wrap"}}>
        
        
        <button
          onClick={() => {
            navigator.clipboard.writeText(pollUrl);
            alert("Link copied!");
          }}
          style={{padding:"8px 12px", background:"#333", color:"#fff", border:"none", borderRadius:"6px"}}
        >
          Copy Link
        </button>

        
        <a
          href={`https://wa.me/?text=Vote%20in%20this%20poll:%20${encodeURIComponent(pollUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <button style={{padding:"8px 12px", background:"#25D366", color:"#fff", border:"none", borderRadius:"6px"}}>
            Share on WhatsApp
          </button>
        </a>

        <a
          href={`https://t.me/share/url?url=${encodeURIComponent(pollUrl)}&text=Vote in this poll`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <button style={{padding:"8px 12px", background:"#0088cc", color:"#fff", border:"none", borderRadius:"6px"}}>
            Share on Telegram
          </button>
        </a>

      </div>
      {isClosed && (
  <div className="warning-message">
    🚫 Voting closed for this poll
  </div>
)}


    {!voted && !voteError && !isClosed && (
        <form onSubmit={handleVote}>
          <div className="form-group">
            {poll.options.map(opt => (
              <label key={opt._id || opt.text} className="vote-option">
                <input
                  type="radio"
                  name="option"
                  value={opt.text}
                  checked={selectedOption === opt.text}
                  onChange={(e) => setSelectedOption(e.target.value)}
                />
                <span>{opt.text}</span>
              </label>
            ))}
          </div>
          <button type="submit" className="btn-primary">
            Vote
          </button>
        </form>
      )}
      {!isClosed && (
  <button
    onClick={async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/polls/${id}/close`, {
        method: "POST"
      });
      const data = await res.json();
      if (data.success) {
        alert("Poll closed!");
        setIsClosed(true);
      }
    }}
    style={{
      marginTop:"10px",
      padding:"8px 12px",
      background:"red",
      color:"#fff",
      border:"none",
      borderRadius:"6px"
    }}
  >
    Close Poll
  </button>
)}


      {voteError && (
        <div className="warning-message">
          {voteError}
        </div>
      )}

      {results && <Results results={results} />}
    </div>
  );
}
