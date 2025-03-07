import Image from "next/image"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface ReservationTemplateProps {
  numeroReserva: string
  modelo: string
  reservaDetalles: any
  clienteData: any
  totalDias: number
  importeTotal: number
  importeSenal: number
  importeRestante: number
}

// Función para formatear la forma de pago
function formatFormaPago(formaPago?: string): string {
  if (!formaPago) return "Transferencia previa"

  switch (formaPago) {
    case "bizum":
      return "Bizum"
    case "contado":
      return "Contado"
    case "transferencia":
      return "Transferencia previa"
    default:
      return formaPago
  }
}

// Añadir una función para determinar la matrícula según el modelo
function obtenerMatricula(modelo: string): string {
  switch (modelo) {
    case "294TL":
      return "9243MBV"
    case "294TL-Automatica":
    case "294TL Automática":
      return "5957MXW"
    default:
      return ""
  }
}

export function ReservationA4Template({
  numeroReserva,
  modelo,
  reservaDetalles,
  clienteData,
  totalDias,
  importeTotal,
  importeSenal,
  importeRestante,
}: ReservationTemplateProps) {
  return (
    <div
      className="bg-white w-full mx-auto relative"
      style={{
        width: "210mm",
        height: "297mm",
        padding: "10mm",
        boxSizing: "border-box",
        fontFamily: "Arial, sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Encabezado reorganizado */}
      <div className="flex justify-between items-center border-b border-caravalia-200 pb-3 mb-4">
        <div className="w-24 h-24 relative">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-67izduTedF5PTHkMbF222qhNGuht6b.png"
            alt="Caravalia Logo"
            fill
            className="object-contain"
          />
        </div>

        <div className="flex flex-col items-center mx-auto">
          <p className="text-sm text-caravalia-600 font-medium text-center">
            Autocaravana modelo {modelo}
            <br />
            Matrícula {obtenerMatricula(modelo)}
          </p>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="border-2 border-caravalia-600 rounded-md p-2 inline-block bg-caravalia-50 text-center">
            <h1 className="text-lg font-bold text-caravalia-700">
              <span className="font-medium">Reserva nº </span>
              <span className="text-caravalia-800">{numeroReserva}</span>
            </h1>
          </div>

          <p className="text-xs text-caravalia-500 text-center">
            Fecha: {format(new Date(), "dd/MM/yyyy", { locale: es })}
          </p>
        </div>
      </div>

      {/* Sección principal con información de la reserva - contenido principal */}
      <div className="space-y-3 flex-grow">
        {/* Datos del cliente */}
        <div className="border border-caravalia-200 rounded-lg p-3 bg-white shadow-sm">
          <h2 className="text-sm font-bold mb-2 text-caravalia-800 border-b border-caravalia-200 pb-1 uppercase">
            Datos del Cliente
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs mb-1">
                <span className="font-semibold text-caravalia-700">Nombre:</span> {clienteData.nombre}
              </p>
              <p className="text-xs mb-1">
                <span className="font-semibold text-caravalia-700">DNI:</span> {clienteData.dni}
              </p>
            </div>
            <div>
              <p className="text-xs mb-1">
                <span className="font-semibold text-caravalia-700">Teléfono:</span> {clienteData.telefono}
              </p>
            </div>
          </div>
        </div>

        {/* Fechas y horarios */}
        <div className="border border-caravalia-200 rounded-lg p-3 bg-white shadow-sm">
          <h2 className="text-sm font-bold mb-2 text-caravalia-800 border-b border-caravalia-200 pb-1 uppercase">
            Fechas y Horarios
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs mb-1">
                <span className="font-semibold text-caravalia-700">Fecha de entrega:</span>
                <br />
                {format(new Date(reservaDetalles.fechaEntrega), "dd/MM/yyyy", { locale: es })}
              </p>
              <p className="text-xs mb-1">
                <span className="font-semibold text-caravalia-700">Hora de entrega:</span>
                <br />
                {reservaDetalles.horaEntrega}h
              </p>
            </div>
            <div>
              <p className="text-xs mb-1">
                <span className="font-semibold text-caravalia-700">Fecha de devolución:</span>
                <br />
                {format(new Date(reservaDetalles.fechaDevolucion), "dd/MM/yyyy", { locale: es })}
              </p>
              <p className="text-xs mb-1">
                <span className="font-semibold text-caravalia-700">Hora de devolución:</span>
                <br />
                {reservaDetalles.horaDevolucion}h
              </p>
            </div>
          </div>
          <p className="text-xs mt-1">
            <span className="font-semibold text-caravalia-700">Duración total:</span> {totalDias} días
          </p>
        </div>

        {/* Detalles económicos */}
        <div className="border border-caravalia-200 rounded-lg p-3 bg-white shadow-sm">
          <h2 className="text-sm font-bold mb-2 text-caravalia-800 border-b border-caravalia-200 pb-1 uppercase">
            Detalles Económicos
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs mb-1">
                <span className="font-semibold text-caravalia-700">Precio por día:</span> {reservaDetalles.precioDiario}
                €
              </p>
              <p className="text-xs mb-1">
                <span className="font-semibold text-caravalia-700">Días de alquiler:</span> {totalDias}
              </p>
              <p className="text-sm font-bold mt-1 text-caravalia-800">Importe total: {importeTotal}€</p>
            </div>
            <div>
              <p className="text-xs mb-1">
                <span className="font-semibold text-caravalia-700">Señal (30%):</span> {importeSenal}€
              </p>
              <p className="text-xs mb-1">
                <span className="font-semibold text-caravalia-700">Forma de pago:</span>{" "}
                {formatFormaPago(reservaDetalles.formaPago)}
                {reservaDetalles.fechaValidacion && (
                  <span className="text-xs text-caravalia-600 ml-1">
                    ({format(new Date(reservaDetalles.fechaValidacion), "dd/MM/yyyy", { locale: es })})
                  </span>
                )}
              </p>
              <p className="text-xs mb-1">
                <span className="font-semibold text-caravalia-700">Importe restante:</span>{" "}
                <span className="font-bold text-red-600">{importeRestante}€</span>
              </p>
              <p className="text-xs mb-1">
                <span className="font-semibold text-caravalia-700">Fianza:</span> 900€
              </p>
            </div>
          </div>
        </div>

        {/* Notas (si existen) - Marco ampliado y fuente más pequeña */}
        {clienteData.notas && (
          <div className="border border-caravalia-200 rounded-lg p-3 bg-white shadow-sm">
            <h2 className="text-sm font-bold mb-2 text-caravalia-800 border-b border-caravalia-200 pb-1 uppercase">
              Notas
            </h2>
            <p className="text-[9px]" style={{ lineHeight: "1.2" }}>
              {clienteData.notas}
            </p>
          </div>
        )}
      </div>

      {/* Firma */}
      <div className="mt-6 mb-2">
        <p className="text-xs font-medium text-caravalia-700 mb-1 text-center">Firmado por MyMarket Cor SLU</p>
        <div className="flex justify-center mb-2">
          <div className="relative w-36 h-16">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Sello%20MyMarket%20firma%20Antonio-qQqKxWF4tBgkx4ZSibepuRjhjxG7vt.png"
              alt="Firma MyMarket"
              fill
              className="object-contain"
            />
          </div>
        </div>
        <p className="text-[9px] text-center text-caravalia-600 italic">Documento firmado digitalmente</p>
      </div>

      {/* Condiciones - Colocadas justo encima del pie de página */}
      <div className="mt-2 border-t border-caravalia-200 pt-2">
        <h3 className="text-xs font-bold mb-1 text-caravalia-700">CONDICIONES</h3>
        <div className="text-[9px] text-caravalia-600" style={{ lineHeight: "1.1" }}>
          <p>
            El día de la entrega se hará un bloqueo en tarjeta del total de la fianza (900€). El resto del importe se
            abonará en efectivo o por transferencia previa. El límite de kilómetros diarios es de 300km/día acumulables
            con lo que, como ejemplo, en 5 días el límite de km sería de 1.500km. Si se superan, el costo sería de 50€
            por cada 100km de más realizados. Recuerde que es necesario para la retirada del vehículo el carnet de
            conducir vigente de todos los ocupantes que vayan a conducir, DNI vigente de todos los ocupantes del
            vehículo y justificante del pago del total de la fianza.
          </p>
          <p className="mt-1">
            El cliente declara que ha leído y acepta las condiciones de la presente reserva y las condiciones generales
            que acompañan, cuyos términos se dan por conocidos. Esta reserva será válida solo cuando se haya realizado
            la entrega mediante cualquiera de los medios disponibles y quedará confirmada en el momento del pago de la
            señal del 30% del total del importe.
          </p>
        </div>
      </div>

      {/* Pie de página - Datos de la empresa - Colocados al final del documento */}
      <div className="mt-2 w-full text-center border-t border-caravalia-100 pt-1">
        <p className="text-[9px] text-caravalia-500 italic">
          Caravalia es una firma de MyMarket Cor SLU. / CIF: B56133655 / Avda. Amargacena, nave 9 / 14013 / Córdoba /
          Tfno: 957614918
        </p>
      </div>
    </div>
  )
}

