import '../lib/reset.css';
import { loadScenarioCSV } from '../lib/parseCsv.js';

const container = document.getElementById('app');

document.addEventListener('DOMContentLoaded', () => {
  loadScenarioCSV('../../public/scenario.csv').then(data => {
    data.forEach(node => {
      const line = createLineNode(node.text, node.style);
      container.appendChild(line);
    });
  });
});

function createLineNode(text, style) {
  const line = document.createElement('div');
  line.className = 'line';
  //line.style.fontSize = `${style?.fontSize || 20}px`;
  line.textContent = text;
  return line;
}
