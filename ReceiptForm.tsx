"use client";

import React, { useState } from "react";
import { ReceiptData } from "@/types/receipt";
import { calculateFare, getDayOfWeek, generateReceiptNumber } from "@/lib/fare-calculator";

interface ReceiptFormProps {
  onSubmit: (data: ReceiptData) => void;
}

const ReceiptForm: React.FC<ReceiptFormProps> = ({ onSubmit }) => {
  const [pickupAddress, setPickupAddress] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [tripDate, setTripDate] = useState("");
  const [tripTime, setTripTime] = useState("");
  const [distance, setDistance] = useState<number | "">("");
  const [duration, setDuration] = useState<number | "">("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [cardLastFour, setCardLastFour] = useState("");
  const [finalTotal, setFinalTotal] = useState<number | null>(null);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!pickupAddress.trim()) newErrors.pickupAddress = "La dirección de origen es requerida";
    if (!destinationAddress.trim()) newErrors.destinationAddress = "La dirección de destino es requerida";
    if (!tripDate) newErrors.tripDate = "La fecha del viaje es requerida";
    if (!tripTime) newErrors.tripTime = "La hora del viaje es requerida";
    if (distance === "" || distance <= 0) newErrors.distance = "La distancia debe ser un número positivo";
    if (duration === "" || duration <= 0) newErrors.duration = "La duración debe ser un número positivo";
    if (!paymentMethod.trim()) newErrors.paymentMethod = "El método de pago es requerido";
    if (!cardLastFour.trim() || cardLastFour.length !== 4) newErrors.cardLastFour = "Los últimos 4 dígitos de la tarjeta son requeridos";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const dayOfWeek = getDayOfWeek(tripDate);
    const fareResult = calculateFare({
      distance: Number(distance),
      duration: Number(duration),
      dayOfWeek,
      baseFarePerKm: 0,
      requestFee: 0,
    });

    const receiptNumber = generateReceiptNumber();
    const timestamp = new Date().toISOString();

    const receiptData: ReceiptData = {
      driverName: "",
      pickupAddress,
      destinationAddress,
      tripDate,
      tripTime,
      distance: Number(distance),
      duration: Number(duration),
      paymentMethod,
      cardLastFour,
      baseFare: fareResult.baseFare,
      requestFee: fareResult.requestFee,
      dayMultiplier: fareResult.dayMultiplier,
      calculatedTotal: fareResult.total,
      finalTotal: finalTotal !== null ? finalTotal : fareResult.total,
      receiptNumber,
      timestamp,
    };

    onSubmit(receiptData);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md space-y-4">
      <h2 className="text-2xl font-bold mb-4 text-center">Formulario de Recibo Didi</h2>

      <div>
        <label htmlFor="pickupAddress" className="block font-semibold mb-1">Dirección de origen</label>
        <input
          id="pickupAddress"
          type="text"
          value={pickupAddress}
          onChange={(e) => setPickupAddress(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
        {errors.pickupAddress && <p className="text-red-600 text-sm mt-1">{errors.pickupAddress}</p>}
      </div>

      <div>
        <label htmlFor="destinationAddress" className="block font-semibold mb-1">Dirección de destino</label>
        <input
          id="destinationAddress"
          type="text"
          value={destinationAddress}
          onChange={(e) => setDestinationAddress(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
        {errors.destinationAddress && <p className="text-red-600 text-sm mt-1">{errors.destinationAddress}</p>}
      </div>

      <div className="flex space-x-4">
        <div className="flex-1">
          <label htmlFor="tripDate" className="block font-semibold mb-1">Fecha del viaje</label>
          <input
            id="tripDate"
            type="date"
            value={tripDate}
            onChange={(e) => setTripDate(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
          {errors.tripDate && <p className="text-red-600 text-sm mt-1">{errors.tripDate}</p>}
        </div>
        <div className="flex-1">
          <label htmlFor="tripTime" className="block font-semibold mb-1">Hora del viaje</label>
          <input
            id="tripTime"
            type="time"
            value={tripTime}
            onChange={(e) => setTripTime(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
          {errors.tripTime && <p className="text-red-600 text-sm mt-1">{errors.tripTime}</p>}
        </div>
      </div>

      <div className="flex space-x-4">
        <div className="flex-1">
          <label htmlFor="distance" className="block font-semibold mb-1">Distancia (km)</label>
          <input
            id="distance"
            type="number"
            min="0"
            step="0.1"
            value={distance}
            onChange={(e) => setDistance(e.target.value === "" ? "" : Number(e.target.value))}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
          {errors.distance && <p className="text-red-600 text-sm mt-1">{errors.distance}</p>}
        </div>
        <div className="flex-1">
          <label htmlFor="duration" className="block font-semibold mb-1">Duración (minutos)</label>
          <input
            id="duration"
            type="number"
            min="0"
            step="1"
            value={duration}
            onChange={(e) => setDuration(e.target.value === "" ? "" : Number(e.target.value))}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
          {errors.duration && <p className="text-red-600 text-sm mt-1">{errors.duration}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="paymentMethod" className="block font-semibold mb-1">Método de pago</label>
        <input
          id="paymentMethod"
          type="text"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="Ejemplo: Mastercard"
        />
        {errors.paymentMethod && <p className="text-red-600 text-sm mt-1">{errors.paymentMethod}</p>}
      </div>

      <div>
        <label htmlFor="cardLastFour" className="block font-semibold mb-1">Últimos 4 dígitos de la tarjeta</label>
        <input
          id="cardLastFour"
          type="text"
          maxLength={4}
          value={cardLastFour}
          onChange={(e) => setCardLastFour(e.target.value.replace(/\D/g, ""))}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="Ejemplo: 5538"
        />
        {errors.cardLastFour && <p className="text-red-600 text-sm mt-1">{errors.cardLastFour}</p>}
      </div>

      <div>
        <label htmlFor="finalTotal" className="block font-semibold mb-1">Monto total (puede modificar)</label>
        <input
          id="finalTotal"
          type="number"
          min="0"
          step="0.01"
          value={finalTotal !== null ? finalTotal : ""}
          onChange={(e) => setFinalTotal(e.target.value === "" ? null : Number(e.target.value))}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="Monto total calculado automáticamente"
        />
      </div>
    </form>
  );
};

export default ReceiptForm;
