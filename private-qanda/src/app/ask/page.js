"use client";

import { useState, useEffect } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useRouter } from "next/navigation";
import Navigation from "../../components/Navigation";

export default function AskPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem("user"));
    if (loggedInUser) {
      setUser(loggedInUser);
    } else {
      router.push("/login"); // ログインしていない場合はログインページにリダイレクト
    }
  }, [router]);

  const handleSubmit = async (event) => {
    event.preventDefault(); // フォームの送信を防止
    console.log("Submit button clicked");

    if (!user) {
      console.error("No user is logged in");
      return;
    }

    try {
      console.log("Adding document to Firestore");
      await addDoc(collection(db, "questions"), {
        title,
        content,
        createdAt: new Date(),
        userId: user.userName, // ユーザー名を保存
      });
      console.log("Document added successfully");
      router.push("/");
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  return (
    <div>
      <Navigation />
      <div className='container mx-auto p-4'>
        <h1 className='text-2xl font-bold mb-4'>質問を投稿</h1>
        <form onSubmit={handleSubmit}>
          <input
            type='text'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder='タイトル'
            className='w-full p-2 border rounded mb-4'
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder='本文'
            className='w-full p-2 border rounded mb-4'
          />
          <button
            type='submit'
            className='w-full p-2 font-bold text-white bg-blue-500 rounded'
          >
            投稿
          </button>
        </form>
      </div>
    </div>
  );
}
