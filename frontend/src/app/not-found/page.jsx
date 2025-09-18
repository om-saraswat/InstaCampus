export const metadata = {
  title: "Page Not Found",
  description: "This page could not be found.",
};

// ✅ move viewport to its own export
export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function NotFound() {
  return (
    <div className="text-center mt-20">
      <h1 className="text-2xl font-bold">404 - Page Not Found</h1>
      <p className="text-gray-500 mt-2">Sorry, we couldn’t find that page.</p>
    </div>
  );
}
