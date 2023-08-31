"use client";

import { CartItemWithProduct } from "@/lib/db/cart";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "../../lib/format";
import { useTransition } from "react";

// we need transitions to execute server actions in client component to get appropriate loading and error handling

interface CartEntryProps {
  cartItem: CartItemWithProduct;
  // below is server file
  setProductQuantity: (productId: string, quantity: number) => Promise<void>;
}

const CartEntry = ({
  cartItem: { product, quantity },
  setProductQuantity,
}: CartEntryProps) => {
  const [isPending, startTransition] = useTransition();

  const quantityOptions: JSX.Element[] = [];
  for (let i = 1; i <= 99; i++) {
    quantityOptions.push(
      <option value={i} key={i}>
        {i}
      </option>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <Image
          src={product.imageUrl}
          alt={product.name}
          width={200}
          height={200}
          className="rounded-lg"
        />
        <div>
          <Link href={"/products" + product.id} className="font-bold">
            {product.name}
          </Link>
          <div>Price : {formatPrice(product.price)}</div>
          <div className="my-1 flex items-center gap-2">
            {/* If we change the quantity based on user interaction, we have to execute server actions that changes the quantity in the database */}
            Quantity :
            <select
              className="select-bordered select w-full max-w-[80px]"
              defaultValue={quantity}
              onChange={(e) => {
                const newQuantity = parseInt(e.currentTarget.value);
                startTransition(async () => {
                  await setProductQuantity(product.id, newQuantity);
                });
              }}
            >
              <option value={0}> 0 (remove) </option>
              {quantityOptions}
            </select>
          </div>
          <div className="flex items-center gap-3">
            Total : {formatPrice(product.price * quantity)}
            {isPending && (
              <span className="loading loading-spinner loading-sm" />
            )}
          </div>
        </div>
      </div>
      <div className="divider" />
    </div>
  );
};

export default CartEntry;
