export async function loadScenarioCSV(path) {
    const response = await fetch(path);
    const text = await response.text();
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',');
    return lines.slice(1).map(line => {
      const values = line.split(',').map(cell =>
        cell.replace(/^"(.*)"$/, '$1')  // "で囲まれている場合だけ除去
      );
      const obj = {};
      headers.forEach((h, i) => {
        obj[h.trim()] = values[i]?.trim();
      });
      if (obj.style) {
        try {
          obj.style = JSON.parse(obj.style.replace(/""/g, '"'));
        } catch (e) {
          //console.warn('Invalid style JSON:', obj.style);
        }
      }
      return obj;
    });
  }
