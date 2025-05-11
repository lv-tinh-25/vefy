import { redirect } from "next/navigation";

export default function Home() {
  // Middleware handles auth check — if they reach here, they're logged in
  redirect("/garage");
}
