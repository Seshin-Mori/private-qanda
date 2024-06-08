"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../../../lib/firebase";
import Navigation from "../../../components/Navigation";
import AnswerCard from "../../../components/AnswerCard";

export default function QuestionPage({ params }) {
  const router = useRouter();
  const { id } = params;
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [newAnswer, setNewAnswer] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem("user"));
    if (loggedInUser) {
      setUser(loggedInUser);
    } else {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    if (id) {
      const fetchQuestion = async () => {
        const questionDoc = doc(db, "questions", id);
        const questionSnapshot = await getDoc(questionDoc);
        if (questionSnapshot.exists()) {
          setQuestion({ id: questionSnapshot.id, ...questionSnapshot.data() });
        }
      };

      const fetchAnswers = async () => {
        const answersCollection = collection(db, "questions", id, "answers");
        const q = query(answersCollection, orderBy("likes", "desc"));
        const answersSnapshot = await getDocs(q);
        const answersData = answersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAnswers(answersData);
      };

      fetchQuestion();
      fetchAnswers();
    }
  }, [id]);

  const handleAddAnswer = async () => {
    if (user) {
      const userId = user.userId;
      if (!userId) {
        console.error("User ID is missing");
        return;
      }

      const answerData = {
        content: newAnswer,
        createdAt: new Date(),
        userId: userId,
        userName: user.userName,
        likes: 0,
      };

      try {
        await addDoc(collection(db, "questions", id, "answers"), answerData);
        setNewAnswer("");
        const answersCollection = collection(db, "questions", id, "answers");
        const q = query(answersCollection, orderBy("likes", "desc"));
        const answersSnapshot = await getDocs(q);
        const answersData = answersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAnswers(answersData);
      } catch (error) {
        console.error("Error adding document: ", error);
      }
    }
  };

  const handleBestAnswer = async (answerId) => {
    console.log("handleBestAnswer called with answerId:", answerId);
    if (user && question.userId === user.userName) {
      try {
        const questionDoc = doc(db, "questions", id);
        await updateDoc(questionDoc, { bestAnswerId: answerId });
        console.log("Best answer updated successfully");
        setQuestion((prevState) => ({ ...prevState, bestAnswerId: answerId }));
      } catch (error) {
        console.error("Error updating best answer: ", error);
      }
    } else {
      console.log("User is not authorized to set best answer");
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

  const sortedAnswers = [...answers].sort((a, b) => b.likes - a.likes);
  if (question.bestAnswerId) {
    const bestAnswerIndex = sortedAnswers.findIndex(
      (answer) => answer.id === question.bestAnswerId
    );
    if (bestAnswerIndex > -1) {
      const [bestAnswer] = sortedAnswers.splice(bestAnswerIndex, 1);
      sortedAnswers.unshift(bestAnswer);
    }
  }

  return (
    <div>
      <Navigation />
      <div className='container mx-auto p-4'>
        <h1 className='text-2xl font-bold mb-4'>{question.title}</h1>
        <p className='mb-4'>{question.content}</p>
        <p className='text-gray-600'>投稿者: {question.userId}</p>
        {user && !question.bestAnswerId && (
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
          {sortedAnswers.map((answer) => (
            <AnswerCard
              key={answer.id}
              answer={answer}
              isBestAnswer={question.bestAnswerId === answer.id}
              onBestAnswer={() => handleBestAnswer(answer.id)}
              onLike={() => handleLike(answer.id)}
              canSetBestAnswer={
                user &&
                question.userId === user.userName &&
                !question.bestAnswerId
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
