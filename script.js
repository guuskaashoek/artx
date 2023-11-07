const editor = document.getElementById('editor');
const lineNumbers = document.getElementById('lineNumbers');

editor.addEventListener('input', function() {
  updateLineNumbers();
});

function updateLineNumbers() {
  const lines = editor.value.split('\n').length;
  lineNumbers.textContent = Array.from({ length: lines }, (_, i) => i + 1).join('\n');
}

function runCode() {
  const code = editor.value;
  const [dimensions, ...colors] = code.split(',');
  const [width, height] = dimensions.split('x').map(Number);

  const scale = 30;
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = width * scale;
  canvas.height = height * scale;

  ctx.imageSmoothingEnabled = false;

  let x = 0, y = 0;
  for (const color of colors) {
    ctx.fillStyle = color;
    ctx.fillRect(x * scale, y * scale, scale, scale);
    x++;
    if (x >= width) {
      x = 0;
      y++;
    }
  }
}

function exportGlab() {
  const content = editor.value;
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'pixelart.artx';
  a.click();
  URL.revokeObjectURL(url);
}

// Initial function calls
updateLineNumbers();


editor.addEventListener('scroll', function() {
  lineNumbers.scrollTop = editor.scrollTop;
});

const fileInput = document.getElementById('fileInput');

fileInput.addEventListener('change', function() {
  const file = this.files[0];
  if (file) {
    const fileName = file.name;
    const fileExtension = fileName.split('.').pop();
    if (fileExtension !== 'artx') {
      alert('Only .artx files are allowed.');
      return;
    }

    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function(e) {
      editor.value = e.target.result;
      updateLineNumbers();
    };
  }
});

function exportAsPNG() {
  const canvas = document.getElementById('canvas');
  const link = document.createElement('a');
  link.download = 'artx.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

function exportAsSVG() {
  const code = editor.value;
  const [dimensions, ...colors] = code.split(',');
  const [width, height] = dimensions.split('x').map(Number);

  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">`;

  let x = 0, y = 0;
  for (const color of colors) {
    svgContent += `<rect x="${x}" y="${y}" width="1" height="1" fill="${color}" />`;
    x++;
    if (x >= width) {
      x = 0;
      y++;
    }
  }

  svgContent += '</svg>';

  const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'artx.svg';
  link.click();
  URL.revokeObjectURL(url);
}


function addColorToStorage(color) {
  const colorElement = document.createElement('div');
  colorElement.className = 'storedColor';
  
  const colorBlock = document.createElement('div');
  colorBlock.className = 'colorBlock';
  colorBlock.style.backgroundColor = color;
  
  const colorCode = document.createElement('span');
  colorCode.className = 'colorCode';
  colorCode.textContent = color;

  const copyButton = document.createElement('button');
  copyButton.className = 'copyButton';
  copyButton.textContent = 'copy';
  copyButton.addEventListener('click', function() {
    navigator.clipboard.writeText(color);
  });
  
  const deleteButton = document.createElement('button');
  deleteButton.className = 'deleteButton';
  deleteButton.textContent = 'X';
  deleteButton.addEventListener('click', function() {
    colorElement.remove();
  });

  colorElement.appendChild(colorBlock);
  colorElement.appendChild(colorCode);
  colorElement.appendChild(copyButton);
  colorElement.appendChild(deleteButton);

  document.getElementById('colorStorage').appendChild(colorElement);
}


function addColorFromInput() {
  const colorInput = document.getElementById('colorInput');
  const color = colorInput.value;
  
  // Optionele validatie voor HEX kleurcode
  if (/^#[0-9A-F]{6}$/i.test(color)) {
    addColorToStorage(color); // Je eigen functie om de kleur op te slaan
    colorInput.value = '';  // Wis het invoerveld

    // Voeg de kleur en de kopieerknop toe aan de lijst
    const ul = document.getElementById('colorList');
    const li = document.createElement('li');
    li.setAttribute('data-color', color);
    li.textContent = color + ' ';
    
    const button = document.createElement('button');
    button.textContent = 'copy';
    button.onclick = function() { copyColor(color); };

    li.appendChild(button);
    ul.appendChild(li);

  } else {
    alert('Invalid color code. Please enter a valid HEX color code.');
  }
}

function copyColor(color) {
  navigator.clipboard.writeText(color).then(function() {
    console.log('Color copied to clipboard:', color);
  }).catch(function() {
    console.error('Couldnt copy the color:', color);
  });
}


function extractColorsFromEditor() {
  const editorContent = editor.value;
  const colorSet = new Set();

  // Regex om HEX kleurcodes te vinden
  const regex = /#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/g;
  let match;

  while ((match = regex.exec(editorContent)) !== null) {
    colorSet.add(match[0]);
  }

  // Kleurcodes toevoegen aan opslag
  colorSet.forEach(color => addColorToStorage(color));
}

// Functie om RGB naar HEX om te zetten
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

// Functie om HSL naar RGB om te zetten
function hslToRgb(h, s, l) {
  let r, g, b;

  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;

  if (0 <= h && h < 60) { r = c; g = x; b = 0; }
  else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
  else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
  else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
  else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
  else if (300 <= h && h < 360) { r = c; g = 0; b = x; }

  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  return [r, g, b];
}

// Update de kleur preview
function updateColorPreview() {
  const h = parseFloat(document.getElementById('hue').value);
  const s = parseFloat(document.getElementById('saturation').value);
  const l = parseFloat(document.getElementById('lightness').value);

  const [r, g, b] = hslToRgb(h, s, l);
  const hexColor = rgbToHex(r, g, b);

  // Update de kleur preview
  document.getElementById('colorPreview').style.backgroundColor = hexColor;

  // Update de achtergrond voor de saturation en lightness sliders
  const fullSat = rgbToHex(...hslToRgb(h, 100, l));
  const fullLight = rgbToHex(...hslToRgb(h, s, 50));

  document.getElementById('saturation').style.background = `linear-gradient(to right, #808080, ${fullLight})`;
  document.getElementById('lightness').style.background = `linear-gradient(to right, #000, ${fullSat}, #FFF)`;
}

// Voeg de geselecteerde kleur toe aan de opslag
function addSelectedColor() {
  const h = parseFloat(document.getElementById('hue').value);
  const s = parseFloat(document.getElementById('saturation').value);
  const l = parseFloat(document.getElementById('lightness').value);

  const [r, g, b] = hslToRgb(h, s, l);
  const hexColor = rgbToHex(r, g, b);

  addColorToStorage(hexColor);  // Zorg ervoor dat deze functie bestaat in je code
}

// Event listeners voor de sliders
document.getElementById('hue').addEventListener('input', updateColorPreview);
document.getElementById('saturation').addEventListener('input', updateColorPreview);
document.getElementById('lightness').addEventListener('input', updateColorPreview);

// Update de kleur preview bij het laden van de pagina
updateColorPreview();