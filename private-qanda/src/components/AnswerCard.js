"use client";

export default function AnswerCard({ answer, onLike, onReply }) {
  const handleName = answer.handleName || "名無しさん";
  return (
    <div className='p-4 bg-white shadow-md rounded-lg mb-4'>
      <div className='flex flex-col mb-2'>
        <div className='flex items-center mb-1'>
          <span className='mr-2 text-lg font-bold text-blue-600'>
            {answer.replyNumber}:
          </span>
          <p className='text-lg font-bold text-blue-600'>{handleName}</p>
        </div>
        <p className='text-sm text-gray-600 mb-1'>
          {new Date(answer.createdAt.seconds * 1000).toLocaleString()}
        </p>
        <p className='mb-1'>{answer.content}</p>
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
