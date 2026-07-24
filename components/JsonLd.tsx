// Renders a JSON-LD structured-data block. Server-rendered into the static HTML
// so crawlers and AI answer engines read it without executing any JavaScript.

export default function JsonLd({ data }: { data: object | object[] }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      // Structured data is our own trusted, serialized content.
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
