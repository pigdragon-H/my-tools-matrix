// Minimal server entry point
export const handler = async (req: any) => {
  return new Response("OK", { status: 200 });
};
