"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { z } from "zod";
import crypto from "crypto";
import { auth } from "@/lib/auth";

const checkoutSchema = z.object({
  designIdsJson: z.string().min(1, "Design selection is required"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Valid phone number required"),
});

export async function placeOrder(formData: FormData) {
  const session = await auth();
  
  if (!session?.user?.email) {
    return { error: "Authentication required to place orders." };
  }

  let redirectPath = "/account/orders";
  
  try {
    const rawData = {
      designIdsJson: formData.get("designIds") as string,
      fullName: formData.get("fullName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
    };

    const validatedData = checkoutSchema.parse(rawData);
    const designIds = JSON.parse(validatedData.designIdsJson) as string[];

    if (!Array.isArray(designIds) || designIds.length === 0) {
      return { error: "No designs selected for checkout." };
    }

    // Load designs
    const designs = await prisma.design.findMany({
      where: { id: { in: designIds }, status: "PUBLISHED" },
    });

    if (designs.length === 0) {
      return { error: "Selected designs not found or no longer available." };
    }

    // Fetch user record to link userId if available
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    const createdOrderIds: string[] = [];

    // Create an order for each design in the selection
    for (const design of designs) {
      if (design.priceInr <= 0) continue;

      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const randomSuffix = crypto.randomBytes(2).toString("hex").toUpperCase();
      const invoiceNumber = `MRY-${dateStr}-${randomSuffix}`;
      const fakeRazorpayId = `temp_rzp_${crypto.randomBytes(8).toString("hex")}`;
      const fakePaymentId = `pay_${crypto.randomBytes(8).toString("hex")}`;

      const order = await prisma.order.create({
        data: {
          designId: design.id,
          userId: dbUser?.id || null,
          email: session.user.email, // Use authenticated user's email
          amountInr: design.priceInr,
          status: "PENDING", // Set to PENDING initially. Must complete demo payment to unlock files.
          invoiceNumber,
          razorpayOrderId: fakeRazorpayId,
          razorpayPaymentId: fakePaymentId,
        },
      });

      createdOrderIds.push(order.id);
    }

    // Update redirect route
    if (createdOrderIds.length === 1) {
      redirectPath = `/account/orders/${createdOrderIds[0]}`;
    } else {
      redirectPath = "/account/orders";
    }

  } catch (error: unknown) {
    if (error instanceof z.ZodError) return { error: error.issues[0].message };
    console.error("Order creation error:", error);
    return { error: "Failed to place order. Please try again." };
  }
  
  redirect(redirectPath);
}
