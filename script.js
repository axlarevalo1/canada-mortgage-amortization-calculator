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

  // Trigger mortgage calculation immediately
  calculateMortgage();
}

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

  generateAmortizationTable(principal, interestRateInput, totalPayments, startDate, compounding);
}

function attachListeners() {
  const inputs = ['purchasePrice', 'downPaymentPercent', 'principal', 'interestRate', 'amortization'];
  inputs.forEach(id => {
    const el = document.getElementById(id);
    el.addEventListener('input', () => {
      if (id === 'purchasePrice' || id === 'downPaymentPercent') {
        updateDownPaymentAndInsurance();
      } else {
        calculateMortgage();
      }
    });
  });

  document.getElementById('compoundingToggle').addEventListener('change', calculateMortgage);
  document.getElementById('startDate').addEventListener('change', calculateMortgage);
}

document.addEventListener('DOMContentLoaded', () => {
  attachListeners();
  updateDownPaymentAndInsurance();
});
