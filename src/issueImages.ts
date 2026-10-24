// ponytail: regex over raw markdown; switch to markdown-it tokens if issue formatting drifts
export const issueImages = (body = "") =>
  [...body.matchAll(/<img\s[^>]*src="?([^"\s>]+)/g)]
    .map((m) => m[1])
    .filter((src) => !src.includes("hits.sh") && !/\.svg(\?|$)/i.test(src));
