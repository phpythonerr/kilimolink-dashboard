import { redirect } from "next/navigation";

export default function Home() {
  redirect("/dashboard");
  return (
    <div className="flex flex-1 justify-center items-center">Redirecting</div>
  );
}
