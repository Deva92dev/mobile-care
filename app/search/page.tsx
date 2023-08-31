import ProductCard from "@/components/ProductCard";
import { prisma } from "@/lib/db/prisma";
import { Metadata } from "next";

interface SearchPageProps {
  searchParams: { query: string };
}

export function generateMetadata({
  searchParams: { query },
}: SearchPageProps): Metadata {
  return {
    title: `Search : ${query.toUpperCase()} - Mobile Care`,
  };
}

const SearchPage = async ({ searchParams: { query } }: SearchPageProps) => {
  const products = await prisma.product.findMany({
    where: {
      OR: [
        // Here only one query has to match
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ],
    },
    orderBy: { id: "desc" },
  });

  if (products.length === 0) {
    return <div className="text-center">No Products Found.</div>;
  }

  // Paginate this page too if u do, u will learn pagination
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => (
        <ProductCard product={product} key={product.id} />
      ))}
    </div>
  );
};

export default SearchPage;
