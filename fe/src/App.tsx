import { useState, useEffect } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';

function App() {
  const [count, setCount] = useState(0);
  const [apiResponse, setApiResponse] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/test');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.text();
      setApiResponse(data);
      setError('');
    } catch (err) {
      setError('Error');
      setApiResponse('Error');
    }
  };

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>

      {/* API 응답 표시 섹션 */}
      <div className="mt-4 p-4 border rounded">
        <h2 className="text-xl font-bold mb-2">API Response</h2>
        {apiResponse && (
          <div className="bg-green-50 p-3 rounded">
            <p>{apiResponse}</p>
          </div>
        )}
        {error && (
          <div className="bg-red-50 p-3 rounded text-red-600">
            <p>Error: {error}</p>
          </div>
        )}
      </div>

      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
