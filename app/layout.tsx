import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { ptBR } from "@clerk/localizations"

export const metadata = {
  title: 'Luma OS',
  description: 'Sistema operacional criativo',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider localization={ptBR}>
      <html lang="pt-br">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
