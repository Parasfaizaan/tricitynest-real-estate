import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-px flex min-h-[70vh] flex-col items-center justify-center py-28 text-center">
      <p className="eyebrow">404</p>
      <h1 className="display mt-4 text-4xl !text-navy">We couldn’t find that page</h1>
      <p className="mt-4 max-w-md text-ink-soft">The home may have been sold, or the link is out of date.</p>
      <div className="mt-8 flex gap-3">
        <Button href="/">Back to home</Button>
        <Button href="/properties" variant="outline">
          Browse properties
        </Button>
      </div>
    </div>
  );
}
