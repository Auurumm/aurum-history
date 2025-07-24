// app/traces/page.tsx

import HeroSection from "./components/HeroSection";
import PostCard from "./components/PostCard";

// ✨ 예시 데이터
const dummyPosts = [
  {
    id: 1,
    username: "Bookery",
    userImage: "/images/user1.png",
    content: "오늘 점심은 제육볶음!",
    image: "/images/pork.jpg",
    date: "2025.07.24",
  },
  {
    id: 2,
    username: "Aurum_김은영",
    userImage: "/images/user2.png",
    content: "산책 중 예쁜 골목 발견했어요 🌿",
    image: "/images/alley.jpg",
    date: "2025.07.23",
  },
];

export default function TracesPage() {
  return (
    <main className="bg-black min-h-screen">
      <HeroSection />

      <section
        id="scroll-target"
        className="max-w-3xl mx-auto px-4 py-12 text-white"
      >
        <h2 className="text-2xl font-bold mb-6">📌 최신 피드</h2>
        {dummyPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </section>
    </main>
  );
}
