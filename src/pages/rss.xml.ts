import { getCollection } from "astro:content";
import rss from "@astrojs/rss";
import type { APIContext } from "astro";

export async function GET(context: APIContext) {
  const posts = (await getCollection("posts")).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );

  return rss({
    title: "Adrian Altner",
    description:
      "Gedanken und Projekte von Adrian Altner – Softwareentwicklung, Open Source und das unabhängige Web.",
    site: context.site!,
    customData: "<language>de</language>",
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `${import.meta.env.BASE_URL}${post.id}/`,
    })),
  });
}
