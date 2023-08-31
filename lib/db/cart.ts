import { cookies } from "next/dist/client/components/headers";
import { prisma } from "./prisma";
import { Cart, CartItem, Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export type CartWithProducts = Prisma.CartGetPayload<{
  include: { items: { include: { product: true } } };
}>;

export type CartItemWithProduct = Prisma.CartItemGetPayload<{
  include: { product: true };
}>;

// type is used here instead of interface because with types you can combined two types with intersection
export type ShoppingCart = CartWithProducts & {
  size: number;
  subtotal: number;
};

// for getting the correct user whether he is logged-in or not
export async function getCart(): Promise<ShoppingCart | null> {
  const session = await getServerSession(authOptions);

  let cart: CartWithProducts | null = null;

  if (session) {
    cart = await prisma.cart.findFirst({
      where: { userId: session.user.id },
      include: { items: { include: { product: true } } },
    });
  } else {
    const localCartId = cookies().get("localCartId")?.value;
    cart = localCartId
      ? await prisma.cart.findUnique({
          where: { id: localCartId },
          include: { items: { include: { product: true } } }, // this way can go any level deep by using "include" in db's schema
        })
      : null;
  }

  if (!cart) {
    return null;
  }

  return {
    ...cart,
    size: cart.items.reduce((acc, item) => acc + item.quantity, 0),
    subtotal: cart.items.reduce(
      (acc, item) => acc + item.quantity * item.product.price,
      0
    ),
  };
}

export async function createCart(): Promise<ShoppingCart> {
  // creating session for the cart user specific
  const session = await getServerSession(authOptions);

  let newCart: Cart;

  if (session) {
    newCart = await prisma.cart.create({
      data: { userId: session.user.id },
    });
  } else {
    newCart = await prisma.cart.create({
      data: {},
    });
    // for getting the correct user whether he is logged-in or not
    // Needs encryption + secure setting in real production app
    cookies().set("localCartId", newCart.id);
  }

  return {
    ...newCart,
    items: [],
    size: 0,
    subtotal: 0,
  };
}

export async function mergeAnonymousCartWithUserCart(userId: string) {
  const localCartId = cookies().get("localCartId")?.value;

  const localCart = localCartId
    ? await prisma.cart.findUnique({
        where: { id: localCartId },
        include: { items: true },
      })
    : null;

  if (!localCart) return;

  const userCart = await prisma.cart.findFirst({
    where: { userId },
    include: { items: true },
  });

  // transactions is used for large database operations so that if one of the operations fails, others will not be affected by it.
  await prisma.$transaction(async (tx) => {
    if (userCart) {
      const mergedCartItems = mergeCartItems(localCart.items, userCart.items);

      // deleting existing cart items and then replacing them newer merged cartItems and on line 110, 122 return type is Js Objects that's why '{}'
      await tx.cartItem.deleteMany({
        where: { cartId: userCart.id },
      });

      await tx.cart.update({
        where: { id: userCart.id },
        data: {
          items: {
            createMany: {
              data: mergedCartItems.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
              })),
            },
          },
        },
      });
    } else {
      await tx.cart.create({
        data: {
          userId, // es6 syntax
          items: {
            createMany: {
              data: localCart.items.map((item) => ({
                // cartId is already there with creation of cart
                productId: item.productId,
                quantity: item.quantity,
              })),
            },
          },
        },
      });
    }
    // delete local cart that we fetched from our cookies (using key:value) in NextJs
    await tx.cart.delete({
      where: { id: localCart.id },
    });
    cookies().set("localCartId", "");
  });
}

// You can pass as many carts as you want(that's why rest parameter), cartItems is an array of array of CartItem
function mergeCartItems(...cartItems: CartItem[][]) {
  return cartItems.reduce((acc, items) => {
    items.forEach((item) => {
      const existingItem = acc.find((i) => i.productId === item.productId);
      if (existingItem) {
        existingItem.quantity += item.quantity;
      } else {
        acc.push(item);
      }
    });
    return acc;
  }, [] as CartItem[]);
}
