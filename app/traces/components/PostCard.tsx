// components/traces/PostCard.tsx
import Image from "next/image";

export default function PostCard({ post }: { post: any }) {
  return (
    <div className="bg-white dark:bg-neutral-800 p-4 rounded-xl border border-gray-200 dark:border-neutral-700 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
            <img src={post.userImage} className="w-8 h-8 rounded-full" />
            <div className="text-sm font-medium">{post.username}</div>
            <div className="ml-auto text-xs text-gray-400">{post.date}</div>
        </div>
        <p className="text-gray-800 dark:text-gray-100">{post.content}</p>
        {post.image && (
            <img src={post.image} className="mt-3 rounded-lg" />
        )}
        <div className="mt-4 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <button className="hover:text-pink-500">❤️ 좋아요</button>
            <button className="hover:text-blue-500">💬 댓글</button>
        </div>
        </div>


  );
}
