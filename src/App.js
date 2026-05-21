import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query
} from "firebase/firestore";

export default function App() {
  const [words, setWords] = useState([]);
  const [english, setEnglish] = useState("");
  const [translation, setTranslation] = useState("");
  const [delay, setDelay] = useState(2);
  const [isPlaying, setIsPlaying] = useState(false);

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = /^[A-Za-z\s]+$/.test(text) ? "en-US" : "ru-RU";
    speechSynthesis.speak(utterance);
  };

  // ЗАГРУЗКА СЛОВ ИЗ FIRESTORE
  useEffect(() => {
    const q = query(collection(db, "words"), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(q, (snapshot) => {
      setWords(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }))
      );
    });

    return () => unsub();
  }, []);

  // ДОБАВЛЕНИЕ СЛОВА В FIRESTORE
  const addWord = async () => {
    if (!english || !translation) return;

    await addDoc(collection(db, "words"), {
      english,
      translation,
      createdAt: Date.now()
    });

    setEnglish("");
    setTranslation("");
  };

  const startTraining = async () => {
    if (words.length === 0) return;
    setIsPlaying(true);

    for (let word of words) {
      speak(word.english);
      await new Promise((r) => setTimeout(r, delay * 1000));

      speak(word.translation);
      await new Promise((r) => setTimeout(r, 1500));
    }

    setIsPlaying(false);
  };

  return (
    <div style={{ maxWidth: 500, margin: "40px auto", fontFamily: "Arial" }}>
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

      <p>Слов: {words.length}</p>

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
        {words.map((word) => (
          <li key={word.id}>
            {word.english} — {word.translation}
          </li>
        ))}
      </ul>
    </div>
  );
}
