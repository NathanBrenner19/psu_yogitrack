
document.addEventListener("DOMContentLoaded", () => {
    initPackageDropdown();
    addPackageDropdownListener();
  });

  //Saves the new data to the DB from package form
document.getElementById("packageForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = document.getElementById("packageForm");
    const packageIdSelect = document.getElementById("packageIdSelect");

    //Trims the data from the form to find Json
    const packageData = {
        packageId: packageIdSelect.value,
        packageName: form.packageName.value.trim(),
        description: form.description.value.trim(),
        price: form.price.value.trim(),
    };
    //Calls the route and controller
    try{
        const res = await fetch("/api/package/add", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(packageData),
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.message || "Failed to edit package");

        // If opened as a popup, refresh parent and close.
        if (window.opener && !window.opener.closed) {
            window.opener.location.reload();
            window.close();
            return;
        }

        // Fallback when not opened as a popup.
        window.location.reload();
    }
    catch(err){
        alert("Error: " + err.message);
    }
});


//Add packages to dropdown menu
async function initPackageDropdown() {
    const select = document.getElementById("packageIdSelect");
    if (!select) return;
    try {
      const response = await fetch("/api/package/getPackageIds");
      if (!response.ok) throw new Error(response.statusText);
      const packages = await response.json();
      packages.forEach((pkg) => {
        const option = document.createElement("option");
        option.value = pkg.packageId;
        option.textContent = `${pkg.packageId}: ${pkg.packageName}`;
        select.appendChild(option);
      });
    } catch (err) {
      console.error("Failed to load package IDs:", err);
    }
}

//Add a select listener to get the package ID from selected package in dropdown
async function addPackageDropdownListener() {
    const form = document.getElementById("packageForm");
    const select = document.getElementById("packageIdSelect");
    select.addEventListener("change", async () => {
        var packageId = select.value.split(":")[0];
        
        try{
            const res = await fetch(
                `/api/package/getPackage?packageId=${packageId}`
            );
            if (!res.ok) throw new Error("Package search failed");

            const data = await res.json();
            if(!data || Object.keys(data).length === 0) {
                alert("No package found");
                return;
            }

            //Fill the form with package data
            form.packageName.value = data.packageName;
            form.description.value = data.description;
            form.price.value = data.price;
        }
        catch(err){
            alert(`Error searching package: ${packageId} - ${err.message}`);
        }
    });
}