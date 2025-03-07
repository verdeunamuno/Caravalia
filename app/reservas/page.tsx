"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Search, Edit, Trash2, ArrowLeft, CheckSquare, Square } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

import { obtenerReservas, eliminarReserva, guardarReserva } from "@/lib/reservas-store"
import type { ReservaCompleta } from "@/lib/types"

export default function ReservasPage() {
  const router = useRouter()
  const [reservas, setReservas] = useState<ReservaCompleta[]>([])
  const [filtro, setFiltro] = useState("")
  const [reservasFiltradas, setReservasFiltradas] = useState<ReservaCompleta[]>([])
  const [reservaAEliminar, setReservaAEliminar] = useState<string | null>(null)

  useEffect(() => {
    // Cargar las reservas al montar el componente
    const todasLasReservas = obtenerReservas()
    // Ordenar por fecha de creación (más recientes primero)
    todasLasReservas.sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime())
    setReservas(todasLasReservas)
    setReservasFiltradas(todasLasReservas)
  }, [])

  // Filtrar reservas cuando cambia el filtro
  useEffect(() => {
    if (!filtro.trim()) {
      setReservasFiltradas(reservas)
      return
    }

    const filtroLower = filtro.toLowerCase()
    const resultado = reservas.filter(
      (reserva) =>
        reserva.numeroReserva.toLowerCase().includes(filtroLower) ||
        reserva.modelo.toLowerCase().includes(filtroLower) ||
        reserva.cliente.nombre.toLowerCase().includes(filtroLower) ||
        reserva.cliente.dni.toLowerCase().includes(filtroLower) ||
        reserva.cliente.telefono.toLowerCase().includes(filtroLower),
    )

    setReservasFiltradas(resultado)
  }, [filtro, reservas])

  const handleEditarReserva = (reserva: ReservaCompleta) => {
    // Guardar los datos de la reserva en localStorage para editarla
    localStorage.setItem("reservaDetalles", JSON.stringify(reserva.detalles))
    localStorage.setItem("reservaCliente", JSON.stringify(reserva.cliente))

    // Navegar a la página de detalles con el modelo y número de reserva, añadiendo el parámetro editar=true
    router.push(`/reserva/${encodeURIComponent(reserva.modelo)}/detalles?numero=${reserva.numeroReserva}&editar=true`)
  }

  const confirmarEliminarReserva = (id: string) => {
    setReservaAEliminar(id)
  }

  const handleEliminarReserva = () => {
    if (!reservaAEliminar) return

    // Eliminar la reserva
    eliminarReserva(reservaAEliminar)

    // Actualizar la lista de reservas
    const nuevasReservas = reservas.filter((r) => r.id !== reservaAEliminar)
    setReservas(nuevasReservas)
    setReservasFiltradas(nuevasReservas)

    // Cerrar el diálogo
    setReservaAEliminar(null)
  }

  const handleVolver = () => {
    router.push("/")
  }

  // Función para validar una reserva
  const handleValidarReserva = (reserva: ReservaCompleta) => {
    // Actualizar el estado de validación
    const reservaActualizada = {
      ...reserva,
      validado: !reserva.validado,
      fechaValidacion: !reserva.validado ? new Date().toISOString() : undefined,
    }

    // Guardar la reserva actualizada
    guardarReserva(reservaActualizada)

    // Actualizar la lista de reservas
    const nuevasReservas = reservas.map((r) => (r.id === reserva.id ? reservaActualizada : r))
    setReservas(nuevasReservas)
    setReservasFiltradas(
      filtro.trim()
        ? nuevasReservas.filter(
            (r) =>
              r.numeroReserva.toLowerCase().includes(filtro.toLowerCase()) ||
              r.modelo.toLowerCase().includes(filtro.toLowerCase()) ||
              r.cliente.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
              r.cliente.dni.toLowerCase().includes(filtro.toLowerCase()) ||
              r.cliente.telefono.toLowerCase().includes(filtro.toLowerCase()),
          )
        : nuevasReservas,
    )

    // Si se ha validado, crear evento en Google Calendar
    if (!reserva.validado) {
      crearEventoCalendario(reservaActualizada)
    }
  }

  // Función para crear un evento en Google Calendar
  const crearEventoCalendario = (reserva: ReservaCompleta) => {
    try {
      const fechaEntrega = new Date(reserva.detalles.fechaEntrega)
      const fechaDevolucion = new Date(reserva.detalles.fechaDevolucion)

      // Ajustar las horas según los datos de la reserva
      const [horaEntrega, minutosEntrega] = reserva.detalles.horaEntrega.split(":").map(Number)
      const [horaDevolucion, minutosDevolucion] = reserva.detalles.horaDevolucion.split(":").map(Number)

      fechaEntrega.setHours(horaEntrega || 0, minutosEntrega || 0, 0)
      fechaDevolucion.setHours(horaDevolucion || 0, minutosDevolucion || 0, 0)

      // Formatear fechas para la URL de Google Calendar
      const fechaEntregaISO = fechaEntrega.toISOString().replace(/-|:|\.\d+/g, "")
      const fechaDevolucionISO = fechaDevolucion.toISOString().replace(/-|:|\.\d+/g, "")

      // Crear descripción del evento
      const descripcion = `
        Reserva: ${reserva.numeroReserva}
        Cliente: ${reserva.cliente.nombre}
        DNI: ${reserva.cliente.dni}
        Teléfono: ${reserva.cliente.telefono}
        Importe total: ${reserva.importeTotal}€
        Señal: ${reserva.importeSenal}€
        Forma de pago: ${reserva.formaPago || "No especificada"}
        ${reserva.cliente.notas ? `Notas: ${reserva.cliente.notas}` : ""}
      `.trim()

      // Crear título del evento incluyendo el nombre del cliente
      const titulo = `Reserva ${reserva.numeroReserva} - ${reserva.modelo} - ${reserva.cliente.nombre}`

      // Crear URL para Google Calendar
      const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(titulo)}&dates=${fechaEntregaISO}/${fechaDevolucionISO}&details=${encodeURIComponent(descripcion)}&location=Caravalia&sf=true&output=xml`

      // Abrir la URL en una nueva ventana
      window.open(url, "_blank")
    } catch (error) {
      console.error("Error al crear evento en Google Calendar:", error)
      alert("Ha ocurrido un error al crear el evento en Google Calendar. Por favor, inténtelo manualmente.")
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-6 bg-gradient-to-b from-caravalia-50 to-white">
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
        <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-soft">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={handleVolver}
              className="border-caravalia-200 hover:bg-caravalia-50"
            >
              <ArrowLeft className="h-5 w-5 text-caravalia-700" />
            </Button>
            <h1 className="text-2xl font-bold text-caravalia-800">Listado de Reservas</h1>
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
            <div className="flex items-center mb-6 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-caravalia-400" />
              <Input
                placeholder="Buscar por número, cliente, modelo..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="pl-10 border-caravalia-200 focus:border-caravalia-400"
              />
            </div>

            {reservasFiltradas.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-caravalia-700">Nº</TableHead>
                      <TableHead className="text-caravalia-700">Modelo</TableHead>
                      <TableHead className="text-caravalia-700">Cliente</TableHead>
                      <TableHead className="text-caravalia-700">Entrega</TableHead>
                      <TableHead className="text-caravalia-700">Devolución</TableHead>
                      <TableHead className="text-caravalia-700">Importe</TableHead>
                      <TableHead className="text-caravalia-700">Acciones</TableHead>
                      <TableHead className="text-caravalia-700">Validación</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reservasFiltradas.map((reserva) => (
                      <TableRow key={reserva.id}>
                        <TableCell className="font-medium">{reserva.numeroReserva}</TableCell>
                        <TableCell>{reserva.modelo}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{reserva.cliente.nombre}</span>
                            <span className="text-xs text-caravalia-600">{reserva.cliente.telefono}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(new Date(reserva.detalles.fechaEntrega), "dd/MM/yyyy", { locale: es })}
                        </TableCell>
                        <TableCell>
                          {format(new Date(reserva.detalles.fechaDevolucion), "dd/MM/yyyy", { locale: es })}
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{reserva.importeTotal}€</span>
                            <div className="flex items-center gap-1 text-xs text-caravalia-600 capitalize">
                              <span>
                                {reserva.formaPago === "transferencia"
                                  ? "Transferencia"
                                  : reserva.formaPago === "bizum"
                                    ? "Bizum"
                                    : "Contado"}
                              </span>
                              {reserva.fechaValidacion && (
                                <span>({format(new Date(reserva.fechaValidacion), "dd/MM/yyyy", { locale: es })})</span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEditarReserva(reserva)}
                              className="h-8 w-8 border-caravalia-200 hover:bg-caravalia-50"
                            >
                              <Edit className="h-4 w-4 text-caravalia-600" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => confirmarEliminarReserva(reserva.id)}
                              className="h-8 w-8 border-red-200 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleValidarReserva(reserva)}
                            className={`h-8 w-8 ${
                              reserva.validado
                                ? "border-green-200 bg-green-50 hover:bg-green-100"
                                : "border-red-200 bg-red-50 hover:bg-red-100"
                            }`}
                          >
                            {reserva.validado ? (
                              <CheckSquare className="h-4 w-4 text-green-600" />
                            ) : (
                              <Square className="h-4 w-4 text-red-600" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-caravalia-600">No se encontraron reservas</p>
                {filtro && (
                  <Button
                    variant="link"
                    onClick={() => setFiltro("")}
                    className="text-caravalia-500 hover:text-caravalia-700"
                  >
                    Limpiar filtro
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Diálogo de confirmación para eliminar reserva */}
      <Dialog open={!!reservaAEliminar} onOpenChange={(open) => !open && setReservaAEliminar(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-caravalia-800">Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar esta reserva? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setReservaAEliminar(null)} className="btn-outline-modern">
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleEliminarReserva}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}

