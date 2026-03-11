const ones = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];
const tens = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];

function convertHundreds(n: number): string {
  if (n === 0) return "";
  if (n < 20) return ones[n];
  if (n < 100) {
    return `${tens[Math.floor(n / 10)]}${n % 10 !== 0 ? ` ${ones[n % 10]}` : ""}`;
  }
  return `${ones[Math.floor(n / 100)]} Hundred${n % 100 !== 0 ? ` ${convertHundreds(n % 100)}` : ""}`;
}

export function numberToWords(amount: number): string {
  if (amount === 0) return "Zero";

  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);

  let result = "";

  if (rupees >= 10000000) {
    result += `${convertHundreds(Math.floor(rupees / 10000000))} Crore `;
  }
  if (rupees >= 100000) {
    result += `${convertHundreds(Math.floor((rupees % 10000000) / 100000))} Lakh `;
  }
  if (rupees >= 1000) {
    result += `${convertHundreds(Math.floor((rupees % 100000) / 1000))} Thousand `;
  }
  if (rupees >= 100) {
    result += `${convertHundreds(Math.floor((rupees % 1000) / 100))} Hundred `;
  }
  if (rupees % 100 !== 0) {
    result += convertHundreds(rupees % 100);
  }

  result = result.trim();

  if (paise > 0) {
    result += ` and ${convertHundreds(paise)} Paise`;
  }

  return result;
}

export function formatCurrency(amount: bigint): string {
  const num = Number(amount);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(num);
}
