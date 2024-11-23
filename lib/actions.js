"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { saveMeal } from "./meals";
import { uploadImage } from "./cloudinary";

function isInvalidText(text) {
  return !text || text.trim() === "";
}

export async function shareMeal(prevState, formData) {
  const title = formData.get("title");
  const summary = formData.get("summary");
  const instructions = formData.get("instructions");
  const image = formData.get("image");
  const creator = formData.get("name");
  const creator_email = formData.get("email");

  if (
    isInvalidText(title) ||
    isInvalidText(summary) ||
    isInvalidText(instructions) ||
    isInvalidText(creator) ||
    isInvalidText(creator_email) ||
    !creator_email.includes("@") ||
    !image ||
    image.size === 0
  ) {
    return {
      message: "Invalid input.",
    };
  }

  let imageUrl;
  try {
    imageUrl = await uploadImage(image);
  } catch (error) {
    throw new Error(
      "Image upload failed, post was not created. Please try again later. "
    );
  }

  const meal = {
    title,
    summary,
    instructions,
    image: imageUrl,
    creator,
    creator_email,
  };

  await saveMeal(meal);
  revalidatePath("/meals");
  redirect("/meals");
}
