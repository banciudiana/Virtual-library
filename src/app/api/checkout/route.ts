import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe-server";

export async function POST(req: Request) {
  try {
    const { cartItems, shippingFee, userEmail } = await req.json();

    // 1. Transformăm produsele pentru Stripe (Afișare în pagina de plată)
    const line_items = cartItems.map((item: any) => ({
      price_data: {
        currency: "ron",
        product_data: { 
          name: `${item.title} (${item.format})`,
          // Stripe vrea URL-uri de imagine string, nu obiecte Sanity. 
          // Lăsăm array gol pentru a evita eroarea "Invalid string" dacă nu avem un URL valid.
          images: [], 
        },
        unit_amount: Math.round(item.price * 100), 
      },
      quantity: item.quantity,
    }));

    // 2. Adăugăm taxa de transport/procesare ca linie separată
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

    // 3. PREGĂTIM DATELE PENTRU SANITY (MINIMALIST)
    // Curățăm ID-urile (ex: scoatem "-ebook") pentru a asigura referința corectă
    const simplifiedItems = cartItems.map((item: any) => ({
      id: item._id.split('-')[0], // ID-ul de bază al cărții
      q: item.quantity,           // Cantitate
      p: item.price,              // Preț la achiziție
      f: item.format              // Format (Paperback, Ebook etc.)
    }));

    // 4. Creăm sesiunea de plată Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      customer_email: userEmail || undefined, // Folosim email-ul userului dacă e logat
      success_url: `${req.headers.get("origin")}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/cart`,
      
      // Metadata trimite datele către pagina de /success
      metadata: {
        // Stripe are limită de caractere, de aceea folosim chei scurte (q, p, f)
        cart_data: JSON.stringify(simplifiedItems),
        user_email: userEmail || "" 
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