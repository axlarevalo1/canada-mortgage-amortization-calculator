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
            insuranceRate = 0.04;
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

        return { downPayment, insurance };
      }

      dpField.value = '';
      insuranceField.value = '';
      return { downPayment: 0, insurance: 0 };
    }

    

function generateAmortizationTable(principal, rate, periods, startDate) {
  let tableHTML = "<h2 style='margin-top:40px;'>Amortization Schedule</h2>";
  tableHTML += "<table border='1' cellpadding='5' cellspacing='0' style='border-collapse: collapse; width: 100%; text-align: right;'>";
  tableHTML += "<tr><th style='text-align:left;'>Month</th><th>Principal</th><th>Interest</th><th>Payment</th><th>Balance</th><th style='text-align:left;'>Date</th></tr>";

  const formatter = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' });
  let balance = principal;
  let totalInterest = 0;
  let totalPrincipal = 0;

  const monthlyPayment = principal * rate * Math.pow(1 + rate, periods) / (Math.pow(1 + rate, periods) - 1);
  const start = new Date(startDate);

  for (let i = 1; i <= periods; i++) {
    if ((i - 1) % 12 === 0) {
      tableHTML += "<tr><td colspan='6' style='text-align:left; font-weight:bold; background:#f9f9f9;'>Year " + (Math.floor((i - 1) / 12) + 1) + "</td></tr>";
    }

    const interest = balance * rate;
    const principalPaid = monthlyPayment - interest;
    balance -= principalPaid;
    totalInterest += interest;
    totalPrincipal += principalPaid;

    const payDate = new Date(start);
    payDate.setMonth(start.getMonth() + i - 1);
    const formattedDate = payDate.toISOString().split("T")[0];

    tableHTML += "<tr><td style='text-align:left;'>" + i + "</td>" +
      "<td>" + formatter.format(principalPaid) + "</td>" +
      "<td>" + formatter.format(interest) + "</td>" +
      "<td>" + formatter.format(monthlyPayment) + "</td>" +
      "<td>" + formatter.format(Math.max(balance, 0)) + "</td>" +
      "<td style='text-align:left;'>" + formattedDate + "</td></tr>";
  }

  tableHTML += "<tfoot><tr style='font-weight:bold; background:#f0f0f0;'><td colspan='2'>Totals</td>" +
    "<td>" + formatter.format(totalInterest) + "</td>" +
    "<td>" + formatter.format(totalPrincipal + totalInterest) + "</td>" +
    "<td>" + formatter.format(totalPrincipal) + "</td><td></td></tr></tfoot>";

  tableHTML += "</table>";
  document.getElementById("amortizationTable").innerHTML = tableHTML;
}


function calculateMortgage() {

      const purchasePrice = parseFloat(document.getElementById('purchasePrice').value);
      const interestRate = parseFloat(document.getElementById('interestRate').value) / 100 / 12;
      const amortizationYears = parseInt(document.getElementById('amortization').value);
      const payments = amortizationYears * 12;

      const formatter = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' });
      const { downPayment, insurance } = updateDownPaymentAndInsurance();

      if (!purchasePrice || !interestRate) return;

      const loan = purchasePrice - downPayment + insurance;
      const monthly = loan * interestRate * Math.pow(1 + interestRate, payments) / (Math.pow(1 + interestRate, payments) - 1);

      document.getElementById('loanAmount').textContent = formatter.format(loan);
      
  document.getElementById('monthlyPayment').textContent = formatter.format(monthly);
  generateAmortizationTable(loan, interestRate, payments, document.getElementById('startDate').value);

    }

    function attachListeners() {
      ['purchasePrice', 'downPaymentPercent', 'interestRate', 'amortization'].forEach(id => {
        const el = document.getElementById(id);
        el.addEventListener('input', () => {
          updateDownPaymentAndInsurance();
          calculateMortgage();
        });
        el.addEventListener('change', () => {
          updateDownPaymentAndInsurance();
          calculateMortgage();
        });
      });
    }

    document.addEventListener('DOMContentLoaded', () => {
      updateDownPaymentAndInsurance();
      calculateMortgage();
      attachListeners();
    });

function sendHeightToParent() {
  const height = document.body.scrollHeight;
  parent.postMessage({ type: 'resize', height: height }, '*');
}

// Call once on load and again when resizing
window.addEventListener('load', sendHeightToParent);
window.addEventListener('resize', sendHeightToParent);
