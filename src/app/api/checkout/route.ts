import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe-server";

export async function POST(req: Request) {
  try {
    const { cartItems, shippingFee, userEmail } = await req.json();

    // 1. Transformăm produsele pentru Stripe
    const line_items = cartItems.map((item: any) => ({
      price_data: {
        currency: "ron",
        product_data: { 
          name: `${item.title} (${item.format})`,
          // REPARAȚIE: Am scos câmpul images sau am lăsat array gol. 
          // Stripe refuză obiectele Sanity, vrea doar URL-uri string.
          images: [], 
        },
        unit_amount: Math.round(item.price * 100), 
      },
      quantity: item.quantity,
    }));

    // 2. Taxa de transport
    if (shippingFee > 0) {
      line_items.push({
        price_data: {
          currency: "ron",
          product_data: { 
            name: shippingFee === 5 ? "Taxă procesare digitală" : "Cost Livrare Standard" 
          },
          unit_amount: shippingFee * 100,
        },
        quantity: 1,
      });
    }

    // 3. Metadata minimalist pentru Sanity
    const simplifiedItems = cartItems.map((item: any) => ({
      id: item._id.split('-')[0],
      q: item.quantity,
      p: item.price,
      f: item.format
    }));

    // 4. Crearea sesiunii
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      customer_email: userEmail, 
      success_url: `${req.headers.get("origin")}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/cart`,
      metadata: {
        cart_data: JSON.stringify(simplifiedItems),
        user_email: userEmail 
      },
    });

    return NextResponse.json({ url: session.url });

  } catch (err: any) {
    console.error("Stripe Backend Error:", err);
    return NextResponse.json(
      { error: err.message || "A intervenit o eroare la generarea plății." }, 
      { status: 500 }
    );
  }
}