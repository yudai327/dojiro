import prisma from '../../lib/prisma';

export default async function HealthPage() {
  try {
    const users = await prisma.user.count();
    return (
      <main>
        <h2>Health</h2>
        <pre>{JSON.stringify({ ok: true, users }, null, 2)}</pre>
      </main>
    );
  } catch (e) {
    return (
      <main>
        <h2>Health</h2>
        <pre>{JSON.stringify({ ok: false, error: String(e) }, null, 2)}</pre>
      </main>
    );
  }
}
