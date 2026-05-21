import React, { useState, useRef } from "react";

export default function App() {
  const [words, setWords] = useState([]);
  const [english, setEnglish] = useState("");
  const [translation, setTranslation] = useState("");
  const [delay, setDelay] = useState(2);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef(null);

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = /^[A-Za-z\s]+$/.test(text) ? "en-US" : "ru-RU";
    speechSynthesis.speak(utterance);
  };

  const addWord = () => {
    if (!english || !translation) return;
    if (words.length >= 20) return;
    setWords([...words, { english, translation }]);
    setEnglish("");
    setTranslation("");
  };

  const startTraining = async () => {
    if (words.length === 0) return;
    setIsPlaying(true);

    for (let word of words) {
      speak(word.english);

      await new Promise((resolve) =>
        setTimeout(resolve, delay * 1000)
      );

      speak(word.translation);

      await new Promise((resolve) =>
        setTimeout(resolve, 1500)
      );
    }

    setIsPlaying(false);
  };

  return (
    <div style={{ maxWidth: "500px", margin: "40px auto", fontFamily: "Arial" }}>
      <h2>English Word Trainer</h2>

      <input
        placeholder="English word"
        value={english}
        onChange={(e) => setEnglish(e.target.value)}
      />
      <br /><br />

      <input
        placeholder="Перевод"
        value={translation}
        onChange={(e) => setTranslation(e.target.value)}
      />
      <br /><br />

      <button onClick={addWord}>Добавить слово</button>

      <p>Слов: {words.length}/20</p>

      <label>Интервал: {delay} сек</label>
      <br />
      <input
        type="range"
        min="0.5"
        max="5"
        step="0.5"
        value={delay}
        onChange={(e) => setDelay(Number(e.target.value))}
      />

      <br /><br />

      <button onClick={startTraining} disabled={isPlaying}>
        {isPlaying ? "Идет тренировка..." : "Старт"}
      </button>

      <ul>
        {words.map((word, index) => (
          <li key={index}>
            {word.english} — {word.translation}
          </li>
        ))}
      </ul>
    </div>
  );
}
