import PriceTag from "@/components/PriceTag";
import { prisma } from "@/lib/db/prisma";
import { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { cache } from "react";
import AddToCartButton from "./AddToCartButton";
import { incrementProductQuantity } from "./actions";

interface ProductPageProps {
  // params contain 'id' which we want to extract
  params: {
    id: string;
  };
}

// if you want to access db twice or thrice, you can use cache fn by ReactJs by this method, we fetch data from db only once.
const getProduct = cache(async (id: string) => {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();
  return product;
});

// here we are fetching title that's why using async
export async function generateMetadata({
  params: { id },
}: ProductPageProps): Promise<Metadata> {
  const product = await getProduct(id);

  return {
    title: product.name + " - Mobile Care",
    description: product.description,
    openGraph: {
      images: [{ url: product.imageUrl }],
    },
  };
}

// all NextJs pages are by default server components, so we can easily make database call
export default async function ProductPage({
  params: { id },
}: ProductPageProps) {
  const product = await getProduct(id);

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
      <Image
        src={product.imageUrl}
        alt={product.name}
        width={500}
        height={500}
        className="rounded-lg"
        priority
      />

      <div>
        <h1 className="text-5xl font-bold"> {product.name} </h1>
        <PriceTag price={product.price} className="mt-4" />
        <p className="py-6"> {product.description} </p>
        <AddToCartButton
          productId={product.id}
          incrementProductQuantity={incrementProductQuantity}
        />
      </div>
    </div>
  );
}
