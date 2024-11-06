document.addEventListener("DOMContentLoaded", () => {
    loadStoredData();
    document.getElementById("toggleData").addEventListener("click", toggleDataDisplay);
  });
  
  const form = document.getElementById("dataForm");
  const dataList = document.getElementById("dataList");
  const generateReportButton = document.getElementById("generateReport");
  
  let currentPage = 1;
  const itemsPerPage = 10;
  let isEditing = false;
  let editIndex = -1;
  
  form.addEventListener("submit", (event) => {
    event.preventDefault();
  
    const data = {
      projectEntered: document.getElementById("projectEntered").value,
      projectName: document.getElementById("projectName").value,
      ar: document.getElementById("ar").value,
      arOwner: document.getElementById("arOwner").value,
      arDetail: document.getElementById("arDetail").value,
      completionDate: document.getElementById("completionDate").value,
      comments: document.getElementById("comments").value,
      priority: document.getElementById("priority").value,
      dateEntered: new Date().toISOString().split('T')[0]
    };
  
    if (isEditing) {
      updateData(editIndex, data);
    } else {
      saveData(data);
    }
    form.reset();
    isEditing = false;
    editIndex = -1;
  });
  
  generateReportButton.addEventListener("click", generateReport);
  
  function saveData(data) {
    let dataArray = JSON.parse(localStorage.getItem("projectData")) || [];
    dataArray.push(data);
    localStorage.setItem("projectData", JSON.stringify(dataArray));
    loadStoredData();
  }
  
  function loadStoredData() {
    const storedData = JSON.parse(localStorage.getItem("projectData")) || [];
    // Sort data by date in descending order (most recent first)
    storedData.sort((a, b) => new Date(b.dateEntered) - new Date(a.dateEntered));
    displayPage(currentPage, storedData);
    updatePagination(storedData);
  }
  
  function displayPage(page, data) {
    dataList.innerHTML = "";
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    data.slice(start, end).forEach((data, index) => displayData(data, start + index));
  }
  
  function displayData(data, index) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${data.projectEntered}</td>
      <td>${data.projectName}</td>
      <td>${data.ar}</td>
      <td>${data.arOwner}</td>
      <td>${data.arDetail}</td>
      <td>${data.completionDate}</td>
      <td>${data.comments}</td>
      <td>${data.priority}</td>
      <td>
        <button class="action-btn" onclick="editData(${index})">✏️</button>
        <button class="action-btn" onclick="deleteData(${index})">🗑️</button>
      </td>
    `;
    dataList.appendChild(row);
  }
  
  function editData(index) {
    let dataArray = JSON.parse(localStorage.getItem("projectData")) || [];
    const data = dataArray[index];
  
    document.getElementById("projectEntered").value = data.projectEntered;
    document.getElementById("projectName").value = data.projectName;
    document.getElementById("ar").value = data.ar;
    document.getElementById("arOwner").value = data.arOwner;
    document.getElementById("arDetail").value = data.arDetail;
    document.getElementById("completionDate").value = data.completionDate;
    document.getElementById("comments").value = data.comments;
    document.getElementById("priority").value = data.priority;
  
    isEditing = true;
    editIndex = index;
  }
  
  function updateData(index, updatedData) {
    let dataArray = JSON.parse(localStorage.getItem("projectData")) || [];
    dataArray[index] = updatedData;
    localStorage.setItem("projectData", JSON.stringify(dataArray));
    loadStoredData();
  }
  
  function deleteData(index) {
    let dataArray = JSON.parse(localStorage.getItem("projectData")) || [];
    dataArray.splice(index, 1);
    localStorage.setItem("projectData", JSON.stringify(dataArray));
    loadStoredData();
  }
  
  function generateReport() {
    const storedData = JSON.parse(localStorage.getItem("projectData")) || [];
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'pt', 'a4'); // 'pt' for points, A4 size for better space utilization
  
    doc.setFontSize(14);
    doc.text("Project Data Report", 40, 30);
  
    // Prepare the data for the table
    const tableData = storedData.map(data => [
      data.projectEntered,
      data.projectName,
      data.ar,
      data.arOwner,
      data.arDetail,
      data.completionDate,
      data.comments,
      data.priority
    ]);
  
    // Define table columns
    const columns = [
      { header: "Project Entered", dataKey: "projectEntered" },
      { header: "Project Name", dataKey: "projectName" },
      { header: "AR", dataKey: "ar" },
      { header: "AR Owner", dataKey: "arOwner" },
      { header: "AR Detail", dataKey: "arDetail" },
      { header: "Estimated Completion Date", dataKey: "completionDate" },
      { header: "Comments", dataKey: "comments" },
      { header: "Priority", dataKey: "priority" }
    ];
  
    // Generate the table with autoTable
    doc.autoTable({
      head: [columns.map(col => col.header)],
      body: tableData,
      startY: 40,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255, halign: 'center' },
      styles: {
        fontSize: 8,           // Reduced font size for better fit
        cellPadding: 4,        // Reduced padding
        overflow: 'linebreak', // Ensure content wraps within cells
        valign: 'middle'
      },
      columnStyles: {
        0: { cellWidth: 60 },  // Project Entered
        1: { cellWidth: 60 },  // Project Name
        2: { cellWidth: 40 },  // AR
        3: { cellWidth: 60 },  // AR Owner
        4: { cellWidth: 80 },  // AR Detail
        5: { cellWidth: 60 },  // Estimated Completion Date
        6: { cellWidth: 80 },  // Comments
        7: { cellWidth: 20 }   // Priority
      },
      margin: { top: 40, bottom: 40 }, // Set margins to ensure no cutoff
      pageBreak: 'auto',               // Ensure rows continue on the next page if needed
      didDrawPage: function (data) {
        // Add footer with page number
        doc.setFontSize(10);
        doc.text("Page " + doc.internal.getCurrentPageInfo().pageNumber, data.settings.margin.left, doc.internal.pageSize.height - 10);
      }
    });
  
    // Save the PDF
    doc.save("Project_Data_Report.pdf");
  }
  
  
  
  function toggleDataDisplay() {
    const dataSection = document.querySelector(".stored-data-section");
    const toggleButton = document.getElementById("toggleData");
    dataSection.classList.toggle("collapsed");
    toggleButton.textContent = dataSection.classList.contains("collapsed") ? "Expand" : "Collapse";
  }
  
  function updatePagination(dataArray) {
    const totalPages = Math.ceil(dataArray.length / itemsPerPage);
    document.getElementById("pageInfo").textContent = `Page ${currentPage} of ${totalPages}`;
    document.getElementById("prevPage").disabled = currentPage === 1;
    document.getElementById("nextPage").disabled = currentPage === totalPages;
  
    document.getElementById("prevPage").onclick = () => {
      if (currentPage > 1) {
        currentPage--;
        displayPage(currentPage, dataArray);
      }
    };
  
    document.getElementById("nextPage").onclick = () => {
      if (currentPage < totalPages) {
        currentPage++;
        displayPage(currentPage, dataArray);
      }
    };
  }
  
