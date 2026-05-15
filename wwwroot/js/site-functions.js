/**
 * Generic search function for HTML tables
 * @param {string} inputId - ID of the search input field
 * @param {string} tableBodyId - ID of the tbody to filter
 * @param {number} columnIdx - Index of the column to search (0-based)
 */
function filterTable(inputId, tableBodyId, columnIdx) {
    const input = document.getElementById(inputId);
    const filter = input.value.toLowerCase();
    const tbody = document.getElementById(tableBodyId);
    const rows = tbody.getElementsByTagName("tr");

    for (let i = 0; i < rows.length; i++) {
        const cell = rows[i].getElementsByTagName("td")[columnIdx];
        if (cell) {
            const textValue = cell.textContent || cell.innerText;
            rows[i].style.display = textValue.toLowerCase().indexOf(filter) > -1 ? "" : "none";
        }
    }
}