"use client";

import Link from "next/link";

export default function QuestionCard({ question }) {
  return (
    <div className='p-4 bg-white shadow-md rounded-lg hover:bg-gray-100 transition duration-300'>
      <h2 className='text-xl font-bold text-black'>{question.title}</h2>
      {/* <p className='mt-2 text-gray-600'>{question.content}</p> */}
      <Link href={`/question/${question.id}`} passHref>
        <button className='mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300'>
          質問ページへ移動
        </button>
      </Link>
    </div>
  );
}
