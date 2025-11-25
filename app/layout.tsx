export const metadata = {
  title: 'ドジロウ！',
  description: 'ドッジボールスコア管理アプリ',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <header>
          <h1>ドジロウ！</h1>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
