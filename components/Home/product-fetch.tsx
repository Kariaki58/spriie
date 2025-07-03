import ContentFeed from "./ContentFeed";
import { Product } from "./ContentFeed";

export default async function ProductFetch() {
    let loading = false;
    let error = null;
    let products: Product[] = [];

    try {
        loading = true;
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/content`, { cache: 'no-store' });
        const data = await response.json();

        if (!response.ok) {
            error = data.error;
            return;
        }
        products = data.message;
    } catch (error) {
        error = "something went wrong";
        return;
    } finally {
        loading = false;
    }

    if (loading) {
        return (
            <div>Loading...</div>
        )
    }

    if (error) {
        return (
            <div>{error}</div>
        )
    }

   if (!products?.length) {
        return (
            <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
                <svg
                    className="w-16 h-16 text-gray-400 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No products found</h3>
                <p className="text-gray-500 text-center max-w-md px-4">
                    We couldn't find any products matching your criteria. <br />
                    Try adjusting your search or check back later.
                </p>
            </div>
        );
    }
    return (
        <ContentFeed products={products} />
    )
}