export default function MainContent({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-1 flex-col overflow-hidden border-t border-border">
      <div className="flex-1 overflow-y-auto">{children}</div>
    </main>
  )
}
