import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe-server";

export async function POST(req: Request) {
  try {
    // Am adăugat userEmail în destructuring
    const { cartItems, shippingFee, userEmail } = await req.json();

    // 1. Transformăm produsele pentru Stripe
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

    // 2. Adăugăm taxa de transport/procesare
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

    // 3. Pregătim datele pentru scăderea stocului (doar produsele fizice)
    const physicalItemsMetadata = cartItems
      .filter((item: any) => item.format === 'paperback' || item.format === 'hardback')
      .map((item: any) => ({
        id: item._id.split('-')[0],
        qty: item.quantity
      }));

    // 4. Creăm sesiunea de plată cu METADATA completă
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      // Adăugăm email-ul clientului direct în Stripe pentru a-l vedea și în Dashboard
      customer_email: userEmail, 
      success_url: `${req.headers.get("origin")}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/cart`,
      
      metadata: {
        // Aceste date vor fi citite în pagina de /success
        order_data: JSON.stringify(physicalItemsMetadata),
        user_email: userEmail // Foarte important pentru corelare!
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