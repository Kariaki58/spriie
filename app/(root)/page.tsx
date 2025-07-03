import TopNavigation from "@/components/app-ui/top-navigation";
import HomeLeftBar from "@/components/Home/home-left-bar";
import ProductFetch from "@/components/Home/product-fetch";



export default function HomePage() {
  return (
    <div className="flex h-screen bg-gray-100 overflow-y-auto">
      <HomeLeftBar />
      {/* <div className=""> */}
        {/* <TopNavigation /> */}
      <ProductFetch />
      {/* </div> */}
      <div className="hidden lg:flex lg:w-80 xl:w-96 bg-white border-l">
        <div className="p-4">
          <h3 className="font-semibold">Comments</h3>
        </div>
      </div>
    </div>
  );
}