async function loadRecords() {
    const statusEl = document.getElementById("status");
    const outputEl = document.getElementById("output");

    statusEl.textContent = "Loading...";
    outputEl.textContent = "";

    try {
        const res = await fetch("/api/records", { method: "GET" });
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }

        const payload = await res.json();

        // Dump JSON to the app
        outputEl.textContent = JSON.stringify(payload, null, 2);
        statusEl.textContent = "Loaded";
    } catch (err) {
        statusEl.textContent = "Error";
        outputEl.textContent = `Failed to load /api/records\n\n${err}`;
        console.error(err);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("reload").addEventListener("click", loadRecords);
    loadRecords();
});

