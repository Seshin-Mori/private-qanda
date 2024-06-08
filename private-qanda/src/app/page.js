"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  getDocs,
  orderBy,
  query,
  startAfter,
  limit,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import Navigation from "../components/Navigation";
import QuestionCard from "../components/QuestionCard";

const PAGE_SIZE = 10; // 1ページあたりの質問数

export default function HomePage() {
  const [questions, setQuestions] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [isLastPage, setIsLastPage] = useState(false);
  const [isFirstPage, setIsFirstPage] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem("user"));
    if (!loggedInUser) {
      router.push("/login");
    } else {
      fetchQuestions();
    }
  }, [router]);

  const fetchQuestions = async (nextPage = false) => {
    let q;
    if (nextPage && lastDoc) {
      q = query(
        collection(db, "questions"),
        orderBy("createdAt", "desc"),
        startAfter(lastDoc),
        limit(PAGE_SIZE)
      );
    } else {
      q = query(
        collection(db, "questions"),
        orderBy("createdAt", "desc"),
        limit(PAGE_SIZE)
      );
    }

    const querySnapshot = await getDocs(q);
    const questionsData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setQuestions(questionsData);
    setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);

    if (questionsData.length < PAGE_SIZE) {
      setIsLastPage(true);
    } else {
      setIsLastPage(false);
    }

    if (nextPage) {
      setIsFirstPage(false);
    } else {
      setIsFirstPage(true);
    }
  };

  const handleNextPage = () => {
    fetchQuestions(true);
  };

  const handlePreviousPage = async () => {
    const q = query(
      collection(db, "questions"),
      orderBy("createdAt", "desc"),
      limit(PAGE_SIZE)
    );
    const querySnapshot = await getDocs(q);
    const questionsData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setQuestions(questionsData);
    setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
    setIsFirstPage(true);
    setIsLastPage(false);
  };

  return (
    <div>
      <Navigation />
      <div className='container mx-auto p-4'>
        <h1 className='text-2xl font-bold mb-4'>最新の質問</h1>
        <div className='space-y-4'>
          {questions.map((question) => (
            <QuestionCard key={question.id} question={question} />
          ))}
        </div>
        <div className='flex justify-between mt-4'>
          {!isFirstPage && (
            <button
              onClick={handlePreviousPage}
              className='p-2 bg-blue-500 text-white rounded'
            >
              前のページ
            </button>
          )}
          {!isLastPage && (
            <button
              onClick={handleNextPage}
              className='p-2 bg-blue-500 text-white rounded'
            >
              次のページ
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
