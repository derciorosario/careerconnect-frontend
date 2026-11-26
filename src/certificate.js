import { jsPDF } from 'jspdf';
import logo from './assets/logo.png';
import signature from './assets/signature.png';
import mainPartner from './assets/patners/main.png';
import partner1 from './assets/patners/1.jpeg';
import partner2 from './assets/patners/2.png';
import partner3 from './assets/patners/3.jpeg';
import partner4 from './assets/patners/4.png';

/* -------------------------------------------------------------------------- */
/*  Config                                                                    */
/* -------------------------------------------------------------------------- */

const PARTNERS = [partner1, partner2, partner3, partner4];

const COLORS = {
  background: [15, 23, 42],   // navy-900
  primary: [242, 107, 15],    // orange
  white: [255, 255, 255],
  textSoft: [226, 232, 240],  // slate-200
  textMuted: [203, 213, 225], // slate-300
  textDim: [148, 163, 184],   // slate-400
};

// Vertical layout in mm (A4 landscape = 297 x 210). Tweak here only.
const Y = {
  logo: 14,
  title: 46,
  subtitle: 55,
  intro: 74,
  name: 92,
  body1: 108,
  body2: 116,
  date: 127,
  signatureLine: 157,   // the signature "sits" on this line
  signatureCaption: 164,
  partnersBottomMargin: 28, // distance from page bottom to top of partner boxes
};

const SIGNATURE = {
  maxWidth: 55,
  maxHeight: 18,
  overlap: 1.5, // mm the ink dips below the line, so it looks hand-signed on it
  lineHalfWidth: 45,
  // The page is dark, so a dark signature would vanish. Set to null to keep
  // the original image colours (e.g. if your signature is already white).
  tint: '#e2e8f0',
};

const PARTNER_BOX = { w: 34, h: 15, gap: 8, padding: 2, radius: 2 };
// Main partner sits beside the platform logo in the header (no background).
const HEADER_PARTNER = { h: 15, maxW: 42, gap: 9 };
const LOGO_HEIGHT = 15;
const MAX_NAME_WIDTH = 240;

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

// Loads an image and returns a PNG data URL plus its intrinsic size.
// Optionally recolours every visible pixel with `tint` (keeps transparency).
// Resolves to null on failure so a missing image never breaks the PDF.
function loadImage(src, { tint = null } = {}) {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 1;
        canvas.height = img.naturalHeight || 1;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        if (tint) {
          ctx.globalCompositeOperation = 'source-in';
          ctx.fillStyle = tint;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        resolve({
          dataUrl: canvas.toDataURL('image/png'),
          width: canvas.width,
          height: canvas.height,
        });
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

const setFill = (doc, c) => doc.setFillColor(...c);
const setDraw = (doc, c) => doc.setDrawColor(...c);
const setText = (doc, c) => doc.setTextColor(...c);

function writeText(doc, text, y, { x, size, bold = false, color }) {
  doc.setFont('helvetica', bold ? 'bold' : 'normal');
  doc.setFontSize(size);
  setText(doc, color);
  doc.text(text, x, y, { align: 'center' });
}

// Shrinks the font until the text fits inside maxWidth (long names).
function fitFontSize(doc, text, maxWidth, size, minSize = 20) {
  doc.setFontSize(size);
  while (size > minSize && doc.getTextWidth(text) > maxWidth) {
    size -= 1;
    doc.setFontSize(size);
  }
  return size;
}

// Scales an image to fit inside a box without distortion.
function contain(img, boxW, boxH) {
  const scale = Math.min(boxW / img.width, boxH / img.height);
  return { w: img.width * scale, h: img.height * scale };
}

/* -------------------------------------------------------------------------- */
/*  Sections                                                                  */
/* -------------------------------------------------------------------------- */

function drawBackground(doc, w, h) {
  setFill(doc, COLORS.background);
  doc.rect(0, 0, w, h, 'F');

  setDraw(doc, COLORS.primary);
  doc.setLineWidth(1.2);
  doc.rect(6, 6, w - 12, h - 12);
  doc.setLineWidth(0.4);
  doc.rect(9, 9, w - 18, h - 18);
}

function drawHeader(doc, cx, logoImg, mainImg) {
  // Header logos: platform logo, a thin divider, then the main partner. The pair is centred on the page as a single unit.
  const items = [];
  if (logoImg) {
    items.push({ type: 'logo', w: LOGO_HEIGHT * (logoImg.width / logoImg.height) });
  }
  if (mainImg) {
    const { h, maxW } = HEADER_PARTNER;
    const fit = contain(mainImg, maxW, h);
    items.push({ type: 'partner', w: fit.w, fit });
  }

  const { gap } = HEADER_PARTNER;
  const totalW = items.reduce((s, it) => s + it.w, 0) + (items.length - 1) * (gap * 2 + 0.3);
  let x = cx - totalW / 2;

  items.forEach((it, i) => {
    if (it.type === 'logo') {
      doc.addImage(logoImg.dataUrl, 'PNG', x, Y.logo, it.w, LOGO_HEIGHT);
    } else {
      // Drawn directly on the page background (no card behind it).
      doc.addImage(
        mainImg.dataUrl, 'PNG',
        x, Y.logo + (HEADER_PARTNER.h - it.fit.h) / 2, it.fit.w, it.fit.h,
      );
    }
    x += it.w;
    if (i < items.length - 1) {
      x += gap;
      setDraw(doc, COLORS.textDim);
      doc.setLineWidth(0.3);
      doc.line(x, Y.logo + 1.5, x, Y.logo + LOGO_HEIGHT - 1.5);
      x += gap + 0.3;
    }
  });

  writeText(doc, 'CERTIFICADO', Y.title, { x: cx, size: 32, bold: true, color: COLORS.white });
  writeText(doc, 'DE PARTICIPAÇÃO', Y.subtitle, { x: cx, size: 12, color: COLORS.textMuted });
}

function drawBody(doc, cx, { name, role, eventName, date }) {
  writeText(doc, 'Certificamos que', Y.intro, { x: cx, size: 13, color: COLORS.textMuted });

  const safeName = String(name).trim().slice(0, 60);
  doc.setFont('helvetica', 'bold');
  const nameSize = fitFontSize(doc, safeName, MAX_NAME_WIDTH, 38);
  writeText(doc, safeName, Y.name, { x: cx, size: nameSize, bold: true, color: COLORS.primary });

  const roleLabel = role === 'mentor' ? 'Mentor' : 'Mentorado';
  writeText(doc, `participou como ${roleLabel} no evento ${eventName},`, Y.body1, {
    x: cx, size: 13, color: COLORS.textSoft,
  });
  writeText(doc, 'contribuindo para o seu sucesso e impacto.', Y.body2, {
    x: cx, size: 13, color: COLORS.textSoft,
  });

  const dateStr = new Date(date).toLocaleDateString('pt-PT', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
  writeText(doc, dateStr, Y.date, { x: cx, size: 11, color: COLORS.textDim });
}

function drawSignature(doc, cx, signatureImg) {
  const lineY = Y.signatureLine;

  // Image is scaled to fit its box, centred on the line, with its bottom edge
  // resting just below the line so it reads as signed on it.
  if (signatureImg) {
    const { w, h } = contain(signatureImg, SIGNATURE.maxWidth, SIGNATURE.maxHeight);
    doc.addImage(
      signatureImg.dataUrl,
      'PNG',
      cx - w / 2,
      lineY - h + SIGNATURE.overlap,
      w,
      h,
    );
  }

  setDraw(doc, COLORS.textDim);
  doc.setLineWidth(0.3);
  doc.line(cx - SIGNATURE.lineHalfWidth, lineY, cx + SIGNATURE.lineHalfWidth, lineY);

  writeText(doc, 'Organização Career Connect', Y.signatureCaption, {
    x: cx, size: 10, color: COLORS.textDim,
  });
}

function drawPartners(doc, cx, h, partnerImgs) {
  const imgs = partnerImgs.filter(Boolean);
  if (!imgs.length) return;

  const { w: boxW, h: boxH, gap, padding, radius } = PARTNER_BOX;
  const totalW = imgs.length * boxW + (imgs.length - 1) * gap;
  const startX = cx - totalW / 2;
  const boxY = h - Y.partnersBottomMargin;

  imgs.forEach((img, i) => {
    const x = startX + i * (boxW + gap);
    setFill(doc, COLORS.white);
    doc.roundedRect(x, boxY, boxW, boxH, radius, radius, 'F');

    const { w, h: ih } = contain(img, boxW - padding * 2, boxH - padding * 2);
    doc.addImage(img.dataUrl, 'PNG', x + (boxW - w) / 2, boxY + (boxH - ih) / 2, w, ih);
  });
}

/* -------------------------------------------------------------------------- */
/*  Public API                                                                */
/* -------------------------------------------------------------------------- */

// Generates and downloads a participation certificate PDF.
export async function downloadCertificate({
  name = 'Participante',
  role = 'mentee',
  eventName = 'Career Connect 2026',
  date = new Date(),
} = {}) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  const cx = w / 2;

  const [logoImg, signatureImg, mainPartnerImg, ...partnerImgs] = await Promise.all([
    loadImage(logo),
    loadImage(signature, { tint: SIGNATURE.tint }),
    loadImage(mainPartner),
    ...PARTNERS.map((p) => loadImage(p)),
  ]);

  drawBackground(doc, w, h);
  drawHeader(doc, cx, logoImg, mainPartnerImg);
  drawBody(doc, cx, { name, role, eventName, date });
  drawSignature(doc, cx, signatureImg);
  drawPartners(doc, cx, h, partnerImgs);

  const fileSafe = String(name).trim().replace(/\s+/g, '-') || 'participante';
  const fileName = `Certificado-${fileSafe}.pdf`;
  try {
    await doc.save(fileName);
  } catch (saveErr) {
    // Fallback for environments where jsPDF's save() is blocked (sandboxed
    // iframes, some browsers): build a blob and trigger the download manually.
    console.error('doc.save failed, using blob fallback:', saveErr);
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}