<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Formulario RayoTarifa</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background: #f9f9f9;
      margin: 0;
      padding: 20px;
    }
    form {
      background: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
      max-width: 600px;
      margin: auto;
    }
    form h2 {
      text-align: center;
      color: #2c3e50;
    }
    label {
      display: block;
      margin-top: 15px;
      font-weight: bold;
    }
    input, select {
      width: 100%;
      padding: 10px;
      margin-top: 5px;
      border: 1px solid #ccc;
      border-radius: 5px;
    }
    button {
      margin-top: 20px;
      padding: 12px;
      background-color: #2ecc71;
      color: white;
      border: none;
      border-radius: 5px;
      font-size: 16px;
      cursor: pointer;
    }
    button:hover {
      background-color: #27ae60;
    }
    #resultadoTarifa {
      margin-top: 20px;
      text-align: center;
      font-size: 18px;
      color: #2c3e50;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <form id="cotizacionForm">
    <h2>Solicitá tu cotización</h2>

    <label for="cliente">Nombre del cliente:</label>
    <input type="text" id="cliente" name="cliente" required>

    <label for="tipoCarga">Tipo de carga:</label>
    <select id="tipoCarga" name="tipoCarga" required>
      <option value="mt3">Metro cúbico (m³)</option>
      <option value="bulto">Bultos</option>
      <option value="pallet">Pallets</option>
    </select>

    <label for="cantidad">Cantidad / Medida:</label>
    <input type="text" id="cantidad" name="cantidad" required>

    <label for="provincia">Provincia de destino:</label>
    <select id="provincia" name="provincia" required>
      <option value="La Rioja">La Rioja</option>
      <option value="Catamarca">Catamarca</option>
    </select>

    <label for="destinatario">Nombre del destinatario:</label>
    <input type="text" id="destinatario" name="destinatario" required>

    <label for="dni">DNI del destinatario:</label>
    <input type="text" id="dni" name="dni" required>

    <label for="direccion">Dirección de entrega:</label>
    <input type="text" id="direccion" name="direccion" required>

    <label for="email">Email de contacto:</label>
    <input type="email" id="email" name="email" required>

    <button type="submit">Calcular tarifa</button>
  </form>

  <div id="resultadoTarifa"></div>

  <script>
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
      const scriptURL = 'https://script.google.com/macros/s/AKfycbzAuq462n2AcsKBCvY2dO1Vdz6WcOAwnG1pLjYr0e0HYxsBXhxaGq2_Z5H50tiqE6y4Dw/exec';
      fetch(scriptURL, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });
    }

    document.getElementById("cotizacionForm").addEventListener("submit", function(e) {
      e.preventDefault();
      const cliente = document.getElementById("cliente").value;
      const tipoCarga = document.getElementById("tipoCarga").value;
      const cantidad = document.getElementById("cantidad").value;
      const provincia = document.getElementById("provincia").value;
      const destinatario = document.getElementById("destinatario").value;
      const dni = document.getElementById("dni").value;
      const direccion = document.getElementById("direccion").value;
      const email = document.getElementById("email").value;
      const efectivo = cliente.toLowerCase().includes("efectivo");

      const resultado = calcularTarifa(cliente, tipoCarga, cantidad, efectivo);
      document.getElementById("resultadoTarifa").innerText = resultado;

      enviarAGoogleSheets({ cliente, tipoCarga, cantidad, destinatario, dni, direccion, provincia, email, resultado });
    });
  </script>
</body>
</html>
