import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe-server";
import { adminClient } from "@/sanity/lib/adminClient";
import { headers } from "next/headers";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature") as string;

  let event;

  try {
    // Verificăm dacă cererea vine într-adevăr de la Stripe (securitate)
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`❌ Webhook Error: ${err.message}`);
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  // Dacă plata a fost finalizată cu succes
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;

    // Citim metadata pe care am trimis-o din checkout/route.ts
    const orderDataString = session.metadata?.order_data;

    if (orderDataString) {
      try {
        const orderData = JSON.parse(orderDataString);

        // Parcurgem fiecare produs și scădem stocul în Sanity
        for (const item of orderData) {
          console.log(`📉 Scădem stocul pentru produsul ${item.id} cu ${item.qty} unități`);

          await adminClient
            .patch(item.id) // ID-ul cărții
            .dec({ stock: item.qty }) // Operația de decrementare (scădere)
            .commit();
        }
        
        console.log("✅ Stoc actualizat cu succes în Sanity!");
      } catch (error) {
        console.error("❌ Eroare la actualizarea stocului:", error);
      }
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}