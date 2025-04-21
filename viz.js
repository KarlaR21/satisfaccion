/**
 * viz.js para Community Visualization en Looker Studio
 * NO usar import/exports. D3 y dscc ya vienen cargados por el manifest.
 */
(function(){

  // 1. Referencias a las librerías globales
  const d3 = window.d3;
  const dscc = window.dscc;

  // 2. Función principal que dibuja el gráfico
  function drawViz(data) {
    // 2.1. Prepara el contenedor
    let container = document.getElementById("viz");
    if (!container) {
      container = document.createElement("div");
      container.id = "viz";
      document.body.appendChild(container);
    }
    container.innerHTML = "";

    // 2.2. Extrae datos
    const rowsRaw = data.tables.DEFAULT;
    const dimName = data.fields.dimension[0].name;
    const metName = data.fields.metric[0].name;
    const rows = rowsRaw.map(r => ({
      dimension: r[dimName],
      metric:   +r[metName]
    }));

    // 2.3. Márgenes y tamaño
    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const width  = container.offsetWidth  - margin.left - margin.right;
    const height = container.offsetHeight - margin.top  - margin.bottom;

    // 2.4. Crea SVG
    const svg = d3.select(container)
      .append("svg")
        .attr("width",  width  + margin.left + margin.right)
        .attr("height", height + margin.top  + margin.bottom)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // 2.5. Escalas
    const x = d3.scalePoint()
      .domain(rows.map(d => d.dimension))
      .range([0, width])
      .padding(0.5);
    const y = d3.scaleLinear()
      .domain([0, 100])
      .range([height, 0]);

    // 2.6. Franjas de color
    const ranges = [
      { from:   0, to:  35, color: "#ee7575" },
      { from:  35, to:  50, color: "#ffbb77" },
      { from:  50, to:  65, color: "#ffe27f" },
      { from:  65, to:  80, color: "#bfe0a8" },
      { from:  80, to: 100, color: "#67c17b" }
    ];
    ranges.forEach(r => {
      svg.append("rect")
        .attr("x", 0)
        .attr("y", y(r.to))
        .attr("width", width)
        .attr("height", y(r.from) - y(r.to))
        .attr("fill", r.color)
        .attr("opacity", 0.3);
    });

    // 2.7. Ejes
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));
    svg.append("g")
      .call(d3.axisLeft(y));

    // 2.8. Línea punteada
    const line = d3.line()
      .x(d => x(d.dimension))
      .y(d => y(d.metric));
    svg.append("path")
      .datum(rows)
      .attr("fill", "none")
      .attr("stroke", "#08306b")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "4 2")
      .attr("d", line);

    // 2.9. Puntos
    svg.selectAll("circle")
      .data(rows)
      .enter()
      .append("circle")
        .attr("cx", d => x(d.dimension))
        .attr("cy", d => y(d.metric))
        .attr("r", 4)
        .attr("fill", "#08306b");
  }

  // 3. Suscríbete a los datos que envía Looker Studio
  dscc.subscribeToData(drawViz, { transform: dscc.objectTransform });

})();
