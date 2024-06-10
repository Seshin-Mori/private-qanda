"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navigation() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem("user"));
    if (loggedInUser) {
      setUser(loggedInUser);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  };

  return (
    <nav className='p-4 bg-gray-800 text-white'>
      <ul className='flex flex-wrap space-x-4 space-y-2'>
        <li className='w-full sm:w-auto'>
          <Link href='/'>
            <button className='w-full sm:w-auto bg-green-500 text-white px-4 py-2 rounded'>
              トップページへ
            </button>
          </Link>
        </li>
        <li className='w-full sm:w-auto'>
          <Link href='/ask'>
            <button className='w-full sm:w-auto bg-blue-500 text-white px-4 py-2 rounded'>
              質問を投稿する
            </button>
          </Link>
        </li>
        {user ? (
          <>
            {/* <li className='w-full sm:w-auto flex items-center'>
              ログインユーザー：{user.userName}
            </li> */}
            <li className='w-full sm:w-auto'>
              <button
                onClick={handleLogout}
                className='w-full sm:w-auto bg-red-500 text-white px-4 py-2 rounded'
              >
                ログアウト
              </button>
            </li>
          </>
        ) : (
          <li className='w-full sm:w-auto'>
            <Link href='/login'>
              <button className='w-full sm:w-auto bg-green-500 text-white px-4 py-2 rounded'>
                ログイン
              </button>
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
