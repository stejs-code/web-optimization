import { LinkItem } from "@/components/link-item";
import { LinkForm } from "@/components/link-form";
import { getLinks } from "./actions";

export default async function LinksPage() {
  const result = await getLinks();
  const links = !result.error && result.links ? result.links : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:py-20">
      <h1 className="mb-8 text-3xl font-bold sm:text-5xl">Links</h1>

      <LinkForm />

      {links.length > 0 ? (
        <>
          <h2 className="mb-4 text-2xl font-bold sm:text-3xl">Your links</h2>
          <div>
            {links.map((link, index) => (
              <LinkItem
                key={index}
                id={index + 1}
                shortCode={link.shortCode}
                destination={link.url}
                visits={link.visits}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="text-slate-400 text-center py-8">No links yet</div>
      )}
    </div>
  );
}
