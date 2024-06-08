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
  getFirestore,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import Navigation from "@/components/Navigation";
import AnswerCard from "@/components/AnswerCard";

// Firestoreのインスタンスを取得
const firestoreInstance = getFirestore(db.app);

export default function QuestionPage() {
  const router = useRouter();
  const [id, setId] = useState(null); // 初期値をnullに設定
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [newAnswer, setNewAnswer] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Checking if user is logged in...");
    const loggedInUser = JSON.parse(localStorage.getItem("user"));
    if (loggedInUser) {
      console.log("User is logged in:", loggedInUser);
      setUser(loggedInUser);
    } else {
      console.log("User is not logged in, redirecting to /login");
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    if (!router.isReady) {
      console.log("Router is not ready");
      return; // routerが準備できていない場合は何もしない
    }
    const { id: queryId } = router.query;
    console.log("Router is ready, queryId:", queryId);
    if (queryId) {
      setId(queryId);
    }
  }, [router.isReady, router.query]);

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        try {
          const questionDocRef = doc(firestoreInstance, "questions", id);
          const questionSnapshot = await getDoc(questionDocRef);

          if (questionSnapshot.exists()) {
            const questionData = questionSnapshot.data();

            // 回答をネストされたコレクションから取得 (where句で絞り込み)
            const answersQuery = query(
              collection(questionDocRef, "answers"),
              // 例: 特定の条件で絞り込む場合
              // where("createdAt", ">", new Date(Date.now() - 24 * 60 * 60 * 1000)) // 24時間以内の回答
              limit(10) // 一度に取得する回答数を制限
            );
            const answersSnapshot = await getDocs(answersQuery);
            const answersData = answersSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));

            setQuestion({ id: questionSnapshot.id, ...questionData });
            setAnswers(answersData);
          } else {
            console.log("Question does not exist");
          }
        } catch (error) {
          console.error("Error fetching data: ", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [id]);

  const handleAddAnswer = async () => {
    if (user) {
      console.log("Adding new answer for user:", user);
      const answerData = {
        content: newAnswer,
        createdAt: new Date(),
        userId: user.userId,
        likes: 0,
      };
      await addDoc(
        collection(firestoreInstance, "questions", id, "answers"),
        answerData
      );
      console.log("New answer added:", answerData);
      setNewAnswer("");
      // Fetch updated answers
      const answersCollection = collection(
        firestoreInstance,
        "questions",
        id,
        "answers"
      );
      const answersSnapshot = await getDocs(answersCollection);
      const answersData = answersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("Updated answers fetched:", answersData);
      setAnswers(answersData);
    }
  };

  const handleBestAnswer = async (answerId) => {
    if (user && question.userId === user.userId) {
      console.log("Setting best answer:", answerId);
      const questionDoc = doc(firestoreInstance, "questions", id);
      await updateDoc(questionDoc, { bestAnswerId: answerId });
      setQuestion((prevState) => ({ ...prevState, bestAnswerId: answerId }));
      console.log("Best answer set:", answerId);
    }
  };

  const handleLike = async (answerId) => {
    if (user) {
      console.log("Liking answer:", answerId);
      const answerDoc = doc(
        firestoreInstance,
        "questions",
        id,
        "answers",
        answerId
      );
      const answerSnapshot = await getDoc(answerDoc);
      if (answerSnapshot.exists()) {
        const currentLikes = answerSnapshot.data().likes || 0;
        await updateDoc(answerDoc, { likes: currentLikes + 1 });
        console.log(
          "Answer liked:",
          answerId,
          "new likes count:",
          currentLikes + 1
        );
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

  if (loading) {
    console.log("Loading data...");
    return <div>Loading...</div>;
  }

  if (!question) {
    console.log("No question found for id:", id);
    return <div>Question not found.</div>;
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
