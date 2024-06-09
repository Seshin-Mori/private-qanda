"use client";

import React, { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  addDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import Navigation from "@/components/Navigation";
import AnswerCard from "@/components/AnswerCard";

export default function ClientQuestionPage({ id, initialQuestion }) {
  const [question, setQuestion] = useState(initialQuestion);
  const [answers, setAnswers] = useState([]);
  const [newAnswer, setNewAnswer] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem("user"));
    if (loggedInUser) {
      setUser(loggedInUser);
    } else {
      window.location.href = "/login";
    }
  }, []);

  useEffect(() => {
    if (id) {
      const fetchQuestionData = async () => {
        const questionDocRef = doc(db, "questions", id);
        const questionSnapshot = await getDoc(questionDocRef);

        if (questionSnapshot.exists()) {
          const questionData = questionSnapshot.data();
          setQuestion({ id: questionSnapshot.id, ...questionData });

          const answersCollection = collection(db, "questions", id, "answers");
          const answersSnapshot = await getDocs(answersCollection);
          const answersData = answersSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setAnswers(answersData);
        } else {
          console.error("Question not found");
        }
      };

      fetchQuestionData();
    }
  }, [id]);

  const handleAddAnswer = async () => {
    if (user) {
      const answerData = {
        content: newAnswer,
        createdAt: new Date(),
        userId: user.userId,
        likes: 0,
      };
      await addDoc(collection(db, "questions", id, "answers"), answerData);
      setNewAnswer("");
      const answersCollection = collection(db, "questions", id, "answers");
      const answersSnapshot = await getDocs(answersCollection);
      const answersData = answersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAnswers(answersData);
    }
  };

  const handleLike = async (answerId) => {
    if (user) {
      const answerDoc = doc(db, "questions", id, "answers", answerId);
      const answerSnapshot = await getDoc(answerDoc);
      if (answerSnapshot.exists()) {
        const currentLikes = answerSnapshot.data().likes || 0;
        await updateDoc(answerDoc, { likes: currentLikes + 1 });
        setAnswers((prevState) =>
          prevState.map((answer) =>
            answer.id === answerId
              ? { ...answer, likes: currentLikes + 1 }
              : answer
          )
        );
      }
    }
  };

  if (!question) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Navigation />
      <div className='container mx-auto p-4'>
        <h1 className='text-2xl font-bold mb-4'>{question.title}</h1>
        <p className='mb-4'>{question.content}</p>
        {user && (
          <div className='mb-4'>
            <h2 className='text-xl font-bold mb-2'>あなたの回答</h2>
            <textarea
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              placeholder='回答を入力'
              className='w-full p-2 border rounded mb-4'
            />
            <button
              onClick={handleAddAnswer}
              className='w-full p-2 font-bold text-white bg-blue-500 rounded'
            >
              回答を投稿
            </button>
          </div>
        )}
        <h2 className='text-xl font-bold mb-2'>回答</h2>
        <div className='space-y-4'>
          {answers.map((answer) => (
            <AnswerCard
              key={answer.id}
              answer={answer}
              onLike={() => handleLike(answer.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
