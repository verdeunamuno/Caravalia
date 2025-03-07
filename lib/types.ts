export interface ReservaDetalles {
  numeroReserva: string
  modelo: string
  fechaEntrega: string
  fechaDevolucion: string
  horaEntrega: string
  horaDevolucion: string
  precioDiario: string
  formaPago?: string
  fechaValidacion?: string // Añadir fecha de validación
}

export interface ClienteData {
  nombre: string
  dni: string
  telefono: string
  notas: string
}

export interface ReservaCompleta {
  id: string // Identificador único para la reserva
  numeroReserva: string
  modelo: string
  fechaCreacion: string
  detalles: ReservaDetalles
  cliente: ClienteData
  totalDias: number
  importeTotal: number
  importeSenal: number
  importeRestante: number
  formaPago?: string // Añadir forma de pago
  validado?: boolean // Añadir campo para validación
  fechaValidacion?: string // Añadir fecha de validación
}

