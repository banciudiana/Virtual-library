import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe-server";

export async function POST(req: Request) {
  try {
    const { cartItems, shippingFee } = await req.json();

    // 1. Transformăm produsele tale în formatul Stripe
    const line_items = cartItems.map((item: any) => ({
      price_data: {
        currency: "ron",
        product_data: { 
          name: `${item.title} (${item.format})`,
        },
        unit_amount: Math.round(item.price * 100), 
      },
      quantity: item.quantity,
    }));

    // 2. Adăugăm taxa de transport/procesare (5 sau 20 lei)
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

    // 3. Creăm sesiunea de plată
    // IMPORTANT: Am păstrat "card", dar Stripe va afișa GPay automat dacă e activat în Dashboard
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      // Stripe completează automat {CHECKOUT_SESSION_ID} la redirecționare
      success_url: `${req.headers.get("origin")}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/cart`,
    });

    // MODIFICARE CRUCIALĂ: Returnăm session.url în loc de sessionId
    return NextResponse.json({ url: session.url });

  } catch (err: any) {
    console.error("Stripe Backend Error:", err);
    return NextResponse.json(
      { error: err.message || "A intervenit o eroare la generarea plății." }, 
      { status: 500 }
    );
  }
}