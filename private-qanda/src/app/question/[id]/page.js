import { getDocs, collection, doc, getDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import dynamic from "next/dynamic";
import Navigation from "../../../components/Navigation";

// クライアントコンポーネントを動的インポート
const ClientQuestionPage = dynamic(() => import("./ClientQuestionPage"), {
  ssr: false,
});

export async function generateStaticParams() {
  const questionsSnapshot = await getDocs(collection(db, "questions"));
  return questionsSnapshot.docs.map((doc) => ({
    id: doc.id,
  }));
}

export async function generateMetadata({ params }) {
  const { id } = params;
  const questionDoc = doc(db, "questions", id);
  const questionSnapshot = await getDoc(questionDoc);
  const question = questionSnapshot.exists() ? questionSnapshot.data() : null;

  return {
    title: question ? question.title : "Question Not Found",
  };
}

export default async function QuestionPage({ params }) {
  const { id } = params;

  if (!id) {
    return (
      <div>
        <Navigation />
        <p>Question ID is missing.</p>
      </div>
    );
  }

  const questionDoc = doc(db, "questions", id);
  const questionSnapshot = await getDoc(questionDoc);
  const question = questionSnapshot.exists()
    ? {
        id: questionSnapshot.id,
        ...questionSnapshot.data(),
        createdAt: questionSnapshot.data().createdAt.toMillis(), // タイムスタンプをミリ秒に変換
      }
    : null;

  return (
    <div>
      <Navigation />
      <ClientQuestionPage id={id} question={question} />
    </div>
  );
}
