const base = process.env.LAB_TEST_URL || "http://127.0.0.1:3000";
for (const item of [
  { url: "http://localhost/admin", expected: 400 },
  {
    url: "https://github.com/microsoft/ai-agents-for-beginners",
    expected: 200,
  },
]) {
  const response = await fetch(
    `${base}/api/github?url=${encodeURIComponent(item.url)}`,
  );
  const result = await response.json();
  console.log(
    JSON.stringify({
      input: item.url,
      status: response.status,
      readme: result.readme,
      commit: result.commit?.slice(0, 7),
      error: result.error,
    }),
  );
  if (response.status !== item.expected) process.exitCode = 1;
}
