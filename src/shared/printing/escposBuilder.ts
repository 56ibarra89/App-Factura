/**
 * Constructor de comandos ESC/POS para impresoras térmicas (58mm / 80mm).
 * Genera buffers binarios compatibles con impresoras térmicas EPSON, POS-58, POS-80, Xprinter, etc.
 */

export class EscPosBuilder {
  private buffer: number[] = [];

  constructor() {
    this.init();
  }

  /**
   * Inicializa la impresora (ESC @)
   */
  init(): this {
    this.buffer.push(0x1b, 0x40);
    return this;
  }

  /**
   * Alineación: 0 = Izquierda, 1 = Centro, 2 = Derecha
   */
  align(alignment: "left" | "center" | "right"): this {
    const val = alignment === "center" ? 1 : alignment === "right" ? 2 : 0;
    this.buffer.push(0x1b, 0x61, val);
    return this;
  }

  /**
   * Negrita ON / OFF
   */
  bold(enable = true): this {
    this.buffer.push(0x1b, 0x45, enable ? 1 : 0);
    return this;
  }

  /**
   * Tamaño del texto: 'normal', 'double-height', 'double-width', 'large' (doble ancho y alto)
   */
  size(mode: "normal" | "double-height" | "double-width" | "large" = "normal"): this {
    let val = 0x00;
    if (mode === "double-height") val = 0x01;
    else if (mode === "double-width") val = 0x10;
    else if (mode === "large") val = 0x11;
    this.buffer.push(0x1d, 0x21, val);
    return this;
  }

  /**
   * Agrega texto normalizando caracteres españoles para evitar glifos extraños
   */
  text(str: string): this {
    const normalized = this.cleanText(str);
    for (let i = 0; i < normalized.length; i++) {
      this.buffer.push(normalized.charCodeAt(i) & 0xff);
    }
    return this;
  }

  /**
   * Escribe una línea completa de texto
   */
  line(str = ""): this {
    this.text(str);
    this.buffer.push(0x0a);
    return this;
  }

  /**
   * Salto de línea
   */
  feed(lines = 1): this {
    for (let i = 0; i < lines; i++) {
      this.buffer.push(0x0a);
    }
    return this;
  }

  /**
   * Línea divisoria
   */
  separator(char = "-", width = 32): this {
    this.align("left");
    this.line(char.repeat(width));
    return this;
  }

  /**
   * Imprime dos columnas alineadas a los extremos (ej: "Pizza Grande" ......... "C$ 350.00")
   */
  twoColumns(left: string, right: string, width = 32): this {
    const cleanLeft = this.cleanText(left);
    const cleanRight = this.cleanText(right);
    const spaceNeeded = width - cleanLeft.length - cleanRight.length;
    if (spaceNeeded > 0) {
      this.line(cleanLeft + " ".repeat(spaceNeeded) + cleanRight);
    } else {
      this.line(cleanLeft);
      this.line(" ".repeat(Math.max(0, width - cleanRight.length)) + cleanRight);
    }
    return this;
  }

  /**
   * Corte de papel (GS V 65 3)
   */
  cut(feedLines = 3): this {
    this.feed(feedLines);
    this.buffer.push(0x1d, 0x56, 0x41, 0x03);
    return this;
  }

  /**
   * Pulso de apertura de gaveta de dinero (RJ11)
   */
  openCashDrawer(): this {
    // Pin 2
    this.buffer.push(0x1b, 0x70, 0x00, 0x19, 0xfa);
    // Pin 5
    this.buffer.push(0x1b, 0x70, 0x01, 0x19, 0xfa);
    return this;
  }

  /**
   * Obtiene los bytes generados
   */
  toBytes(): Uint8Array {
    return new Uint8Array(this.buffer);
  }

  /**
   * Convierte a string binario para transmisión directa
   */
  toBinaryString(): string {
    return String.fromCharCode.apply(null, this.buffer);
  }

  private cleanText(str: string): string {
    return str
      .replace(/á/g, "a")
      .replace(/é/g, "e")
      .replace(/í/g, "i")
      .replace(/ó/g, "o")
      .replace(/ú/g, "u")
      .replace(/Á/g, "A")
      .replace(/É/g, "E")
      .replace(/Í/g, "I")
      .replace(/Ó/g, "O")
      .replace(/Ú/g, "U")
      .replace(/ñ/g, "n")
      .replace(/Ñ/g, "N")
      .replace(/¿/g, "")
      .replace(/¡/g, "");
  }
}
