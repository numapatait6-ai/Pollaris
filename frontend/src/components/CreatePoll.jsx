import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreatePoll() {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const addOption = () => setOptions([...options, '']);
  const removeOption = (index) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== index));
  };
  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const filteredOptions = options.filter(opt => opt.trim() !== '');
    if (!question.trim()) {
      setError('Question is required');
      return;
    }
    if (filteredOptions.length < 2) {
      setError('At least two non-empty options are required');
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/polls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, options: filteredOptions }),
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create poll');
      navigate(`/poll/${data.id}`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="poll-card">
      <h2>Create a New Poll</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="question">Question</label>
          <input
            type="text"
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="input-field"
            placeholder="What's your favorite programming language?"
          />
        </div>
        <div className="form-group">
          <label>Options</label>
          {options.map((opt, idx) => (
            <div key={idx} className="option-row">
              <input
                type="text"
                value={opt}
                onChange={(e) => updateOption(idx, e.target.value)}
                className="input-field"
                placeholder={`Option ${idx + 1}`}
              />
              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(idx)}
                  className="remove-option"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addOption}
            className="add-option"
          >
            + Add option
          </button>
        </div>
        {error && <div className="error-message">{error}</div>}
        <button type="submit" className="btn-primary">
          Create Poll
        </button>
      </form>
    </div>
  );
}