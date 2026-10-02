import { checkGithubRepository, GithubCheckError } from "@/lib/github";
export async function GET(request: Request) {
  const url = new URL(request.url).searchParams.get("url");
  if (!url || url.length > 300)
    return Response.json(
      { error: "Enter a GitHub repository URL." },
      { status: 400 },
    );
  try {
    return Response.json(await checkGithubRepository(url), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error instanceof GithubCheckError)
      return Response.json({ error: error.message }, { status: error.status });
    return Response.json(
      {
        error:
          "The repository check could not connect to GitHub. Try again shortly.",
      },
      { status: 502 },
    );
  }
}
