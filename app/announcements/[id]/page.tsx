import { notFound } from "next/navigation";
import { getAnnouncementById } from "../../../lib/announcements";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

interface PageProps {
  params: { id: string };
}

// ✅ 페이지 컴포넌트
export default async function AnnouncementDetail({ params }: PageProps) {
  const post = await getAnnouncementById(params.id);

  if (!post) return notFound();

  return (
    <div className="bg-white dark:bg-black text-black dark:text-white min-h-screen px-6 pt-32 pb-20 transition-colors duration-300">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* 뒤로가기 링크 */}
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <Link href="/announcements" className="hover:underline text-blue-600 dark:text-blue-400">
            ← 안내드립니다
          </Link>
        </div>

        {/* 제목/날짜 */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {post.date} · {post.category}
          </p>
        </div>

        {/* 이미지 */}
        {post.image && (
          <Image
            src={post.image}
            alt={post.title}
            width={800}
            height={500}
            className="rounded object-cover"
          />
        )}

        {/* 본문 */}
        <p className="text-lg leading-relaxed whitespace-pre-line">{post.content}</p>
      </div>
    </div>
  );
}

// ✅ generateMetadata 함수도 동일하게 타입 수정
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await getAnnouncementById(params.id);

  if (!post) {
    return {
      title: "공지사항을 찾을 수 없습니다",
    };
  }

  return {
    title: `${post.title} - Aurum`,
    description: post.excerpt,
  };
}
