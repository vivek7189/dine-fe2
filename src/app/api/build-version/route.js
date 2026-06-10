export async function GET() {
  return Response.json({
    version: process.env.NEXT_PUBLIC_BUILD_VERSION || 'unknown',
    ts: Date.now(),
  }, {
    headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
  });
}
