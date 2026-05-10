import { createServerClient } from "@/lib/supabase/server";
import { TestimonialsClient, type Testimonial } from "./TestimonialsClient";

export const revalidate = 300;

async function fetchReviews(): Promise<Testimonial[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return [];
  }
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("reviews")
      .select("id, author_name, city, rating, services, body")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(10);
    if (error || !data) return [];
    return data.map((r) => ({
      id: r.id,
      name: r.author_name,
      loc: r.city ?? "",
      initial: r.author_name.charAt(0).toUpperCase(),
      rating: r.rating,
      services: r.services ?? [],
      quote: r.body,
    }));
  } catch {
    return [];
  }
}

export async function Testimonials() {
  const items = await fetchReviews();
  if (items.length === 0) return null;
  return <TestimonialsClient items={items} />;
}
