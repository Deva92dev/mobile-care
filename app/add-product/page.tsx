import FormSubmitButton from "@/components/FormSubmitButton";
import { prisma } from "@/lib/db/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";

export const metadata = {
  title: "Add Product - Mobile Care",
};

// server actions in nextJs below function, database operations can only be done on server, not in client or "user client" directive
async function addProduct(formData: FormData) {
  "use server";

  // we also have to make protection for server actions itself in case we try to call it while we are not logged in.
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/api/auth/signin?callbackUrl=/add-product");
  }

  // we are getting the value out of form, name attribute must match
  const name = formData.get("name")?.toString();
  const description = formData.get("description")?.toString();
  const imageUrl = formData.get("imageUrl")?.toString();
  const price = Number(formData.get("price") || 0);

  // because we have a required tag in form, so we don't expect form values to be empty
  if (!name || !description || !imageUrl || !price) {
    throw Error("Missing required fields");
  }

  await prisma.product.create({
    data: { name, description, imageUrl, price },
  });
  redirect("/");
}

// since , it is a server page, we can fetch session here and by adding callbackUrl param (using ? sign) we will be redirected to specified path
const AddProductPage = async () => {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/api/auth/signin?callbackUrl=/add-product");
  }

  return (
    <div>
      <h1 className="mb-3 text-lg font-bold">Add Product</h1>
      <form action={addProduct}>
        <input
          required
          name="name" // we get the value out of the input
          placeholder="Name"
          className="input-bordered input mb-3 w-full"
        />
        <textarea
          required
          name="description"
          placeholder="Description"
          className="textarea-bordered textarea mb-3 w-full"
        />
        <input
          required
          name="imageUrl"
          type="url"
          placeholder="Image Url"
          className="input-bordered input mb-3 w-full"
        />
        <input
          required
          name="price"
          placeholder="Price"
          type="number"
          className="input-bordered input mb-3 w-full"
        />
        <FormSubmitButton className="btn-block">Add Product</FormSubmitButton>
      </form>
    </div>
  );
};

export default AddProductPage;
