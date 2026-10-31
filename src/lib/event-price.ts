// Valor de entrada de un evento: el formulario guarda solo dígitos y se publica como $5.000.
const ENTRY_PRICE_MAX_DIGITS = 9;

export function priceDigits(value: string): string {
  return value.replace(/\D/g, '').replace(/^0+/, '').slice(0, ENTRY_PRICE_MAX_DIGITS);
}

export function formatEntryPrice(digits: string): string {
  return digits ? `$${digits.replace(/\B(?=(\d{3})+$)/g, '.')}` : '';
}

// Lee el valor guardado. Textos antiguos que no son un precio ("adhesión voluntaria") quedan vacíos.
export function parseEntryPrice(saved: string | null | undefined): string {
  return saved && /^\$?[\d.]+$/.test(saved) ? priceDigits(saved) : '';
}
