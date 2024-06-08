"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function LoginPage() {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      router.push("/");
    }
  }, [router]);

  const handleLogin = async (event) => {
    event.preventDefault(); // フォームの送信を防止

    try {
      console.log("Login button clicked"); // ボタンがクリックされたことを確認
      const q = query(
        collection(db, "users"),
        where("userName", "==", userName),
        where("password", "==", password)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        localStorage.setItem(
          "user",
          JSON.stringify({ userId: userDoc.id, userName: userData.userName })
        );
        router.push("/");
      } else {
        console.error("Login failed: Invalid credentials");
      }
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-800'>
      <div className='w-full max-w-md p-8 space-y-6 bg-white shadow-md rounded-lg'>
        <h1 className='text-2xl font-bold text-center'>ログイン</h1>
        <form onSubmit={handleLogin} className='space-y-4'>
          <input
            type='text'
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder='ユーザー名'
            className='w-full p-2 border rounded'
          />
          <input
            type='パスワード'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder='Password'
            className='w-full p-2 border rounded'
          />
          <button
            type='submit'
            className='w-full p-2 font-bold text-white bg-blue-500 rounded'
          >
            ログイン
          </button>
        </form>
      </div>
    </div>
  );
}
