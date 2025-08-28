import StoreDisplay from "@/components/store/storeDisplay";

export default async function StorePage({ params }: { params: { storename: string } }) {

    const { storename } = await params
    let error = null;
    let store = {};

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/store/${storename}`, {
            method: 'GET'
        })
        console.log("line 12")
        store = await response.json();

        console.log({store})
    } catch (error) {
        
    }
  return (
    <div>
      <StoreDisplay store={store}/>
    </div>
  )
}