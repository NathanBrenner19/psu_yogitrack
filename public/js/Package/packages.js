//let formMode = "search";

document.addEventListener("DOMContentLoaded", () => {
    addGeneralPackageTableListener();
    addSpecialPackageTableListener();

    const addBtn = document.getElementById('addBtn');
    if (addBtn) {
        addBtn.addEventListener('click', (ev) => openAddPackageWin(ev, 'general'));
    }

    const deleteBtn = document.getElementById('deleteBtn');
    if (deleteBtn){
        deleteBtn.addEventListener('click', (ev) => openDeletePackageWin(ev));
    }

    const editBtn = document.getElementById('editBtn');
    if (editBtn){
        editBtn.addEventListener('click', (ev) => openEditPackageWin(ev));
    }
});

function openEditPackageWin(ev){
    let win = window.open('editPackage.html', null, 'popup,width=600,height=600,left=600,top=200');
}

function openDeletePackageWin(ev){
    let win = window.open('deletePackage.html', null, 'popup,width=600,height=300,left=600,top=300');
}
// Opens a new window to add a new package
function openAddPackageWin(ev, type) {
    const url = type ? `addPackage.html?type=${encodeURIComponent(type)}` : 'addPackage.html';
    let win = window.open(url, null, 'popup,width=600,height=600,left=600,top=200');
}

//Sorting the packages by package ID numbers
function sortPackagesById(packages) {
    return packages.sort((a, b) =>
        String(a.packageId).localeCompare(String(b.packageId), undefined, { numeric: true, sensitivity: "base" })
    );
}

//Get general packages and add them to html table
async function addGeneralPackageTableListener() {
    //Getting general package table body
    const generalPackageTableBody = document.getElementById("generalPackageTableBody");
    try{
        //Getting all packages from the database
        const response = await fetch("/api/package/getGeneralPackages");
        if (!response.ok) {
            throw new Error ("Failed to get packages! Status:" + response.status);
        }
        const generalPackageData = await response.json();

        //Clear existing rows in package table
        generalPackageTableBody.innerHTML = "";

        sortPackagesById(generalPackageData);

        //Populate the table with package data
        generalPackageData.forEach(pkg => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${pkg.packageId}</td>
                <td>${pkg.packageName}</td>
                <td>${pkg.description}</td>
                <td>${pkg.price}</td>
            `;
            generalPackageTableBody.appendChild(row);
        });

    }
    catch (err) {
        console.error("Could not load package data:", err.message);
        generalPackageTableBody.innerHTML = "<tr><td colspan='4'>Error loading package data</td></tr>";
    }
}

//Get special packages and add them to html table
async function addSpecialPackageTableListener() {
    //Getting general package table body
    const specialPackageTableBody = document.getElementById("specialPackageTableBody");
    try{
        //Getting all packages from the database
        const response = await fetch("/api/package/getSpecialPackages");
        if (!response.ok) {
            throw new Error ("Failed to get packages! Status:" + response.status);
        }
        const specialPackageData = await response.json();

        //Clear existing rows in package table
        specialPackageTableBody.innerHTML = "";

        sortPackagesById(specialPackageData);

        //Populate the table with package data
        specialPackageData.forEach(pkg => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${pkg.packageId}</td>
                <td>${pkg.packageName}</td>
                <td>${pkg.description}</td>
                <td>${pkg.price}</td>
            `;
            specialPackageTableBody.appendChild(row);
        });

    }
    catch (err) {
        console.error("Could not load package data:", err.message);
        specialPackageTableBody.innerHTML = "<tr><td colspan='4'>Error loading package data</td></tr>";
    }
}

