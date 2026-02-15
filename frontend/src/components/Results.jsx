export default function Results({ results }) {
  return (
    <div className="results-section">
      <h3>Results</h3>
      {results.totalVotes === 0 ? (
        <p className="loading" style={{ textAlign: 'left', padding: '1rem 0' }}>
          No votes yet. Be the first!
        </p>
      ) : (
        <>
        <p style={{marginBottom:"10px", fontWeight:"bold"}}>
Total Voters: {results.totalVotes}
</p>

          {results.options.map((opt, idx) => (
            <div key={idx} className="result-item">
              <div className="result-header">
                <span>{opt.text}</span>
                <span>{opt.votes} votes ({opt.percentage.toFixed(1)}%)</span>
              </div>
              <div className="result-bar-container">
                <div
                  className="result-bar"
                  style={{ width: `${opt.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
          <p className="total-votes">Total votes: {results.totalVotes}</p>
        </>
      )}
    </div>
  );
}