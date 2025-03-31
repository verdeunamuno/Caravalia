"use client"; 

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CalendarIcon, ListIcon } from "lucide-react"

export default function HomePage() {
  // Limpiar localStorage cuando se inicia una nueva reserva desde la página principal
  if (typeof window !== "undefined") {
    // Solo ejecutar en el cliente
    localStorage.removeItem("reservaDetalles")
    localStorage.removeItem("reservaCliente")
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-6 bg-gradient-to-b from-caravalia-50 to-white">
      <div className="w-full max-w-md mx-auto flex flex-col items-center gap-6">
        <div className="w-48 h-48 relative">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-67izduTedF5PTHkMbF222qhNGuht6b.png"
            alt="Caravalia Logo"
            fill
            priority
            className="object-contain"
          />
        </div>

        <h1 className="text-3xl font-bold text-center text-caravalia-800 mt-2">Reservas Caravalia</h1>

        <Card className="w-full card-modern">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 gap-4">
              <Link href="/reserva/294TL" className="w-full">
                <Button
                  variant="outline"
                  className="w-full h-14 text-lg border-2 border-caravalia-300 text-caravalia-700 hover:bg-caravalia-50 hover:border-caravalia-400 transition-all duration-200 rounded-lg shadow-sm hover:shadow-md"
                >
                  294TL
                </Button>
              </Link>

              <Link href="/reserva/294TL-Automatica" className="w-full">
                <Button
                  variant="outline"
                  className="w-full h-14 text-lg border-2 border-caravalia-300 text-caravalia-700 hover:bg-caravalia-50 hover:border-caravalia-400 transition-all duration-200 rounded-lg shadow-sm hover:shadow-md"
                >
                  294TL Automática
                </Button>
              </Link>

              <Button
                variant="default"
                className="w-full h-14 text-lg bg-gradient-to-r from-caravalia-600 to-caravalia-500 hover:from-caravalia-700 hover:to-caravalia-600 text-white shadow-md hover:shadow-lg transition-all duration-200 rounded-lg"
                onClick={() => window.open("https://calendar.google.com", "_blank")}
              >
                <CalendarIcon className="mr-2 h-5 w-5" />
                Calendario
              </Button>

              <Link href="/reservas" className="w-full">
                <Button
                  variant="default"
                  className="w-full h-14 text-lg bg-gradient-to-r from-caravalia-700 to-caravalia-600 hover:from-caravalia-800 hover:to-caravalia-700 text-white shadow-md hover:shadow-lg transition-all duration-200 rounded-lg"
                >
                  <ListIcon className="mr-2 h-5 w-5" />
                  Listado de Reservas
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

