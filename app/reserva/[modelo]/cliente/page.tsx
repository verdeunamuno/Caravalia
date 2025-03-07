"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { User, CreditCard, Phone, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"

export default function ClienteReservaPage({ params }: { params: { modelo: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const numeroReserva = searchParams.get("numero") || ""
  const modelo = decodeURIComponent(params.modelo)
  const esEdicion = searchParams.get("editar") === "true"

  const [nombre, setNombre] = useState("")
  const [dni, setDni] = useState("")
  const [telefono, setTelefono] = useState("")
  const [notas, setNotas] = useState("")
  const [showNotas, setShowNotas] = useState(false)

  const [reservaDetalles, setReservaDetalles] = useState<any>(null)

  useEffect(() => {
    // Recuperar datos de la reserva
    const detallesGuardados = localStorage.getItem("reservaDetalles")
    if (detallesGuardados) {
      setReservaDetalles(JSON.parse(detallesGuardados))
    }

    // Recuperar datos del cliente solo si estamos editando
    if (esEdicion) {
      const clienteGuardado = localStorage.getItem("reservaCliente")
      if (clienteGuardado) {
        try {
          const cliente = JSON.parse(clienteGuardado)

          // Cargar datos del cliente
          if (cliente.nombre) {
            setNombre(cliente.nombre)
          }
          if (cliente.dni) {
            setDni(cliente.dni)
          }
          if (cliente.telefono) {
            setTelefono(cliente.telefono)
          }
          if (cliente.notas) {
            setNotas(cliente.notas)
          }
        } catch (error) {
          console.error("Error al cargar los datos del cliente:", error)
        }
      }
    }
  }, [esEdicion])

  const handleReservar = () => {
    if (!nombre || !dni || !telefono) return

    const clienteData = {
      nombre,
      dni,
      telefono,
      notas,
    }

    // Guardar datos en localStorage
    localStorage.setItem("reservaCliente", JSON.stringify(clienteData))

    // Navegar a la siguiente pantalla, manteniendo el parámetro editar si es necesario
    const queryParams = esEdicion ? `numero=${numeroReserva}&editar=true` : `numero=${numeroReserva}`
    router.push(`/reserva/${encodeURIComponent(modelo)}/confirmacion?${queryParams}`)
  }

  const handleVolver = () => {
    // Mantener el parámetro editar si es necesario
    const queryParams = esEdicion ? `numero=${numeroReserva}&editar=true` : `numero=${numeroReserva}`
    router.push(`/reserva/${encodeURIComponent(modelo)}/detalles?${queryParams}`)
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-6 bg-gradient-to-b from-caravalia-50 to-white">
      <div className="w-full max-w-md mx-auto flex flex-col gap-6">
        <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-soft">
          <div className="flex items-center gap-4">
            <span className="text-caravalia-700 font-medium">Reserva nº</span>
            <div className="header-circle">{numeroReserva}</div>
            <h2 className="text-xl font-semibold text-caravalia-800">{modelo}</h2>
          </div>
          <div className="w-16 h-16 relative">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-67izduTedF5PTHkMbF222qhNGuht6b.png"
              alt="Caravalia Logo"
              fill
              className="object-contain"
            />
          </div>
        </div>

        <Card className="w-full card-modern">
          <CardContent className="p-6">
            <div className="grid gap-6">
              <div className="flex flex-col gap-2">
                <Label htmlFor="nombre" className="flex items-center gap-2 text-caravalia-700">
                  <User className="h-4 w-4 text-caravalia-500" />
                  Nombre y Apellidos
                </Label>
                <Input
                  id="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value.toUpperCase())}
                  placeholder="Nombre completo"
                  className="uppercase border-caravalia-200 bg-white focus:border-caravalia-400 focus:ring-caravalia-400"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="dni" className="flex items-center gap-2 text-caravalia-700">
                  <CreditCard className="h-4 w-4 text-caravalia-500" />
                  DNI
                </Label>
                <Input
                  id="dni"
                  value={dni}
                  onChange={(e) => setDni(e.target.value.toUpperCase())}
                  placeholder="DNI o NIE"
                  className="uppercase border-caravalia-200 bg-white focus:border-caravalia-400 focus:ring-caravalia-400"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="telefono" className="flex items-center gap-2 text-caravalia-700">
                  <Phone className="h-4 w-4 text-caravalia-500" />
                  Teléfono
                </Label>
                <Input
                  id="telefono"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value.toUpperCase())}
                  placeholder="Número de teléfono"
                  type="tel"
                  className="uppercase border-caravalia-200 bg-white focus:border-caravalia-400 focus:ring-caravalia-400"
                />
              </div>

              <Button
                variant="outline"
                className="flex items-center gap-2 border-caravalia-200 bg-caravalia-50 hover:bg-caravalia-100 text-caravalia-700"
                onClick={() => setShowNotas(true)}
              >
                <FileText className="h-4 w-4 text-caravalia-500" />
                NOTAS
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline" onClick={handleVolver} className="btn-outline-modern">
            Volver
          </Button>
          <Button onClick={handleReservar} className="btn-primary-modern">
            Reservar
          </Button>
        </div>
      </div>

      <Dialog open={showNotas} onOpenChange={setShowNotas}>
        <DialogContent className="sm:max-w-md bg-white border-caravalia-100">
          <DialogHeader>
            <DialogTitle className="text-caravalia-800">Notas adicionales</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <Textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value.toUpperCase())}
              placeholder="Ingrese observaciones adicionales"
              rows={6}
              className="uppercase border-caravalia-200 focus:border-caravalia-400 focus:ring-caravalia-400"
            />
            <div className="flex justify-end">
              <DialogClose asChild>
                <Button className="btn-primary-modern">Guardar</Button>
              </DialogClose>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  )
}

