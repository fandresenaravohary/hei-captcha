import { useState } from 'react';
import './App.css';

function App() {
  const [number, setNumber] = useState('');
  const [output, setOutput] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const n = parseInt(number, 10);
    if (n < 1 || n > 1000) {
      alert('Please enter a number between 1 and 1000.');
      return;
    }

    setOutput([]);
    setIsFormVisible(false); // Hide form

    for (let i = 1; i <= n; i++) {
      try {
        const response = await fetch('https://api.prod.jcloudify.com/whoami');
        if (response.status === 200) {
          const text = await response.text();
          setOutput((prev) => [...prev, `${i}. ${text}`]);
        } else if (response.status === 403) {
          await handleCaptcha(i);
        } else {
          setOutput((prev) => [...prev, `${i}. Forbidden`]);
        }
      } catch (error) {
        setOutput((prev) => [...prev, `${i}. Network Error`]);
      }
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Pause 1 second
    }

    setIsFormVisible(true); // Show form again
  };

  const handleCaptcha = async (attempt) => {
    return new Promise((resolve) => {
      setOutput((prev) => [
        ...prev,
        `${attempt}. CAPTCHA required, please solve it...`,
      ]);

      // Attendre que l'utilisateur résolve le CAPTCHA
      window.awsWafCaptchaCallback = function () {
        alert('CAPTCHA solved successfully!');
        resolve();
      };
    });
  };

  return (
    <div className="App">
      {isFormVisible && (
        <form onSubmit={handleSubmit}>
          <label>
            Enter a number (1-1000):
            <input
              type="number"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              min="1"
              max="1000"
              required
            />
          </label>
          <button type="submit">Submit</button>
        </form>
      )}
      <div id="output">
        {output.map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>
      <script
        type="text/javascript"
        src="https://b82b1763d1c3.ef7ef6cc.eu-west-3.captcha.awswaf.com/b82b1763d1c3/jsapi.js"
      ></script>
    </div>
  );
}

export default App;
