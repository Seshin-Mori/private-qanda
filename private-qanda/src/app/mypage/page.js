"use client";
//マイページは廃止予定
import { useState, useEffect } from "react";
import { auth, db } from "../../lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { useRouter } from "next/navigation"; // 修正点
import Navigation from "../../components/Navigation";
import Link from "next/link";

export default function MyPage() {
  const [userName, setUserName] = useState("");
  const [userQuestions, setUserQuestions] = useState([]);
  const router = useRouter();
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        const userDoc = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDoc);
        if (userDocSnap.exists()) {
          setUserName(userDocSnap.data().name);
        }

        const q = query(
          collection(db, "questions"),
          where("userId", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);
        const questionsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUserQuestions(questionsData);
      };

      fetchUserData();
    } else {
      router.push("/login");
    }
  }, [user, router]);

  const handleUpdate = async () => {
    if (user) {
      const userDoc = doc(db, "users", user.uid);
      await updateDoc(userDoc, { name: userName });
    }
  };

  return (
    <div>
      <Navigation />
      <div className='container mx-auto p-4'>
        <h1 className='text-2xl font-bold mb-4'>My Page</h1>
        <input
          type='text'
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder='User Name'
          className='w-full p-2 border rounded mb-4'
        />
        <button
          onClick={handleUpdate}
          className='w-full p-2 font-bold text-white bg-blue-500 rounded mb-4'
        >
          Update
        </button>
        <h2 className='text-xl font-bold mb-2'>My Questions</h2>
        <div className='space-y-4'>
          {userQuestions.map((question) => (
            <div
              key={question.id}
              className='p-4 bg-white shadow-md rounded-lg'
            >
              <Link href={`/question/${question.id}`}>
                <a className='text-xl font-bold'>{question.title}</a>
              </Link>
              <p className='mt-2 text-gray-600'>{question.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
