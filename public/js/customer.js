document.addEventListener("DOMContentLoaded", () => {
  applyPermissions();
  initCustomerDropdown();
  addCustomerDropdownListener();
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

// SAVE
// 1. Attach the listener to the FORM, not the button
const customerForm = document.getElementById("customerForm");

customerForm.addEventListener("submit", async (event) => {
  // 2. Prevent the page from refreshing
  event.preventDefault();

  const form = event.target;

  // 3. Match the casing to what your controller expects (firstName, not firstname)
  const customerId = document.getElementById("customerIdText")?.value.trim() || "";
  const firstName = form.firstName.value.trim();
  const lastName = form.lastName.value.trim();
  const address = form.address.value.trim();
  const phone = form.phone.value.trim();
  const email = form.email.value.trim();
  const classBalance = form.classBalance.value || 0;

  let preferredContact = "";
  if (form.pref.value === "phone") {
    preferredContact = "phone";
  } else {
    preferredContact = "email";
  }

  try {
    if (!customerId) {
      const duplicateRes = await fetch(
        `/api/customer/checkCustomerName?firstname=${encodeURIComponent(firstName)}&lastname=${encodeURIComponent(lastName)}`
      );
      const duplicateData = await duplicateRes.json();

      if (duplicateData.exists) {
        if (!confirm("A customer with the same name already exists. Continue anyway?")) {
          return;
        }
      }
    }

    const customerData = {
      customerId,
      firstName, // Corrected casing
      lastName,  // Corrected casing
      address,
      phone,
      email,
      preferredContact,
      classBalance
    };

    const saveRes = await fetch("/api/customer/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(customerData)
    });

    const result = await saveRes.json();

    if (!saveRes.ok) {
      throw new Error(result.message || "Failed to save customer");
    }

    alert(result.message || "Customer profile saved successfully!");
    
    // Resetting form safely
    form.reset();
    if (typeof clearCustomerForm === "function") clearCustomerForm();
    if (typeof initCustomerDropdown === "function") initCustomerDropdown();

  } catch (err) {
    alert("Error: " + err.message);
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
    alert("Error: " + err.message);
  }
});

// Load dropdown
async function initCustomerDropdown() {
  const select = document.getElementById("customerIdSelect");
  if (!select) return;
  try {
    const response = await fetch("/api/customer/getCustomerIds");
    const customerIds = await response.json();

    customerIds.forEach((cust) => {
      const option = document.createElement("option");
      option.value = cust.customerId;
      option.textContent = `${cust.customerId}:${cust.firstName} ${cust.lastName}`;
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

      form.customerIdText.value = data.customerId || "";
      form.firstName.value = data.firstName ?? data.firstname ?? "";
      form.lastName.value = data.lastName ?? data.lastname ?? "";
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
  document.getElementById("customerIdText").value = "";
}
