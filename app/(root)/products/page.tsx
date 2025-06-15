export default function Page() {
    return (
        <form action={`/api/products`} method="POST" encType="multipart/form-data" className="flex flex-col w-1/3 items-center mt-20">
            <input type="name" name="productName" id="productName" className="border-2  border-black" />
            <input type="text" name="slug" id="slug" className="border-2  border-black" />
            <input type="number" name="basePrice" id="basePrice" className="border-2  border-black" />
            <input type="number" name="discount" id="discount" className="border-2  border-black" />
            <input type="file" name="fileName" id="fileName" multiple/>
            <button type="submit" className="bg-blue-400 p-4">Submit</button>
        </form>
    )
}