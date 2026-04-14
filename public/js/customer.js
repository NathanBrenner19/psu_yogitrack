document.addEventListener("DOMContentLoaded", () => {
  initCustomerDropdown();
  addCustomerDropdownListener();
});

//Checks user role for user management tab
const role = localStorage.getItem("role");
    const userManagementLink = document.getElementById("userManagementLink");

    if (role === "admin" && userManagementLink) {
      userManagementLink.style.display = "block";
    }

// SAVE
document.getElementById("addBtn").addEventListener("click", async () => {

  const form = document.getElementById("customerForm");

  const customerId = form.customerIdText.value.trim() || "";
  const firstname = form.firstName.value.trim();
  const lastname = form.lastName.value.trim();
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


  try {
    //Only check for duplicate name if we are creating a NEW customer
    if (!customerId) {
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
    }

    const customerData = {
      customerId: customerId,
      firstName: firstname,
      lastName: lastname,
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

    alert(`Customer ${result.customerId} saved successfully!`)

    form.classBalance.value = 0;
    clearCustomerForm();
    initCustomerDropdown();

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
