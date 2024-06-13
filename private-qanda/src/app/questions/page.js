"use client";

import React, { useEffect, useState, Suspense } from "react";
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
import { validateNotEmpty } from "../../utils/validation";

function ClientQuestionPage({ initialQuestion }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [question, setQuestion] = useState(initialQuestion);
  const [answers, setAnswers] = useState([]);
  const [newAnswer, setNewAnswer] = useState("");
  const [handleName, setHandleName] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [replyNumber, setReplyNumber] = useState(1);

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem("user"));
    if (loggedInUser) {
      setUser(loggedInUser);
    } else {
      window.location.href = "/login";
    }
  }, []);

  useEffect(() => {
    const questionId = searchParams.get("questionId");
    if (questionId) {
      fetchQuestionData(questionId);
    }
  }, [searchParams]);

  const fetchQuestionData = async (questionId) => {
    try {
      const questionDocRef = doc(db, "questions", questionId);
      const questionSnapshot = await getDoc(questionDocRef);

      if (questionSnapshot.exists()) {
        const questionData = questionSnapshot.data();
        setQuestion({ id: questionSnapshot.id, ...questionData });

        const answersCollection = collection(
          db,
          "questions",
          questionId,
          "answers"
        );
        const answersSnapshot = await getDocs(
          query(answersCollection, orderBy("replyNumber", "asc"))
        );
        const answersData = answersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAnswers(answersData);

        if (answersData.length > 0) {
          const maxReplyNumber = Math.max(
            ...answersData.map((answer) => answer.replyNumber || 0)
          );
          setReplyNumber(maxReplyNumber + 1);
        }
      } else {
        console.error("Question not found");
      }
    } catch (error) {
      console.error("Error fetching question data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAnswer = async () => {
    if (!validateNotEmpty(newAnswer)) {
      setError("レスを入力してください。");
      return;
    }
    setError("");

    if (user && question) {
      const answerData = {
        content: newAnswer,
        createdAt: new Date(),
        userId: user.userId,
        likes: 0,
        replyNumber: replyNumber,
        handleName: handleName || "名無しさん",
      };
      await addDoc(
        collection(db, "questions", question.id, "answers"),
        answerData
      );
      setNewAnswer("");
      setHandleName("");
      setReplyNumber(replyNumber + 1);

      fetchQuestionData(question.id);
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

  const handleReply = (replyNumber) => {
    setNewAnswer((prev) => `${prev}>>${replyNumber} `);
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
        <p
          className='mb-4'
          dangerouslySetInnerHTML={{
            __html: question.content.replace(/\n/g, "<br />"),
          }}
        ></p>

        <h2 className='text-xl font-bold mb-2'>レス一覧</h2>
        <div className='space-y-4'>
          {answers.map((answer) => (
            <AnswerCard
              key={answer.id}
              answer={answer}
              onLike={() => handleLike(answer.id)}
              onReply={() => handleReply(answer.replyNumber)}
            />
          ))}
        </div>
        {user && (
          <div className='mt-8 mb-4'>
            <h2 className='text-xl font-bold mb-2'>レスを投稿する</h2>
            <input
              type='text'
              value={handleName}
              onChange={(e) => setHandleName(e.target.value)}
              placeholder='ハンドルネーム（空白可）'
              className='w-full p-2 border rounded mb-4'
            />
            <textarea
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              placeholder='レスを入力'
              className='w-full p-2 border rounded mb-4'
            />
            {error && <p className='text-red-500 mb-4'>{error}</p>}
            <button
              onClick={handleAddAnswer}
              className='w-full p-2 font-bold text-white bg-blue-500 rounded'
            >
              レスを投稿
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PageWrapper(props) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClientQuestionPage {...props} />
    </Suspense>
  );
}
