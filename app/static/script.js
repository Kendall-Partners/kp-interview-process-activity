let myChart = null;
let currentPayload = null;
let viewMode = 'monthly'; // 'daily' or 'monthly'

async function loadRecords() {
    const statusEl = document.getElementById("status");
    statusEl.textContent = "Loading...";

    try {
        const res = await fetch("/api/records", { method: "GET" });
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }

        currentPayload = await res.json();
        updateChart();
        statusEl.textContent = "Idle";

    } catch (err) {
        statusEl.textContent = "Error";
        console.error(err);
    }
}

function updateChart() {
    if (!currentPayload) return;

    // --- 1. Flatten into a list of simplified events ---
    let allEvents = [];

    // Standardize each record into cash in and cash out events
    currentPayload.forEach(record => {
        // Purchase Event -- Cash OUT
        if (record.Closed_Purchase_Date__c) {
            allEvents.push({
                date: record.Closed_Purchase_Date__c, // YYYY-MM-DD
                type: 'purchase',
                amount: -1 * Math.abs(record.Closed_Purchase_Price__c || 0)
            });
        }

        // Rehab Event -- Cash OUT
        if (record.List_Date__c) {
            allEvents.push({
                date: record.List_Date__c,
                type: 'rehab',
                amount: -1 * Math.abs(record.Rehab_Expense_Total__c || 0)
            });
        }

        // Sale Event -- Cash IN
        if (record.Closed_Sale_Date__c) {
            allEvents.push({
                date: record.Closed_Sale_Date__c,
                type: 'sale',
                amount: Math.abs(record.Closed_Sale_Price__c || 0)
            });
        }
    });

    // --- 2. Create Map for Aggregation based on View Mode ---
    // key: date string (YYYY-MM-DD or YYYY-MM), value: { cashIn, cashOut, netFlow, dateObj }
    const groupedMap = new Map();

    // Group events by date
    allEvents.forEach(e => {
        let key;
        const dateObj = new Date(e.date);

        // Skip invalid dates
        if (isNaN(dateObj.getTime())) return;

        // Determine the key based on view mode
        if (viewMode === 'daily') {
            // Use full date string YYYY-MM-DD
            key = e.date;
        } else {
            // Monthly: YYYY-MM
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            key = `${dateObj.getFullYear()}-${month}`;
        }

        // Initialize if not exists
        if (!groupedMap.has(key)) {
            groupedMap.set(key, { cashIn: 0, cashOut: 0, netFlow: 0, sortDate: dateObj });
        }

        // Add to the appropriate bucket
        const data = groupedMap.get(key);
        if (e.amount > 0) {
            data.cashIn += e.amount;
        } else {
            data.cashOut += e.amount;
        }
        data.netFlow += e.amount;
    });

    // Sort the keys
    const sortedKeys = Array.from(groupedMap.keys()).sort((a, b) => {
        return groupedMap.get(a).sortDate - groupedMap.get(b).sortDate;
    });

    // Prepare data for chart
    const labels = [];
    const cashIn = [];
    const cashOut = [];
    const netFlow = [];
    const cumulativeFlow = [];
    let runningTotal = 0;

    sortedKeys.forEach(key => {
        const d = groupedMap.get(key);

        // Format Label
        if (viewMode === 'daily') {
            labels.push(key);
        } else {
            // Format as "Month YYYY" for monthly
            labels.push(d.sortDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
        }

        // Push data to arrays
        cashIn.push(d.cashIn);
        cashOut.push(d.cashOut);
        netFlow.push(d.netFlow);

        // Calculate cumulative flow
        runningTotal += d.netFlow;
        cumulativeFlow.push(runningTotal);
    });

    // Render chart
    renderFinancialChart(labels, cashIn, cashOut, netFlow, cumulativeFlow);
}


function renderFinancialChart(labels, cashInData, cashOutData, netFlowData, cumulativeFlowData) {
    const ctx = document.getElementById("cashflowChart").getContext('2d');

    // Destroy previous chart if it exists
    if (myChart) {
        myChart.destroy();
    }

    // Chart formatting fun, ft. Chart.js
    myChart = new Chart(ctx, {
        data: {
            labels: labels,
            datasets: [
                // Cash In
                {
                    type: 'bar',
                    label: 'Cash In',
                    data: cashInData,
                    backgroundColor: 'rgba(75, 192, 192, 0.7)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    order: 2,
                    stack: 'flow',
                    animation: {
                        duration: 150,
                        easing: 'easeOutQuint'
                    }
                },
                // Cash Out
                {
                    type: 'bar',
                    label: 'Cash Out',
                    data: cashOutData,
                    backgroundColor: 'rgba(255, 99, 132, 0.7)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1,
                    order: 2,
                    stack: 'flow',
                    animation: {
                        duration: 150,
                        easing: 'easeOutQuint'
                    }
                },
                // Net Cash Flow
                {
                    type: 'line',
                    label: 'Net Cash Flow',
                    data: netFlowData,
                    borderColor: '#333',
                    backgroundColor: '#333',
                    borderWidth: 2,
                    pointRadius: 3,
                    hidden: viewMode === 'daily',
                    animation: {
                        duration: 250,
                        easing: 'easeOutQuint'
                    }
                },
                // Cumulative Flow
                {
                    type: 'line',
                    label: 'Cumulative Income',
                    data: cumulativeFlowData,
                    borderColor: '#8e44ad',
                    backgroundColor: '#8e44ad',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    tension: 0.1,
                    order: 0,
                    pointRadius: 0,
                    animation: {
                        duration: 250,
                        easing: 'easeOutQuint'
                    }
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Amount ($)', font: { weight: 'bold' } },
                    ticks: {
                        font: {
                            weight: 'bold'
                        },
                        callback: function (value) {
                            return '$' + value / 1000000 + 'M';
                        }
                    },
                    grid: {
                        lineWidth: 1.5,
                        color: 'rgba(0, 0, 0, 0.15)'
                    }
                },
                x: {
                    ticks: {
                        autoSkip: true,
                        autoSkipPadding: 20,
                        maxRotation: 30,
                        minRotation: 30,
                        font: {
                            weight: 'bold'
                        }
                    },
                    grid: {
                        lineWidth: 1.5,
                        color: 'rgba(0, 0, 0, 0.15)'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            let label = context.dataset.label || '';
                            if (label) label += ': ';
                            label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.raw);
                            return label;
                        }
                    }
                }
            }
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("reload").addEventListener("click", loadRecords);

    // Toggle monthly / daily view
    document.getElementById("toggleGrouping").addEventListener("click", (e) => {
        viewMode = viewMode === 'daily' ? 'monthly' : 'daily';
        e.target.textContent = viewMode === 'daily' ? 'Switch to Monthly' : 'Switch to Daily';

        // Reset dataset toggle buttons
        document.querySelectorAll(".toggle-btn").forEach(btn => btn.classList.remove("hidden"));

        // Net cash flow isn't very useful on daily view, so it's hidden by default
        if (viewMode === 'daily') {
            document.querySelectorAll(".toggle-btn")[3].classList.add("hidden");
        }
        updateChart();
    });

    // Toggle buttons
    // These are redundant, as you can toggle datasets in the legend, but they're here for convenience
    document.querySelectorAll(".toggle-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const index = parseInt(btn.dataset.dataset);
            if (myChart) {
                const isVisible = myChart.isDatasetVisible(index);
                if (isVisible) {
                    myChart.hide(index);
                    btn.classList.add("hidden");
                } else {
                    myChart.show(index);
                    btn.classList.remove("hidden");
                }
            }
        });
    });

    // Load records on initial page load
    loadRecords();
});

