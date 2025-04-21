// 1) Asume que dscc.min.js y d3.min.js ya están cargados via bundling

function drawViz(vizData) {
  // 2) Transformación de datos a un array de objetos
  const rows = vizData.tables.DEFAULT; 

  // 3) Dimensiones del contenedor
  const width  = dscc.getWidth();
  const height = dscc.getHeight();

  // 4) Preparar contenedor
  let container = document.getElementById('container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'container';
    document.body.appendChild(container);
  }
  container.innerHTML = '';

  // 5) Márgenes y SVG
  const margin = { top: 20, right: 20, bottom: 40, left: 50 };
  const w = width  - margin.left - margin.right;
  const h = height - margin.top  - margin.bottom;
  const svg = d3.select(container)
    .append('svg')
      .attr('width',  width)
      .attr('height', height)
    .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

  // 6) Escalas
  const x = d3.scalePoint()
    .domain(rows.map(d => d.dimension))
    .range([0, w])
    .padding(0.5);
  const y = d3.scaleLinear()
    .domain([0, 100])
    .range([h, 0]);

  // 7) Franjas de color
  const ranges = [
    { from:  0, to: 35, color: '#ee7575' },
    { from: 35, to: 50, color: '#ffbb77' },
    { from: 50, to: 65, color: '#ffe27f' },
    { from: 65, to: 80, color: '#bfe0a8' },
    { from: 80, to:100, color: '#67c17b' }
  ];
  ranges.forEach(r => {
    svg.append('rect')
      .attr('x', 0)
      .attr('y', y(r.to))
      .attr('width', w)
      .attr('height', y(r.from) - y(r.to))
      .attr('fill', r.color)
      .attr('opacity', 0.3);
  });

  // 8) Ejes
  svg.append('g')
      .attr('transform', `translate(0,${h})`)
      .call(d3.axisBottom(x));
  svg.append('g')
      .call(d3.axisLeft(y));

  // 9) Línea punteada
  const line = d3.line()
      .x(d => x(d.dimension))
      .y(d => y(d.metric));
  svg.append('path')
      .datum(rows)
      .attr('fill', 'none')
      .attr('stroke', '#08306b')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '4 2')
      .attr('d', line);

  // 10) Puntos
  svg.selectAll('circle')
     .data(rows)
     .enter()
     .append('circle')
       .attr('cx', d => x(d.dimension))
       .attr('cy', d => y(d.metric))
       .attr('r', 4)
       .attr('fill', '#08306b');
}

// 11) Suscribirse a datos de Looker Studio
dscc.subscribeToData(drawViz, { transform: dscc.objectTransform });
