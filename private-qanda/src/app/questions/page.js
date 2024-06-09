// src/app/questions/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { db } from "@/lib/firebase";
import Navigation from "@/components/Navigation";
import AnswerCard from "@/components/AnswerCard";

export default function QuestionDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [newAnswer, setNewAnswer] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [questionAuthor, setQuestionAuthor] = useState(null);

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem("user"));
    if (loggedInUser) {
      setUser(loggedInUser);
    } else {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    const questionId = searchParams.get("questionId");
    console.log("Question ID:", questionId);
    if (questionId) {
      fetchQuestionData(questionId);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const fetchQuestionData = async (questionId) => {
    try {
      const questionDocRef = doc(db, "questions", questionId);
      const questionSnapshot = await getDoc(questionDocRef);

      if (questionSnapshot.exists()) {
        const questionData = questionSnapshot.data();
        setQuestion({ id: questionSnapshot.id, ...questionData });

        const userDocRef = doc(db, "users", questionData.userId);
        const userSnapshot = await getDoc(userDocRef);

        if (userSnapshot.exists()) {
          setQuestionAuthor(userSnapshot.data());
        } else {
          console.error("User not found");
        }

        const answersCollection = collection(
          db,
          "questions",
          questionId,
          "answers"
        );
        const answersQuery = query(answersCollection, orderBy("likes", "desc"));
        const answersSnapshot = await getDocs(answersQuery);
        const answersData = await Promise.all(
          answersSnapshot.docs.map(async (docSnapshot) => {
            const answerData = docSnapshot.data();
            const answerUserDocRef = doc(db, "users", answerData.userId);
            const answerUserSnapshot = await getDoc(answerUserDocRef);

            return {
              id: docSnapshot.id,
              ...answerData,
              userName: answerUserSnapshot.exists()
                ? answerUserSnapshot.data().userName
                : "Unknown",
            };
          })
        );

        console.log("Answers Data:", answersData);

        setAnswers(answersData);
      } else {
        console.error("Question not found");
      }
    } catch (error) {
      console.error("Error fetching data: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAnswer = async () => {
    if (user) {
      const answerData = {
        content: newAnswer,
        createdAt: new Date(),
        userId: user.userId,
        likes: 0,
      };
      await addDoc(
        collection(db, "questions", question.id, "answers"),
        answerData
      );
      setNewAnswer("");
      fetchQuestionData(question.id);
    }
  };

  const handleBestAnswer = async (answerId) => {
    if (user && question.userId === user.userId) {
      const questionDoc = doc(db, "questions", question.id);
      await updateDoc(questionDoc, { bestAnswerId: answerId });
      setQuestion((prevState) => ({ ...prevState, bestAnswerId: answerId }));
    }
  };

  const handleLike = async (answerId) => {
    if (user) {
      const answerDoc = doc(db, "questions", question.id, "answers", answerId);
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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!question) {
    return <div>Question not found.</div>;
  }

  return (
    <div>
      <Navigation />
      <div className='container mx-auto p-4'>
        <h1 className='text-2xl font-bold mb-4'>{question.title}</h1>
        <p className='mb-4'>{question.content}</p>
        {questionAuthor && (
          <p className='mb-4'>投稿者: {questionAuthor.userName}</p>
        )}
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
