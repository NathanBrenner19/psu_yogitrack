// Fetch all package IDs and populate the dropdown
document.addEventListener("DOMContentLoaded", () => {
  initPackageDropdown();
});

document.getElementById("deleteBtn").addEventListener("click", async () => {
    const select = document.getElementById("packageIdSelect");
    const packageId = select.value.trim();
    if (!packageId) {
        alert("Please select a package to delete.");
        return;
    }
    try {
        const response = await fetch(`/api/package/deletePackage?packageId=${encodeURIComponent(packageId)}`, {
            method: "DELETE"
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            alert(data.error || "Package delete failed");
            return;
        }
        alert(`Package with id ${packageId} successfully deleted`);
        select.remove(select.selectedIndex);
        if (window.opener && !window.opener.closed) {
            window.opener.location.reload();
        }
    } catch (err) {
        console.error(err);
        alert("Package delete failed");
    }
    window.close();
});

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