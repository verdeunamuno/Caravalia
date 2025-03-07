"use client"

import type { ReservaCompleta } from "./types"

// Clave para almacenar todas las reservas en localStorage
const RESERVAS_STORAGE_KEY = "caravalia-reservas"

// Función para guardar una reserva completa
export function guardarReserva(reserva: ReservaCompleta): void {
  try {
    // Obtener las reservas existentes
    const reservasExistentes = obtenerReservas()

    // Verificar si ya existe una reserva con el mismo ID
    const index = reservasExistentes.findIndex((r) => r.id === reserva.id)

    if (index >= 0) {
      // Actualizar la reserva existente
      reservasExistentes[index] = reserva
    } else {
      // Añadir la nueva reserva
      reservasExistentes.push(reserva)
    }

    // Guardar en localStorage
    localStorage.setItem(RESERVAS_STORAGE_KEY, JSON.stringify(reservasExistentes))
  } catch (error) {
    console.error("Error al guardar la reserva:", error)
  }
}

// Función para obtener todas las reservas
export function obtenerReservas(): ReservaCompleta[] {
  try {
    // Obtener las reservas del localStorage
    const reservasJson = localStorage.getItem(RESERVAS_STORAGE_KEY)

    // Si no hay reservas, devolver un array vacío
    if (!reservasJson) {
      return []
    }

    // Parsear las reservas y devolverlas
    return JSON.parse(reservasJson)
  } catch (error) {
    console.error("Error al obtener las reservas:", error)
    return []
  }
}

// Función para obtener una reserva por su ID
export function obtenerReservaPorId(id: string): ReservaCompleta | null {
  try {
    const reservas = obtenerReservas()
    const reserva = reservas.find((r) => r.id === id)
    return reserva || null
  } catch (error) {
    console.error("Error al obtener la reserva:", error)
    return null
  }
}

// Función para obtener una reserva por su número y modelo
export function obtenerReservaPorNumeroYModelo(numeroReserva: string, modelo: string): ReservaCompleta | null {
  try {
    const reservas = obtenerReservas()
    const reserva = reservas.find((r) => r.numeroReserva === numeroReserva && r.modelo === modelo)
    return reserva || null
  } catch (error) {
    console.error("Error al obtener la reserva por número y modelo:", error)
    return null
  }
}

// Función para eliminar una reserva
export function eliminarReserva(id: string): void {
  try {
    // Obtener las reservas existentes
    const reservas = obtenerReservas()

    // Filtrar la reserva a eliminar
    const nuevasReservas = reservas.filter((r) => r.id !== id)

    // Guardar las reservas actualizadas
    localStorage.setItem(RESERVAS_STORAGE_KEY, JSON.stringify(nuevasReservas))
  } catch (error) {
    console.error("Error al eliminar la reserva:", error)
  }
}

// Función para generar un ID único
export function generarId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

