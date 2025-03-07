"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function DetallesReservaPage({ params }: { params: { modelo: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const numeroReserva = searchParams.get("numero") || ""
  const modelo = decodeURIComponent(params.modelo)
  const esEdicion = searchParams.get("editar") === "true"

  const [fechaEntrega, setFechaEntrega] = useState<Date | undefined>(new Date())
  const [fechaDevolucion, setFechaDevolucion] = useState<Date | undefined>(new Date())
  const [horaEntrega, setHoraEntrega] = useState("09:00")
  const [horaDevolucion, setHoraDevolucion] = useState("19:00")
  const [precioDiario, setPrecioDiario] = useState("150")

  // Estados para controlar los popover del calendario
  const [entregaOpen, setEntregaOpen] = useState(false)
  const [devolucionOpen, setDevolucionOpen] = useState(false)

  // Cargar datos guardados solo si estamos editando
  useEffect(() => {
    if (esEdicion) {
      const detallesGuardados = localStorage.getItem("reservaDetalles")
      if (detallesGuardados) {
        try {
          const detalles = JSON.parse(detallesGuardados)

          // Verificar que los detalles corresponden a esta reserva
          if (detalles.numeroReserva === numeroReserva && detalles.modelo === modelo) {
            // Cargar fechas
            if (detalles.fechaEntrega) {
              setFechaEntrega(new Date(detalles.fechaEntrega))
            }
            if (detalles.fechaDevolucion) {
              setFechaDevolucion(new Date(detalles.fechaDevolucion))
            }

            // Cargar horarios
            if (detalles.horaEntrega) {
              setHoraEntrega(detalles.horaEntrega)
            }
            if (detalles.horaDevolucion) {
              setHoraDevolucion(detalles.horaDevolucion)
            }

            // Cargar precio diario
            if (detalles.precioDiario) {
              setPrecioDiario(detalles.precioDiario)
            }
          }
        } catch (error) {
          console.error("Error al cargar los detalles guardados:", error)
        }
      }
    }
  }, [numeroReserva, modelo, esEdicion])

  const handleContinuar = () => {
    if (!fechaEntrega || !fechaDevolucion) return

    const reservaData = {
      numeroReserva,
      modelo,
      fechaEntrega: fechaEntrega.toISOString(),
      fechaDevolucion: fechaDevolucion.toISOString(),
      horaEntrega,
      horaDevolucion,
      precioDiario,
    }

    // Guardar datos en localStorage
    localStorage.setItem("reservaDetalles", JSON.stringify(reservaData))

    // Navegar a la siguiente pantalla, manteniendo el parámetro editar si es necesario
    const queryParams = esEdicion ? `numero=${numeroReserva}&editar=true` : `numero=${numeroReserva}`
    router.push(`/reserva/${encodeURIComponent(modelo)}/cliente?${queryParams}`)
  }

  const handleVolver = () => {
    router.push("/")
  }

  // Generar opciones de horas
  const horasOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, "0")
    return [`${hour}:00`, `${hour}:30`]
  }).flat()

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
              <div className="border border-caravalia-100 rounded-lg p-4 bg-caravalia-50/50 shadow-sm">
                <h3 className="section-title">Fechas</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="fechaEntrega" className="text-caravalia-700">
                      Fecha de entrega
                    </Label>
                    <Popover open={entregaOpen} onOpenChange={setEntregaOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="justify-start text-left font-normal border-caravalia-200 bg-white hover:bg-caravalia-50 hover:border-caravalia-300"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-caravalia-500" />
                          {fechaEntrega ? (
                            format(fechaEntrega, "dd/MM/yyyy", { locale: es })
                          ) : (
                            <span>Seleccionar fecha</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <div className="flex flex-col">
                          <Calendar
                            mode="single"
                            selected={fechaEntrega}
                            onSelect={setFechaEntrega}
                            initialFocus
                            className="rounded-md border border-caravalia-200"
                          />
                          <div className="p-2 border-t border-caravalia-100 flex justify-end">
                            <Button
                              size="sm"
                              onClick={() => setEntregaOpen(false)}
                              className="bg-caravalia-600 hover:bg-caravalia-700"
                            >
                              OK
                            </Button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="fechaDevolucion" className="text-caravalia-700">
                      Fecha de devolución
                    </Label>
                    <Popover open={devolucionOpen} onOpenChange={setDevolucionOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="justify-start text-left font-normal border-caravalia-200 bg-white hover:bg-caravalia-50 hover:border-caravalia-300"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-caravalia-500" />
                          {fechaDevolucion ? (
                            format(fechaDevolucion, "dd/MM/yyyy", { locale: es })
                          ) : (
                            <span>Seleccionar fecha</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <div className="flex flex-col">
                          <Calendar
                            mode="single"
                            selected={fechaDevolucion}
                            onSelect={setFechaDevolucion}
                            initialFocus
                            className="rounded-md border border-caravalia-200"
                          />
                          <div className="p-2 border-t border-caravalia-100 flex justify-end">
                            <Button
                              size="sm"
                              onClick={() => setDevolucionOpen(false)}
                              className="bg-caravalia-600 hover:bg-caravalia-700"
                            >
                              OK
                            </Button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              <div className="border border-caravalia-100 rounded-lg p-4 bg-caravalia-50/50 shadow-sm">
                <h3 className="section-title">Horarios</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="horaEntrega" className="text-caravalia-700">
                      Hora de entrega
                    </Label>
                    <Select value={horaEntrega} onValueChange={setHoraEntrega}>
                      <SelectTrigger className="border-caravalia-200 bg-white hover:border-caravalia-300">
                        <SelectValue placeholder="Seleccionar hora" />
                      </SelectTrigger>
                      <SelectContent>
                        {horasOptions.map((hora) => (
                          <SelectItem key={hora} value={hora}>
                            {hora}h
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="horaDevolucion" className="text-caravalia-700">
                      Hora de devolución
                    </Label>
                    <Select value={horaDevolucion} onValueChange={setHoraDevolucion}>
                      <SelectTrigger className="border-caravalia-200 bg-white hover:border-caravalia-300">
                        <SelectValue placeholder="Seleccionar hora" />
                      </SelectTrigger>
                      <SelectContent>
                        {horasOptions.map((hora) => (
                          <SelectItem key={hora} value={hora}>
                            {hora}h
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="border border-caravalia-100 rounded-lg p-4 bg-caravalia-50/50 shadow-sm">
                <h3 className="section-title">Importe (€)</h3>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="precioDiario" className="text-caravalia-700">
                    Precio diario
                  </Label>
                  <Input
                    id="precioDiario"
                    type="number"
                    value={precioDiario}
                    onChange={(e) => setPrecioDiario(e.target.value)}
                    className="text-right border-caravalia-200 bg-white focus:border-caravalia-400 focus:ring-caravalia-400"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline" onClick={handleVolver} className="btn-outline-modern">
            Volver
          </Button>
          <Button onClick={handleContinuar} className="btn-primary-modern">
            Continuar
          </Button>
        </div>
      </div>
    </main>
  )
}

