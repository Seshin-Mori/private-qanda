// src/components/AnswerCard.js
"use client";

export default function AnswerCard({
  answer,
  isBestAnswer,
  onBestAnswer,
  canSetBestAnswer,
  onLike,
}) {
  return (
    <div
      className={`p-4 ${
        isBestAnswer ? "bg-green-100 border border-green-500" : "bg-white"
      } shadow-md rounded-lg`}
    >
      <p className='mb-2'>{answer.content}</p>
      <p className='text-gray-600 text-sm'>いいね: {answer.likes}</p>
      <p className='text-gray-600 text-sm'>投稿者: {answer.userName}</p>
      <div className='mt-4 flex space-x-4'>
        <button
          onClick={onLike}
          className='p-2 font-bold text-white bg-blue-500 rounded'
        >
          いいね
        </button>
        {canSetBestAnswer && (
          <button
            onClick={onBestAnswer}
            className='p-2 font-bold text-white bg-blue-500 rounded'
          >
            ベストアンサーにする
          </button>
        )}
      </div>
      {isBestAnswer && (
        <p className='mt-2 font-bold text-green-700'>ベストアンサー</p>
      )}
    </div>
  );
}
