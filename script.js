// Function to update down payment and insurance
function updateDownPaymentAndInsurance() {
  const purchasePrice = parseFloat(document.getElementById('purchasePrice').value);
  const dpSelect = document.getElementById('downPaymentPercent').value;
  const dpField = document.getElementById('downPaymentAmount');
  const insuranceField = document.getElementById('mortgageInsurance');
  const formatter = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' });

  let downPayment = 0, insuranceRate = 0;

  if (!isNaN(purchasePrice)) {
    const first500 = Math.min(purchasePrice, 500000);
    const remainder = Math.max(0, purchasePrice - 500000);

    switch (dpSelect) {
      case 'tiered':
        downPayment = (first500 * 0.05) + (remainder * 0.10);
        insuranceRate = downPayment < purchasePrice * 0.20 ? 0.04 : 0;
        break;
      case '10':
        downPayment = purchasePrice * 0.10;
        insuranceRate = 0.031;
        break;
      case '15':
        downPayment = purchasePrice * 0.15;
        insuranceRate = 0.028;
        break;
      case '20':
        downPayment = purchasePrice * 0.20;
        insuranceRate = 0;
        break;
      case '25':
        downPayment = purchasePrice * 0.25;
        insuranceRate = 0;
        break;
      case '35':
        downPayment = purchasePrice * 0.35;
        insuranceRate = 0;
        break;
    }

    const mortgageAmount = purchasePrice - downPayment;
    const insurance = insuranceRate > 0 ? mortgageAmount * insuranceRate : 0;

    dpField.value = formatter.format(downPayment);
    insuranceField.value = insuranceRate > 0 ? formatter.format(insurance) : 'Not applicable';
  } else {
    dpField.value = '';
    insuranceField.value = '';
  }

  calculateMortgage();
}

// Function to calculate mortgage
function calculateMortgage() {
  const principal = parseFloat(document.getElementById('principal').value);
  const interestRateInput = parseFloat(document.getElementById('interestRate').value);
  const amortizationYears = parseFloat(document.getElementById('amortization').value);
  const compounding = document.getElementById('compoundingToggle').value;
  const startDate = document.getElementById('startDate').value;

  const errorBox = document.getElementById('error');
  errorBox.textContent = '';

  if (isNaN(principal) || isNaN(interestRateInput) || isNaN(amortizationYears)) {
    errorBox.textContent = 'Please fill in all fields with valid numbers.';
    return;
  }

  let monthlyRate;
  if (compounding === "semi-annual") {
    const semiAnnualRate = Math.pow(1 + (interestRateInput / 100) / 2, 2) - 1;
    monthlyRate = Math.pow(1 + semiAnnualRate, 1 / 12) - 1;
  } else {
    monthlyRate = (interestRateInput / 100) / 12;
  }

  const totalPayments = amortizationYears * 12;
  const monthlyPayment = (principal * monthlyRate) / 
                         (1 - Math.pow(1 + monthlyRate, -totalPayments));

  const totalCost = monthlyPayment * totalPayments;
  const totalInterest = totalCost - principal;

  const format = val => val.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' });
  document.getElementById('monthlyPayment').value = format(monthlyPayment || 0);
  document.getElementById('totalInterest').value = format(totalInterest || 0);
  document.getElementById('totalCost').value = format(totalCost || 0);

  generateAmortizationTable(principal, interestRateInput, totalPayments, startDate, compounding, monthlyPayment);
}

// Function to generate amortization table
function generateAmortizationTable(principal, interestRate, payments, startDate, compounding, monthlyPayment) {
  const tableBody = document.getElementById('amortizationTableBody');
  tableBody.innerHTML = ""; // Clear existing table

  let balance = principal;
  let monthlyRate = (compounding === "semi-annual") 
    ? Math.pow(1 + (interestRate / 100) / 2, 2) ** (1 / 12) - 1 
    : (interestRate / 100) / 12;

  let totalInterest = 0;
  let currentDate = new Date(startDate);

  for (let i = 1; i <= payments; i++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = Math.min(balance, monthlyPayment - interestPayment);
    balance -= principalPayment;
    totalInterest += interestPayment;

    // Prevent negative balance
    if (balance < 0) balance = 0;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${i}</td>
      <td>${currentDate.toLocaleDateString()}</td>
      <td>${formatCurrency(principalPayment)}</td>
      <td>${formatCurrency(interestPayment)}</td>
      <td>${formatCurrency(balance)}</td>
    `;
    tableBody.appendChild(row);

    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  // Final total row
  const totalRow = document.createElement("tr");
  totalRow.innerHTML = `
    <td colspan="2"><strong>Total</strong></td>
    <td><strong>${formatCurrency(principal)}</strong></td>
    <td><strong>${formatCurrency(totalInterest)}</strong></td>
    <td><strong>-</strong></td>
  `;
  tableBody.appendChild(totalRow);
}

// Currency formatting function
function formatCurrency(val) {
  return val.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' });
}

// Attaching listeners for real-time calculation
document.addEventListener('DOMContentLoaded', () => {
  ['purchasePrice', 'downPaymentPercent', 'principal', 'interestRate', 'amortization'].forEach(id => {
    const el = document.getElementById(id);
    el.addEventListener('input', updateDownPaymentAndInsurance);
  });
  document.getElementById('compoundingToggle').addEventListener('change', calculateMortgage);
  document.getElementById('startDate').addEventListener('change', calculateMortgage);

  updateDownPaymentAndInsurance();
});
