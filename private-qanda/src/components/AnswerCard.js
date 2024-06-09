"use client";

export default function AnswerCard({ answer, onLike }) {
  return (
    <div className='p-4 bg-white shadow-md rounded-lg'>
      <p className='mb-2'>{answer.content}</p>
      <p className='text-gray-600 text-sm'>いいね: {answer.likes}</p>
      <div className='mt-4 flex space-x-4'>
        <button
          onClick={onLike}
          className='p-2 font-bold text-white bg-blue-500 rounded'
        >
          いいね
        </button>
      </div>
    </div>
  );
}
