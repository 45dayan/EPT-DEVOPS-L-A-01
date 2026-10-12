export function studioKey() {
  return process.env.STUDIO_KEY || "dayan-studio";
}

export function rejectKey(request: Request) {
  const provided = request.headers.get("x-studio-key") ?? "";
  if (provided !== studioKey()) {
    return Response.json({ error: "The studio key was not accepted." }, { status: 401 });
  }
  return null;
}
