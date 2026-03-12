//let formMode = "search";

document.addEventListener("DOMContentLoaded", () => {
    addGeneralPackageTableListener();
    addSpecialPackageTableListener();

    const addBtn = document.getElementById('addBtn');
    if (addBtn) {
        addBtn.addEventListener('click', openAddGeneralWin);
    }

    const addSpecialBtn = document.getElementById('addSpecialBtn');
    if (addSpecialBtn) {
        addSpecialBtn.addEventListener('click', openAddGeneralWin);
    }
});

//Opens a new window to add a new genal package
function openAddGeneralWin(ev) {
    let win = window.open('addPackage.html', null, 'popup,width=400,height=400,left=300,top=500');
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
        generalPackageData.innerHTML = "";

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
        specialPackageData.innerHTML = "";

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

