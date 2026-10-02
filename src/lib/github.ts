import { parseGithubUrl } from "./progress";
import type { Evidence } from "./types";
export class GithubCheckError extends Error { constructor(message:string,public status:number){super(message);} }
export async function checkGithubRepository(url: string, fetcher: typeof fetch = fetch): Promise<Evidence> {
  const parsed = parseGithubUrl(url); if(!parsed)throw new GithubCheckError("Use a public repository URL like https://github.com/your-name/your-project.",400);
  const base = `https://api.github.com/repos/${encodeURIComponent(parsed.owner)}/${encodeURIComponent(parsed.repo)}`;
  async function request(suffix:string){return fetcher(base+suffix,{headers:{Accept:"application/vnd.github+json","User-Agent":"DrVelu-Learning-Lab","X-GitHub-Api-Version":"2022-11-28"},signal:AbortSignal.timeout(10000),redirect:"error",cache:"no-store"});}
  function checkStatus(response:Response){if(response.status===403||response.status===429)throw new GithubCheckError("GitHub is limiting requests. Try again later; your saved work is unchanged.",429);}
  const response=await request("");checkStatus(response);
  if(response.status===404)throw new GithubCheckError("This repository was not found publicly. Check the link. Private repositories need OAuth, which is not connected yet.",404);
  if(!response.ok)throw new GithubCheckError("GitHub could not complete the check. Try again later.",502);
  const repo=await response.json();if(typeof repo.full_name!=="string"||repo.private===true)throw new GithubCheckError("No public repository metadata was available.",502);
  const [readme,commits,languages]=await Promise.all([request("/readme"),request("/commits?per_page=1"),request("/languages")]);
  [readme,commits,languages].forEach(checkStatus);
  if(!readme.ok&&readme.status!==404)throw new GithubCheckError("README availability could not be checked. Try again later.",502);
  if(commits.status===409)throw new GithubCheckError("The repository is empty. Push your first commit, then check again.",422);
  if(!commits.ok||!languages.ok)throw new GithubCheckError("GitHub returned incomplete evidence. Try again later.",502);
  const commitData=await commits.json();const languageData=await languages.json();
  if(!Array.isArray(commitData)||typeof commitData[0]?.sha!=="string"||!/^[0-9a-f]{40}$/.test(commitData[0].sha))throw new GithubCheckError("A valid commit could not be found. Push your work and try again.",422);
  return {url:`https://github.com/${parsed.owner}/${parsed.repo}`,name:repo.full_name.slice(0,150),description:typeof repo.description==="string"?repo.description.slice(0,500):"",readme:readme.ok,commit:commitData[0].sha,checkedAt:new Date().toISOString(),languages:Object.keys(languageData).slice(0,15).map(l=>l.slice(0,40))};
}
