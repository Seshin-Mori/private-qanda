"use client";

export default function AnswerCard({ answer, onLike, onReply }) {
  return (
    <div className='p-4 bg-white shadow-md rounded-lg mb-4'>
      <div className='flex items-start mb-2'>
        <span className='mr-2 text-sm text-gray-500'>{answer.replyNumber}</span>
        <div>
          <p className='mb-1'>{answer.content}</p>
          <p className='text-gray-600 text-xs'>
            投稿時間:{" "}
            {new Date(answer.createdAt.seconds * 1000).toLocaleString()}
          </p>
        </div>
      </div>
      <div className='text-gray-600 text-sm mb-2'>
        いいね: {answer.likes || 0}
      </div>
      <div className='flex space-x-4'>
        <button
          onClick={onLike}
          className='p-2 font-bold text-white bg-blue-500 rounded'
        >
          いいね
        </button>
        <button
          onClick={onReply}
          className='p-2 font-bold text-white bg-green-500 rounded'
        >
          返信
        </button>
      </div>
    </div>
  );
}
