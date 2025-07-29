import OrderConfirmation from "./order-confirmation-helper";


export default async function OrderConfim({ params }: { params: { orderId: string } }) {
  const { id } = await params

  console.log(id)
  return (
    <div>
      <OrderConfirmation orderId={id}/>
    </div>
  )
}