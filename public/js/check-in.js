document.addEventListener("DOMContentLoaded", () => {
    applyPermissions();
    initCustomerDropdown();
    addCustomerDropdownListener();
    initClassDropdown();
    addClassDropdownListener();
  });

  function applyPermissions() {
    const role = localStorage.getItem("role");
  
    if (role !== "admin") {
      // Find everything marked 'admin-only' and remove it from the DOM
      const adminElements = document.querySelectorAll(".admin-only");
      adminElements.forEach(el => el.remove());
    }
  }


//Checking in a customer
document.getElementById("addBtn").addEventListener("click", async (e) => {
  e.preventDefault();
  const form = document.getElementById("checkInForm");

  const checkInData = {
    customerId: form.customerIdText.value.trim(),
    classId: form.classIdText.value.trim(),
    datetime: document.getElementById("checkInDate").value.trim()
  }

  try {
    const res = await fetch("/api/check-in/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(checkInData),
    });

    const result = await res.json();

    if (!res.ok) throw new Error(result.message || "Failed to check in customer");

    // Call the Update function to deduct a class
    var customerId = document.getElementById("customerIdText").value;
    const updateRes = await fetch(`/api/customer/update?customerId=${customerId}`, {
      method: "PUT",
    });

    const updateResult = await updateRes.json();

    if (!updateRes.ok) throw new Error(updateResult.error || "Failed to update balance");

    // Success Alerts
    alert(`Customer ${result.customerId} checked into class ${result.classId} successfully!`);

    // Check if the controller sent back the "needs to buy more" warning
    if (updateResult.message.includes("buy more classes")) {
      alert(`ALERT: ${updateResult.message} (Remaining: ${updateResult.currentBalance})`);
    } else {
      alert(`Class deducted. New balance: ${updateResult.currentBalance}`);
    }

    form.reset();

  }
  catch(err){
    alert("Error: " + err.message);
  }

});

  // Load customer dropdown
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

// Dropdown listener for customer
function addCustomerDropdownListener() {
    const form = document.getElementById("checkInForm");
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
        
        form.customerIdText.value = data.customerId;
        form.classBalance.value = data.classBalance ?? 0;
  
  
      } catch (err) {
        alert(`Error searching customer: ${customerId} - ${err.message}`);
      }
    });
  }

  async function initClassDropdown() {
    const select = document.getElementById("classIdSelect");
    if (!select) return;
    try {
        const response = await fetch('/api/class/getClassIds');
        const classIds = await response.json();

        classIds.forEach((classId) => {
            const option = document.createElement("option");
            option.value = classId.classId;
            option.textContent = `${classId.classId}:${classId.className}`;
            select.appendChild(option);
          });

    }
    catch (err){
        console.error("Failed to load class IDs: ", err);
    }
}

//Adds classes to dropdown
async function addClassDropdownListener() {
    const form = document.getElementById("checkInForm");
    const select = document.getElementById("classIdSelect");
    select.addEventListener("change", async () => {
        var classId = select.value.split(":")[0];
        
        
        try{
            const res = await fetch(`/api/class/getClass?classId=${classId}`);
            if (!res.ok) throw new Error("Class search failed");

            const data = await res.json();
            
            if(!data || Object.keys(data).length === 0) {
                alert("No class found");
                return;
            }

            //Fill in input fields with class data
            form.classIdText.value = data.classId || "";
            

        }
        catch (err) {
            alert(`Error searching for class: ${classId} - ${err.message}`);
        }

    });

}