let formMode = "search";

// Load page
document.addEventListener("DOMContentLoaded", () => {
  setFormForSearch();
  initCustomerDropdown();
  addCustomerDropdownListener();

  document.getElementById("clearBtn").addEventListener("click", clearCustomerForm);
  document.getElementById("exitBtn").addEventListener("click", () => {
    window.location.href = "dashboard.html";
  });

  document.getElementById("logoutBtn").addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "../index.html";
  });
});

// SEARCH
document.getElementById("searchBtn").addEventListener("click", async () => {
  clearCustomerForm();
  setFormForSearch();
  await initCustomerDropdown();
});

// ADD
document.getElementById("addBtn").addEventListener("click", async () => {
  setFormForAdd();
});

// SAVE
document.getElementById("saveBtn").addEventListener("click", async () => {
  if (formMode !== "add") return;

  const form = document.getElementById("customerForm");

  const firstname = form.firstname.value.trim();
  const lastname = form.lastname.value.trim();
  const address = form.address.value.trim();
  const phone = form.phone.value.trim();
  const email = form.email.value.trim();
  const classBalance = 0;

  let preferredContact = "";
  if (form.pref[0].checked) {
    preferredContact = "phone";
  } else if (form.pref[1].checked) {
    preferredContact = "email";
  }

  // validation
  if (!firstname || !lastname || !address || !phone || !email || !preferredContact) {
    alert("Please fill in all required fields.");
    return;
  }

  try {
    // check if customer already exists by name
    const duplicateRes = await fetch(
      `/api/customer/checkCustomerName?firstname=${encodeURIComponent(firstname)}&lastname=${encodeURIComponent(lastname)}`
    );
    const duplicateData = await duplicateRes.json();

    if (duplicateData.exists) {
      const confirmDuplicate = confirm(
        "A customer with the same name already exists. Do you want to continue anyway?"
      );
      if (!confirmDuplicate) {
        return;
      }
    }

    // get next customer id
    const idRes = await fetch("/api/customer/getNextId");
    const { nextId } = await idRes.json();

    document.getElementById("customerIdText").value = nextId;

    const customerData = {
      customerId: nextId,
      firstname,
      lastname,
      address,
      phone,
      email,
      preferredContact,
      classBalance
    };

    const saveRes = await fetch("/api/customer/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(customerData)
    });

    const result = await saveRes.json();

    if (!saveRes.ok) {
      throw new Error(result.message || "Failed to add customer");
    }

    alert(
      `✅ Customer ${customerData.customerId} added successfully!\n\nWelcome to Yoga'Hom! Your customer id is ${customerData.customerId}.`
    );

    form.reset();
    form.classBalance.value = 0;
    setFormForSearch();
    clearCustomerForm();
    initCustomerDropdown();

  } catch (err) {
    alert("❌ Error: " + err.message);
  }
});

// DELETE
document.getElementById("deleteBtn").addEventListener("click", async () => {
  const select = document.getElementById("customerIdSelect");
  const customerId = select.value.split(":")[0];

  if (!customerId) {
    alert("Please select a customer to delete.");
    return;
  }

  try {
    const response = await fetch(
      `/api/customer/deleteCustomer?customerId=${customerId}`,
      { method: "DELETE" }
    );

    if (!response.ok) {
      throw new Error("Customer delete failed");
    }

    alert(`Customer with id ${customerId} successfully deleted`);
    clearCustomerForm();
    initCustomerDropdown();

  } catch (err) {
    alert("❌ Error: " + err.message);
  }
});

// Load dropdown
async function initCustomerDropdown() {
  const select = document.getElementById("customerIdSelect");
  select.innerHTML = `<option value="">-- Select Customer ID --</option>`;

  try {
    const response = await fetch("/api/customer/getCustomerIds");
    const customerIds = await response.json();

    customerIds.forEach((cust) => {
      const option = document.createElement("option");
      option.value = cust.customerId;
      option.textContent = `${cust.customerId}:${cust.firstname} ${cust.lastname}`;
      select.appendChild(option);
    });
  } catch (err) {
    console.error("Failed to load customer IDs:", err);
  }
}

// Dropdown listener
function addCustomerDropdownListener() {
  const form = document.getElementById("customerForm");
  const select = document.getElementById("customerIdSelect");

  select.addEventListener("change", async () => {
    const customerId = select.value.split(":")[0];

    if (!customerId) return;

    try {
      const res = await fetch(
        `/api/customer/getCustomer?customerId=${customerId}`
      );

      if (!res.ok) throw new Error("Customer search failed");

      const data = await res.json();

      if (!data || Object.keys(data).length === 0) {
        alert("No customer found");
        return;
      }

      form.firstname.value = data.firstname || "";
      form.lastname.value = data.lastname || "";
      form.address.value = data.address || "";
      form.phone.value = data.phone || "";
      form.email.value = data.email || "";
      form.classBalance.value = data.classBalance ?? 0;

      if (data.preferredContact === "phone") {
        form.pref[0].checked = true;
      } else if (data.preferredContact === "email") {
        form.pref[1].checked = true;
      }

    } catch (err) {
      alert(`Error searching customer: ${customerId} - ${err.message}`);
    }
  });
}

function clearCustomerForm() {
  document.getElementById("customerForm").reset();
  document.getElementById("customerIdSelect").innerHTML =
    `<option value="">-- Select Customer ID --</option>`;
  document.getElementById("customerIdText").value = "";
  document.getElementById("customerForm").classBalance.value = 0;
}

function setFormForSearch() {
  formMode = "search";

  document.getElementById("customerIdLabel").style.display = "block";
  document.getElementById("customerIdTextLabel").style.display = "none";
  document.getElementById("customerIdText").style.display = "none";
  document.getElementById("customerIdText").value = "";
  document.getElementById("customerForm").reset();
  document.getElementById("customerForm").classBalance.value = 0;
}

function setFormForAdd() {
  formMode = "add";

  document.getElementById("customerIdLabel").style.display = "none";
  document.getElementById("customerIdTextLabel").style.display = "block";
  document.getElementById("customerIdText").style.display = "block";
  document.getElementById("customerIdText").value = "";
  document.getElementById("customerForm").reset();
  document.getElementById("customerForm").classBalance.value = 0;
}
