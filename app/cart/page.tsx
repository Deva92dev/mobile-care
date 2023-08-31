import { getCart } from "@/lib/db/cart";
import CartEntry from "./CartEntry";
import { setProductQuantity } from "./actions";
import { formatPrice } from "@/lib/format";

// setProductQuantity is a server file, so we have to pass it as a argument to cartEntry. Because of a prevailing bug in nextJs right now

export const metadata = {
  title: "Your Cart - Mobile Care",
};

const CartPage = async () => {
  const cart = await getCart();

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Shopping Cart</h1>
      {cart?.items.map((cartItem) => (
        <CartEntry
          cartItem={cartItem}
          key={cartItem.id}
          setProductQuantity={setProductQuantity}
        />
      ))}
      {/* when cart is empty */}
      {!cart?.items.length && <p>Your Cart is Empty. </p>}
      <div className="flex flex-col items-end sm:items-center">
        <p className="mb-3 font-bold">
          Total : {formatPrice(cart?.subtotal || 0)}
        </p>
        <button className="btn-primary btn sm:w-[200px]">Checkout</button>
        {/* Here, you can add stripe checkout functionality */}
      </div>
    </div>
  );
};

export default CartPage;
