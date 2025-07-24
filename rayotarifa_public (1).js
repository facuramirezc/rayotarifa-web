
const tarifasEspeciales = {
  "prieto": { tarifa: 50000, requiereEfectivo: true },
  "rioja refrigeracion": { tarifa: 68000 },
  "bustos carlos": { tarifa: 70000 },
  "agustin del pan": { tarifa: 70000 },
  "salvetti": { tarifa: 73000 },
  "tierra virgen": { tarifa: 76000 },
  "arlequin": "consulta",
  "arlequino": "consulta"
};

const normalizar = (texto) => texto.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");

const calcularTarifa = (cliente, tipoCarga, cantidad, efectivo) => {
  const nombre = normalizar(cliente);
  const key = Object.keys(tarifasEspeciales).find(k => nombre.includes(k));

  if (key) {
    if (tarifasEspeciales[key] === "consulta") {
      return "La carga debe ser cotizada en sistema.";
    }
    const tarifa = tarifasEspeciales[key].tarifa;
    if (key === "prieto" && !efectivo) {
      return "Prieto tiene tarifa especial solo con pago en efectivo en la entrega.";
    }
    return `El precio total para ${cantidad} m³ para ${cliente} es de $${(parseFloat(cantidad) * tarifa).toLocaleString()}`;
  }

  if (tipoCarga === "mt3") {
    const mts = parseFloat(cantidad);
    let precio = 0;
    if (mts <= 1) precio = mts * 73000;
    else if (mts <= 3) precio = mts * 70000;
    else precio = mts * 67500;
    return `El precio total para ${mts} m³ es de $${precio.toLocaleString()}`;
  }

  if (tipoCarga === "bulto") {
    const bultos = parseInt(cantidad);
    const precio = bultos === 1 ? 13500 : bultos * 11750;
    return `El precio total por ${bultos} bultos es de $${precio.toLocaleString()}`;
  }

  if (tipoCarga === "pallet") {
    const alto = parseFloat(cantidad);
    let tarifa = 0;
    if (alto <= 0.9) tarifa = 70000;
    else if (alto <= 1.2) tarifa = 95000;
    else tarifa = 110000;
    return `El precio por pallet de ${alto}m es de $${tarifa.toLocaleString()}`;
  }
};

function enviarAGoogleSheets(data) {
  const scriptURL = 'https://script.google.com/macros/s/AKfycbxSatPFpSIc00GgsIzQ8ETktMqFvA6wmod-ycnPSmEoEkNHop2eUNmqRRugfCcpTSEoGw/exec';
  fetch(scriptURL, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("cotizacionForm").addEventListener("submit", function(e) {
    e.preventDefault();
    const cliente = document.getElementById("cliente").value;
    const tipoCarga = document.getElementById("tipoCarga").value;
    const cantidad = document.getElementById("cantidad").value;
    const destinatario = document.getElementById("destinatario").value;
    const dni = document.getElementById("dni").value;
    const direccion = document.getElementById("direccion").value;
    const efectivo = cliente.toLowerCase().includes("efectivo");

    const resultado = calcularTarifa(cliente, tipoCarga, cantidad, efectivo);
    document.getElementById("resultadoTarifa").innerText = resultado;

    enviarAGoogleSheets({ cliente, tipoCarga, cantidad, destinatario, dni, direccion, resultado });
  });
});
