/**
 * Processamento de imagens 100% no navegador (Canvas).
 * Tudo vira WebP pequeno (JPEG no iPhone) antes de ir para o GitHub, para o site continuar leve.
 *   - ícone: quadrado 256x256
 *   - capa: 16:9, 640x360 (recorte central)
 *   - demonstração e tutorial: até 1200 px de largura e 1200 px de altura
 */

export interface ProcessedImage {
  base64: string;
  previewUrl: string;
  bytes: number;
  /** webp na maioria dos navegadores; jpg no iPhone/iPad, que não geram WebP. */
  extensao: 'webp' | 'jpg';
}

const LIMITE_ARQUIVO_ORIGINAL = 25 * 1024 * 1024; // 25 MB
const LIMITE_FINAL = 450 * 1024; // depois de convertida, cada imagem fica abaixo de ~450 KB

function carregar(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('O arquivo escolhido não é uma imagem.'));
      return;
    }
    if (file.size > LIMITE_ARQUIVO_ORIGINAL) {
      reject(new Error('Imagem grande demais (mais de 25 MB). Escolha uma menor.'));
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Não foi possível ler a imagem escolhida.'));
    };
    img.src = objectUrl;
  });
}

/** Desenha o recorte (sx, sy, sw, sh) da imagem num canvas de largura x altura e gera WebP. */
function gerar(
  img: HTMLImageElement,
  recorte: [number, number, number, number],
  largura: number,
  altura: number
): ProcessedImage {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(largura));
  canvas.height = Math.max(1, Math.round(altura));
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Este navegador não conseguiu processar a imagem.');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const [sx, sy, sw, sh] = recorte;
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

  let qualidade = 0.88;
  let tipo = 'image/webp';
  let dataUrl = canvas.toDataURL(tipo, qualidade);
  if (!dataUrl.startsWith('data:image/webp')) {
    // iPhone e iPad (Safari) não geram WebP: usa JPEG, que também fica leve
    tipo = 'image/jpeg';
    dataUrl = canvas.toDataURL(tipo, qualidade);
  }
  while (dataUrl.length * 0.75 > LIMITE_FINAL && qualidade > 0.45) {
    qualidade -= 0.1;
    dataUrl = canvas.toDataURL(tipo, qualidade);
  }
  const base64 = dataUrl.replace(/^data:image\/[a-z]+;base64,/, '');
  return {
    base64,
    previewUrl: dataUrl,
    bytes: Math.round((base64.length * 3) / 4),
    extensao: tipo === 'image/webp' ? 'webp' : 'jpg',
  };
}

function dimensoes(img: HTMLImageElement): [number, number] {
  return [img.naturalWidth || img.width, img.naturalHeight || img.height];
}

/** Recorte central na proporção desejada. */
function recorteCentral(w: number, h: number, proporcao: number): [number, number, number, number] {
  if (w / h > proporcao) {
    const nw = h * proporcao;
    return [(w - nw) / 2, 0, nw, h];
  }
  const nh = w / proporcao;
  return [0, (h - nh) / 2, w, nh];
}

export async function cropAndResizeToSquareWebp(file: File, size = 256): Promise<ProcessedImage> {
  const img = await carregar(file);
  const [w, h] = dimensoes(img);
  return gerar(img, recorteCentral(w, h, 1), size, size);
}

export async function capaWebp(file: File, largura = 640): Promise<ProcessedImage> {
  const img = await carregar(file);
  const [w, h] = dimensoes(img);
  return gerar(img, recorteCentral(w, h, 16 / 9), largura, (largura * 9) / 16);
}

export async function resizeDemoImageWebp(file: File, maxWidth = 1200, maxHeight = 1200): Promise<ProcessedImage> {
  const img = await carregar(file);
  const [w, h] = dimensoes(img);
  const escala = Math.min(1, maxWidth / w, maxHeight / h);
  return gerar(img, [0, 0, w, h], w * escala, h * escala);
}
