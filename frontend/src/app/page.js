import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black">
      <h1 className="text-3xl font-bold m-4">Welcome to InstaCampus</h1>
      
      <div className="flex space-x-4 mt-6">
        <Link href="/signup">
          <button className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Signup
          </button>
        </Link>

        <Link href="/login">
          <button className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600">
            Login
          </button>
        </Link>
      </div>
    </div>
  );
}
