document.addEventListener("DOMContentLoaded", () => {
    applyPermissions();
    refreshPackageTables();
    initPackageForm(); 
    initPackageDropdown();
    addPackageDropdownListener();
});

//Checks user role for user management tab
function applyPermissions() {
    const role = localStorage.getItem("role");
  
    if (role !== "admin") {
      // Find everything marked 'admin-only' and remove it from the DOM
      const adminElements = document.querySelectorAll(".admin-only");
      adminElements.forEach(el => el.remove());
    }
  }
//Deleting a class
document.getElementById("deleteBtn").addEventListener("click", async () =>{
    const form = document.getElementById("addPackageForm");

    var select = document.getElementById("packageIdSelect");
    var packageId = select.value.split(":")[0];

    const response = await fetch(
        `/api/package/deletePackage?packageId=${packageId}`, {
          method: "DELETE"
        });
    
      if (!response.ok) {
        throw new Error("Package delete failed");
      } else {
        alert(`Package with id ${packageId} successfully deleted`);
      }

      // Clean up
      form.reset();

      await refreshPackageTables();
      await initPackageDropdown();
      
});

/**
 * Helper to sort packages numerically by their ID (handling P001, S001, etc.)
 */
function sortPackagesById(packages) {
    if (!Array.isArray(packages)) return [];
    return packages.sort((a, b) => {
        const idA = String(a.packageId || "");
        const idB = String(b.packageId || "");
        return idA.localeCompare(idB, undefined, { numeric: true, sensitivity: "base" });
    });
}

/**
 * Renders a specific table based on the provided URL
 */
async function renderPackageTable(tbodyId, url) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch from ${url}. Status: ${response.status}`);
        }
        const data = await response.json();
        tbody.innerHTML = "";
        
        const sortedData = sortPackagesById(data);
        sortedData.forEach((pkg) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${pkg.packageId}</td>
                <td>${pkg.packageName}</td>
                <td>${pkg.description || ""}</td>
                <td>${pkg.price}</td>
            `;
            tbody.appendChild(row);
        });
    } catch (err) {
        console.error("Table Load Error:", err.message);
        tbody.innerHTML = `<tr><td colspan='4' style="color: red;">Error: ${err.message}</td></tr>`;
    }
}

async function refreshPackageTables() {
    await Promise.all([
        renderPackageTable("generalPackageTableBody", "/api/package/getGeneralPackages"),
        renderPackageTable("specialPackageTableBody", "/api/package/getSpecialPackages"),
    ]);
}

/**
 * Populates the dropdown menu for editing existing packages
 */
async function initPackageDropdown() {
    const select = document.getElementById("packageIdSelect");
    if (!select) return;
    try {
        const response = await fetch('/api/package/getPackageIds');
        if (!response.ok) throw new Error("Could not fetch package IDs");
        
        const packages = await response.json();
        const sortedPackages = sortPackagesById(packages);

        select.innerHTML = '<option value="">Select a Package to Edit...</option>';

        sortedPackages.forEach((pkg) => {
            const option = document.createElement("option");
            option.value = pkg.packageId;
            option.textContent = `${pkg.packageId}: ${pkg.packageName}`;
            select.appendChild(option);
        });
    }
    catch (err){
        console.error("Dropdown Error:", err);
    }
}

/**
 * Handles Create and Update logic
 */
function initPackageForm() {
    const form = document.getElementById("addPackageForm");
    if (!form) return;

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        // Detect if we are in "Update" mode via a hidden field or the dropdown selection
        const idField = document.getElementById("packageIdText") || form.packageIdText;
        const packageId = idField ? idField.value.trim() : "";
        
        const packageName = document.getElementById("addPackageName").value.trim();
        const description = document.getElementById("addPackageDescription").value.trim();
        const priceInput = document.getElementById("addPackagePrice").value;
        const price = priceInput === "" ? NaN : Number(priceInput);

        const typeRadios = Array.from(form.querySelectorAll('input[name="packageType"]'));
        const selectedTypeRadio = typeRadios.find((radio) => radio.checked);
        const packageType = selectedTypeRadio ? selectedTypeRadio.value : "";

        if (!packageName || Number.isNaN(price)) {
            alert("Please provide a valid Package Name and Price.");
            return;
        }

        try {
            let response;
            let endpoint;
            let payload;

            if (packageId) {
                // UPDATE
                endpoint = "/api/package/add";
                payload = { packageId, packageName, description, price };
            } else {
                // CREATE
                if (!packageType) {
                    alert("Please select whether this is a General or Special package.");
                    return;
                }
                endpoint = "/api/package/createPackage";
                payload = { packageType, packageName, description, price };
            }

            response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || result.error || "Server error occurred");
            }

            alert(packageId ? "Package successfully updated!" : "New package created!");
            
            // Clean up
            form.reset();
            if (idField) idField.value = "";
            const dropdown = document.getElementById("packageIdSelect");
            if (dropdown) dropdown.value = "";

            await refreshPackageTables();
            await initPackageDropdown(); 
        } catch (err) {
            console.error("Save Error:", err);
            alert("Failed to save: " + err.message);
        }
    });
}

/**
 * Listens to dropdown changes to fill the form for editing
 */
async function addPackageDropdownListener() {
    const form = document.getElementById("addPackageForm");
    const select = document.getElementById("packageIdSelect");
    
    if (!select || !form) return;

    select.addEventListener("change", async () => {
        const packageId = select.value;
        
        // Reset form if selection is cleared
        if (!packageId) {
            form.reset();
            const idField = document.getElementById("packageIdText") || form.packageIdText;
            if (idField) idField.value = "";
            return;
        }

        try {
            const res = await fetch(`/api/package/getPackage?packageId=${encodeURIComponent(packageId)}`);
            if (!res.ok) throw new Error("Could not retrieve package details");

            const data = await res.json();
            if (!data) return;

            // Fill IDs and Text
            const idField = document.getElementById("packageIdText") || form.packageIdText;
            if (idField) idField.value = data.packageId || "";
            
            document.getElementById("addPackageName").value = data.packageName || "";
            document.getElementById("addPackageDescription").value = data.description || "";
            document.getElementById("addPackagePrice").value = data.price || "";

            // Set radio button based on ID prefix
            const prefix = String(data.packageId).charAt(0).toUpperCase();
            let targetValue = "";
            if (prefix === "P") targetValue = "general";
            if (prefix === "S") targetValue = "special";

            if (targetValue) {
                const radio = form.querySelector(`input[name="packageType"][value="${targetValue}"]`);
                if (radio) radio.checked = true;
            }
        }
        catch (err) {
            console.error("Fetch Error:", err);
            alert("Error loading package details.");
        }
    });
}

function clearPackageForm() {
    document.getElementById("addPackageForm").reset();
    document.getElementById("packageIdText").value = "";
    initPackageDropdown();
}