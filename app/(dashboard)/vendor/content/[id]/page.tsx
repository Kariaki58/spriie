import ProductEditContent from "./ProductEditPage";

interface Product {
  _id: string;
  title: string;
}

export default async function EditContent({
  params,
}: {
  params: { id: string };
}) {

  const { id } = await params;

  console.log(id)
  
  return (
    <ProductEditContent id={id}/>
  )
}