"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import { Send, Home, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ReservationA4Template } from "@/components/reservation-a4-template"
import { useCounterStorage } from "@/lib/hooks/use-counter-storage"
import { guardarReserva, generarId, obtenerReservaPorNumeroYModelo } from "@/lib/reservas-store"
import type { ReservaCompleta } from "@/lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ConfirmacionReservaPage({ params }: { params: { modelo: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const numeroReserva = searchParams.get("numero") || ""
  const modelo = decodeURIComponent(params.modelo)
  const esEdicion = searchParams.get("editar") === "true"

  const [reservaDetalles, setReservaDetalles] = useState<any>(null)
  const [clienteData, setClienteData] = useState<any>(null)
  const [totalDias, setTotalDias] = useState(0)
  const [importeTotal, setImporteTotal] = useState(0)
  const [importeSenal, setImporteSenal] = useState(0)
  const [importeRestante, setImporteRestante] = useState(0)
  const [formaPago, setFormaPago] = useState<string>("bizum")
  const [reservaExistente, setReservaExistente] = useState<ReservaCompleta | null>(null)
  const [procesando, setProcesando] = useState(false)

  const pdfTemplateRef = useRef<HTMLDivElement>(null)
  const { setCounterValue } = useCounterStorage(modelo, "0")

  useEffect(() => {
    // Verificar si estamos editando una reserva existente
    if (esEdicion) {
      const reservaActual = obtenerReservaPorNumeroYModelo(numeroReserva, modelo)
      if (reservaActual) {
        setReservaExistente(reservaActual)

        // Si hay una forma de pago guardada, usarla
        if (reservaActual.formaPago) {
          setFormaPago(reservaActual.formaPago)
        }
      }
    }

    // Recuperar datos de la reserva
    const detallesGuardados = localStorage.getItem("reservaDetalles")
    const clienteGuardado = localStorage.getItem("reservaCliente")

    if (detallesGuardados) {
      const detalles = JSON.parse(detallesGuardados)
      setReservaDetalles(detalles)

      // Si ya existe una forma de pago, usarla
      if (detalles.formaPago) {
        setFormaPago(detalles.formaPago)
      }

      // Calcular días (incluyendo el día inicial y final)
      const fechaEntrega = new Date(detalles.fechaEntrega)
      const fechaDevolucion = new Date(detalles.fechaDevolucion)

      // Reset the time part to ensure we're only comparing dates, not times
      const startDate = new Date(fechaEntrega.getFullYear(), fechaEntrega.getMonth(), fechaEntrega.getDate())
      const endDate = new Date(fechaDevolucion.getFullYear(), fechaDevolucion.getMonth(), fechaDevolucion.getDate())

      // Calculate difference in days and add 1 to include both start and end dates
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      const dias = diffDays + 1

      setTotalDias(dias)

      // Calcular importes
      const precioDiario = Number.parseFloat(detalles.precioDiario)
      const total = precioDiario * dias
      setImporteTotal(total)

      // Calcular señal (30% redondeado a múltiplos de 10)
      const senal = Math.round((total * 0.3) / 10) * 10
      setImporteSenal(senal)

      // Calcular restante
      setImporteRestante(total - senal)
    }

    if (clienteGuardado) {
      setClienteData(JSON.parse(clienteGuardado))
    }
  }, [numeroReserva, modelo, esEdicion])

  const handleVolver = () => {
    // Mantener el parámetro editar si es necesario
    const queryParams = esEdicion ? `numero=${numeroReserva}&editar=true` : `numero=${numeroReserva}`
    router.push(`/reserva/${encodeURIComponent(modelo)}/cliente?${queryParams}`)
  }

  const handleIrInicio = () => {
    router.push("/")
  }

  // Nueva función para guardar cambios sin generar PDF
  const handleGuardarCambios = () => {
    if (!reservaDetalles || !clienteData) return

    try {
      // Actualizar los detalles de la reserva con la forma de pago
      reservaDetalles.formaPago = formaPago
      localStorage.setItem("reservaDetalles", JSON.stringify(reservaDetalles))

      // Guardar la reserva completa en el almacenamiento
      const reservaCompleta: ReservaCompleta = {
        // Si estamos editando una reserva existente, mantener su ID
        id: reservaExistente ? reservaExistente.id : generarId(),
        numeroReserva,
        modelo,
        // Si estamos editando, mantener la fecha de creación original
        fechaCreacion: reservaExistente ? reservaExistente.fechaCreacion : new Date().toISOString(),
        detalles: reservaDetalles,
        cliente: clienteData,
        totalDias,
        importeTotal,
        importeSenal,
        importeRestante,
        formaPago,
        // Mantener el estado de validación si estamos editando
        validado: reservaExistente ? reservaExistente.validado : false,
        fechaValidacion: reservaExistente ? reservaExistente.fechaValidacion : null,
      }

      guardarReserva(reservaCompleta)

      // Mostrar mensaje de éxito
      alert("Cambios guardados correctamente.")

      // Redirigir al listado de reservas
      router.push("/reservas")
    } catch (error) {
      console.error("Error al guardar los cambios:", error)
      alert("Ha ocurrido un error al guardar los cambios. Por favor, inténtelo de nuevo.")
    }
  }

  const handleEnviarResumen = async () => {
    // Evitar procesamiento múltiple
    if (procesando) return
    setProcesando(true)

    try {
      // Actualizar los detalles de la reserva con la forma de pago
      if (reservaDetalles) {
        reservaDetalles.formaPago = formaPago

        // Guardar los detalles actualizados en localStorage
        localStorage.setItem("reservaDetalles", JSON.stringify(reservaDetalles))
      }

      // Guardar la reserva completa en el almacenamiento
      if (reservaDetalles && clienteData) {
        const reservaCompleta: ReservaCompleta = {
          // Si estamos editando una reserva existente, mantener su ID
          id: reservaExistente ? reservaExistente.id : generarId(),
          numeroReserva,
          modelo,
          // Si estamos editando, mantener la fecha de creación original
          fechaCreacion: reservaExistente ? reservaExistente.fechaCreacion : new Date().toISOString(),
          detalles: reservaDetalles,
          cliente: clienteData,
          totalDias,
          importeTotal,
          importeSenal,
          importeRestante,
          formaPago,
          // Mantener el estado de validación si estamos editando
          validado: reservaExistente ? reservaExistente.validado : false,
          fechaValidacion: reservaExistente ? reservaExistente.fechaValidacion : null,
        }

        guardarReserva(reservaCompleta)
      }

      // Generar PDF usando el template A4
      const pdfContainer = document.getElementById("pdf-template-container")
      if (!pdfContainer) {
        setProcesando(false)
        return
      }

      // Hacer visible el contenedor del PDF para capturarlo
      pdfContainer.style.display = "block"
      pdfContainer.style.position = "absolute"
      pdfContainer.style.top = "0"
      pdfContainer.style.left = "0"
      pdfContainer.style.width = "210mm"
      pdfContainer.style.height = "auto"
      pdfContainer.style.zIndex = "-1000"

      const canvas = await html2canvas(pdfContainer, {
        scale: 2,
        useCORS: true,
        logging: false,
        width: 793, // ~210mm en px a 96dpi
        height: 1122, // ~297mm en px a 96dpi
        windowWidth: 793,
        windowHeight: 1122,
      })

      // Ocultar el contenedor después de capturarlo
      pdfContainer.style.display = "none"

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      pdf.addImage(imgData, "PNG", 0, 0, 210, 297)
      const pdfBlob = pdf.output("blob")
      const pdfUrl = URL.createObjectURL(pdfBlob)

      // Crear un nombre de archivo seguro para el PDF
      let nombreArchivo = "Reserva_" + numeroReserva

      try {
        // Intentar añadir el nombre del cliente (limpiando caracteres problemáticos)
        if (clienteData && clienteData.nombre) {
          // Reemplazar espacios y caracteres especiales
          const nombreCliente = clienteData.nombre
            .replace(/[^\w\s]/gi, "") // Eliminar caracteres especiales
            .replace(/\s+/g, "_") // Reemplazar espacios con guiones bajos
          nombreArchivo += "_" + nombreCliente
        }

        // Intentar añadir la fecha formateada
        if (reservaDetalles && reservaDetalles.fechaEntrega) {
          const fechaEntrega = new Date(reservaDetalles.fechaEntrega)
          // Usar un formato simple para evitar problemas con caracteres especiales
          const dia = fechaEntrega.getDate()
          const mes = fechaEntrega.toLocaleString("es", { month: "long" })
          const anio = fechaEntrega.getFullYear()
          nombreArchivo += "_" + dia + "_de_" + mes + "_" + anio
        }
      } catch (error) {
        console.error("Error al formatear el nombre del archivo:", error)
        // Si hay un error, usar un nombre simple
        nombreArchivo = "Reserva_" + numeroReserva + "_" + new Date().getTime()
      }

      // Asegurar que el nombre del archivo sea válido
      nombreArchivo = nombreArchivo.replace(/[/\\?%*:|"<>]/g, "_") + ".pdf"

      // Descargar el PDF automáticamente
      const link = document.createElement("a")
      link.href = pdfUrl
      link.download = nombreArchivo
      link.click()

      // Actualizar el contador para la próxima reserva
      if (numeroReserva && !isNaN(Number.parseInt(numeroReserva, 10))) {
        setCounterValue(numeroReserva)
      }

      // Limpiar el número de reserva almacenado para esta sesión
      localStorage.removeItem(`reserva-${modelo}`)

      // Mostrar un mensaje de éxito antes de redirigir
      alert("Reserva guardada y PDF generado correctamente.")

      // Redirigir a la página de inicio inmediatamente
      window.location.href = "/"
    } catch (error) {
      console.error("Error al generar el PDF:", error)
      alert("Ha ocurrido un error al generar el PDF. Por favor, inténtelo de nuevo.")
      setProcesando(false)
    }
  }

  if (!reservaDetalles || !clienteData) {
    return <div className="flex min-h-screen items-center justify-center">Cargando...</div>
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

        <div id="resumen-reserva" className="bg-white p-6 rounded-xl border border-caravalia-100 shadow-card">
          <div className="w-24 h-24 mx-auto relative mb-4">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-67izduTedF5PTHkMbF222qhNGuht6b.png"
              alt="Caravalia Logo"
              fill
              className="object-contain"
            />
          </div>

          <h2 className="text-xl font-bold text-center text-caravalia-800 mb-6">Resumen de Reserva</h2>

          <div className="border border-caravalia-100 rounded-lg p-4 mb-4 bg-caravalia-50/50">
            <h3 className="section-title">Datos del Cliente</h3>
            <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
              <span className="text-caravalia-600">Nombre:</span>
              <span className="font-medium">{clienteData.nombre}</span>

              <span className="text-caravalia-600">DNI:</span>
              <span className="font-medium">{clienteData.dni}</span>

              <span className="text-caravalia-600">Teléfono:</span>
              <span className="font-medium">{clienteData.telefono}</span>
            </div>
          </div>

          <div className="border border-caravalia-100 rounded-lg p-4 mb-4 bg-caravalia-50/50">
            <h3 className="section-title">Detalles de la Reserva</h3>
            <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
              <span className="text-caravalia-600">Modelo:</span>
              <span className="font-medium">{modelo}</span>

              <span className="text-caravalia-600">Matrícula:</span>
              <span className="font-medium">
                {modelo === "294TL"
                  ? "9243MBV"
                  : modelo === "294TL-Automatica" || modelo === "294TL Automática"
                    ? "5957MXW"
                    : ""}
              </span>

              <span className="text-caravalia-600">Entrega:</span>
              <span className="font-medium">
                {format(new Date(reservaDetalles.fechaEntrega), "dd/MM/yyyy", { locale: es })} a las{" "}
                {reservaDetalles.horaEntrega}h
              </span>

              <span className="text-caravalia-600">Devolución:</span>
              <span className="font-medium">
                {format(new Date(reservaDetalles.fechaDevolucion), "dd/MM/yyyy", { locale: es })} a las{" "}
                {reservaDetalles.horaDevolucion}h
              </span>

              <span className="text-caravalia-600">Total días:</span>
              <span className="font-medium">{totalDias} días</span>
            </div>
          </div>

          <div className="border border-caravalia-100 rounded-lg p-4 mb-4 bg-caravalia-50/50">
            <h3 className="section-title">Importes</h3>
            <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
              <span className="text-caravalia-600">Precio por día:</span>
              <span className="font-medium">{reservaDetalles.precioDiario}€</span>

              <span className="text-caravalia-600">Importe total:</span>
              <span className="font-bold text-lg text-caravalia-800">{importeTotal}€</span>

              <span className="text-caravalia-600">Entrega de señal (30%):</span>
              <span className="font-bold text-caravalia-700">{importeSenal}€</span>

              <span className="text-caravalia-600">Forma de pago:</span>
              <div className="w-full">
                <Select value={formaPago} onValueChange={setFormaPago}>
                  <SelectTrigger className="w-full border-caravalia-200 bg-white">
                    <SelectValue placeholder="Seleccionar forma de pago" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bizum">Bizum</SelectItem>
                    <SelectItem value="transferencia">Transferencia previa</SelectItem>
                    <SelectItem value="contado">Contado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <span className="text-caravalia-600">Importe restante:</span>
              <span className="font-bold text-red-600">{importeRestante}€</span>
            </div>
          </div>

          {/* Notas con fuente más pequeña para permitir más texto */}
          {clienteData.notas && (
            <div className="border border-caravalia-100 rounded-lg p-4 mb-4 bg-caravalia-50/50">
              <h3 className="section-title">Notas</h3>
              <p className="text-xs" style={{ lineHeight: "1.2" }}>
                {clienteData.notas}
              </p>
            </div>
          )}

          <p className="text-xs italic text-caravalia-600 mt-4 bg-caravalia-50 p-3 rounded-lg leading-relaxed">
            El día de la entrega se hará un bloqueo en tarjeta del total de la fianza (900€). El resto del importe se
            abonará en efectivo o por transferencia previa. El límite de kilómetros diarios es de 300km/día acumulables
            con lo que, como ejemplo, en 5 días el límite de km sería de 1.500km. Si se superan, el costo sería de 50€
            por cada 100km de más realizados. Recuerde que es necesario para la retirada del vehículo el carnet de
            conducir vigente de todos los ocupantes que vayan a conducir, DNI vigente de todos los ocupantes del
            vehículo y justificante del pago del total de la fianza.
            <br />
            <br />
            El cliente declara que ha leído y acepta las condiciones de la presente reserva y las condiciones generales
            que acompañan, cuyos términos se dan por conocidos. Esta reserva será válida solo cuando se haya realizado
            la entrega mediante cualquiera de los medios disponibles y quedará confirmada en el momento del pago de la
            señal del 30% del total del importe.
          </p>

          <div className="mt-6 text-center text-xs text-caravalia-500">
            <p>
              Caravalia es una firma de MyMarket Cor SLU. / CIF: B56133655 / Avda. Amargacena, nave 9 / 14013 / Córdoba
              / Tfno: 957614918
            </p>
          </div>
        </div>

        <div className="flex justify-between">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleVolver} className="btn-outline-modern">
              Volver
            </Button>
            <Button variant="outline" onClick={handleIrInicio} className="btn-outline-modern flex items-center gap-2">
              <Home className="w-4 h-4 text-caravalia-600" />
              Inicio
            </Button>
          </div>
          <div className="flex gap-2">
            {esEdicion && (
              <Button
                onClick={handleGuardarCambios}
                className="bg-caravalia-700 hover:bg-caravalia-800 text-white flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Guardar cambios
              </Button>
            )}
            <Button
              onClick={handleEnviarResumen}
              className="btn-primary-modern flex items-center gap-2"
              disabled={procesando}
            >
              <Send className="w-4 h-4" />
              {procesando ? "Procesando..." : "Enviar resumen"}
            </Button>
          </div>
        </div>
      </div>

      {/* Contenedor oculto para generar el PDF con el template A4 */}
      <div id="pdf-template-container" ref={pdfTemplateRef} style={{ display: "none" }}>
        <ReservationA4Template
          numeroReserva={numeroReserva}
          modelo={modelo}
          reservaDetalles={{ ...reservaDetalles, formaPago }}
          clienteData={clienteData}
          totalDias={totalDias}
          importeTotal={importeTotal}
          importeSenal={importeSenal}
          importeRestante={importeRestante}
        />
      </div>
    </main>
  )
}

