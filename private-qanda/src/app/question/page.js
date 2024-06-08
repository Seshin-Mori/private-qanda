"use client"; // クライアントコンポーネントであることを示します

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  addDoc,
  updateDoc,
} from "firebase/firestore";
import { db, auth } from "../../lib/firebase";
import Navigation from "../../components/Navigation";
import AnswerCard from "../../components/AnswerCard";

export default function QuestionPage() {
  const router = useRouter();
  const { id } = router.query;
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [newAnswer, setNewAnswer] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem("user"));
    if (loggedInUser) {
      setUser(loggedInUser);
    } else {
      router.push("/login"); // ログインしていない場合はログインページにリダイレクト
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
        const answersSnapshot = await getDocs(answersCollection);
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
      const answerData = {
        content: newAnswer,
        createdAt: new Date(),
        userId: user.userId,
        likes: 0,
      };
      await addDoc(collection(db, "questions", id, "answers"), answerData);
      setNewAnswer("");
      // Fetch updated answers
      const answersCollection = collection(db, "questions", id, "answers");
      const answersSnapshot = await getDocs(answersCollection);
      const answersData = answersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAnswers(answersData);
    }
  };

  const handleBestAnswer = async (answerId) => {
    if (user && question.userId === user.userId) {
      const questionDoc = doc(db, "questions", id);
      await updateDoc(questionDoc, { bestAnswerId: answerId });
      setQuestion((prevState) => ({ ...prevState, bestAnswerId: answerId }));
    }
  };

  const handleLike = async (answerId) => {
    if (user) {
      const answerDoc = doc(db, "questions", id, "answers", answerId);
      const answerSnapshot = await getDoc(answerDoc);
      if (answerSnapshot.exists()) {
        const currentLikes = answerSnapshot.data().likes || 0;
        await updateDoc(answerDoc, { likes: currentLikes + 1 });
        // Update local state
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
        {user && !question.bestAnswerId && (
          <div className='mb-4'>
            <h2 className='text-xl font-bold mb-2'>あなたの回答</h2>
            <textarea
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              placeholder='Write your answer here...'
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
              isBestAnswer={question.bestAnswerId === answer.id}
              onBestAnswer={() => handleBestAnswer(answer.id)}
              onLike={() => handleLike(answer.id)}
              canSetBestAnswer={
                user &&
                question.userId === user.userId &&
                !question.bestAnswerId
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
