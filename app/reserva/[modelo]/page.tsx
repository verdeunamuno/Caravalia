"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useLocalStorage } from "@/lib/hooks/use-local-storage"
import { useCounterStorage } from "@/lib/hooks/use-counter-storage"

export default function ReservaModeloPage({ params }: { params: { modelo: string } }) {
  const router = useRouter()
  const modelo = decodeURIComponent(params.modelo)

  const [showDialog, setShowDialog] = useState(true)
  const [numeroReserva, setNumeroReserva] = useState("")
  const [storedNumeroReserva, setStoredNumeroReserva] = useLocalStorage(`reserva-${modelo}`, "")
  const { counter, getNextCounterValue, setCounterValue } = useCounterStorage(modelo, "0")

  // Usar una referencia para controlar si ya se ha inicializado el número de reserva
  const initialized = useRef(false)

  useEffect(() => {
    // Solo ejecutar esta lógica una vez al montar el componente
    if (!initialized.current) {
      initialized.current = true

      // Si hay un número de reserva guardado para esta sesión, usarlo
      if (storedNumeroReserva) {
        setNumeroReserva(storedNumeroReserva)
      } else {
        // Si no, obtener el siguiente número y usarlo como valor predeterminado
        const nextNumber = getNextCounterValue()
        setNumeroReserva(nextNumber)
      }
    }
  }, [storedNumeroReserva, getNextCounterValue])

  const handleContinuar = () => {
    if (numeroReserva.trim() === "") return

    // Guardar el número de reserva actual para esta sesión
    setStoredNumeroReserva(numeroReserva)

    // Actualizar el contador si el número de reserva es mayor que el contador actual
    const currentCounter = Number.parseInt(counter, 10)
    const currentReserva = Number.parseInt(numeroReserva, 10)
    if (!isNaN(currentReserva) && currentReserva >= currentCounter) {
      setCounterValue(numeroReserva)
    }

    setShowDialog(false)
    router.push(`/reserva/${encodeURIComponent(modelo)}/detalles?numero=${numeroReserva}`)
  }

  const handleCancel = () => {
    router.push("/")
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-6 bg-gradient-to-b from-caravalia-50 to-white">
      <div className="w-full max-w-md mx-auto flex flex-col items-center gap-6">
        <div className="w-32 h-32 relative">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-67izduTedF5PTHkMbF222qhNGuht6b.png"
            alt="Caravalia Logo"
            fill
            className="object-contain"
          />
        </div>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="sm:max-w-md bg-white border-caravalia-100 shadow-card">
            <DialogHeader>
              <DialogTitle className="text-caravalia-800">Número de Reserva</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <Input
                value={numeroReserva}
                onChange={(e) => setNumeroReserva(e.target.value)}
                placeholder="Ingrese número de reserva"
                className="text-center text-lg border-caravalia-200 bg-white focus:border-caravalia-400 focus:ring-caravalia-400"
                autoFocus
              />
              <div className="flex justify-between gap-2">
                <Button variant="outline" onClick={handleCancel} className="btn-outline-modern">
                  Cancelar
                </Button>
                <Button onClick={handleContinuar} className="btn-primary-modern">
                  Continuar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  )
}

