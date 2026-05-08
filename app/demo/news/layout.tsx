export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return <div style={{ position: 'fixed', inset: 0, zIndex: 100 }}>{children}</div>;
}
