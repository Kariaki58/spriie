import HomeLeftBar from "@/components/Home/home-left-bar";
import ContentFeed from "@/components/Home/ContentFeed";


export default function HomePage() {
  return (
    <div className="flex h-screen bg-gray-100 overflow-y-auto">
      <HomeLeftBar />
      
      <ContentFeed />
      <div className="hidden lg:flex lg:w-80 xl:w-96 bg-white border-l">
        {/* Right sidebar for comments/extra info */}
        <div className="p-4">
          <h3 className="font-semibold">Comments</h3>
          {/* Comments will go here */}
        </div>
      </div>
    </div>
  );
}