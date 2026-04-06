const BASE_URL = "https://cricbuzz-cricket.p.rapidapi.com";

export async function cricbuzzGet<T>(path: string): Promise<T> {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) throw new Error("RAPIDAPI_KEY environment variable is not set");

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "X-RapidAPI-Key": apiKey,
      "X-RapidAPI-Host": "cricbuzz-cricket.p.rapidapi.com",
    },
    next: { revalidate: 0 }, // manual TTL cache
  });

  if (!res.ok) {
    throw new Error(`Cricbuzz API error: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

// Re-export under old name so nothing outside this folder needs to change
export { cricbuzzGet as cricapiGet };
