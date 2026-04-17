// Fetch all instructor IDs and populate the dropdown
document.addEventListener("DOMContentLoaded", () => {
  applyPermissions();
  initInstructorDropdown();
  addInstructorDropdownListener();

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
//SAVE
document.getElementById("saveBtn").addEventListener("click", async () => {

  const form = document.getElementById("instructorForm");

  const instructorData = {
    instructorId: form.instructorIdText.value.trim() || "",
    firstname: form.firstname.value.trim(),
    lastname: form.lastname.value.trim(),
    address: form.address.value.trim(),
    phone: form.phone.value.trim(),
    email: form.email.value.trim(),
    preferredContact: form.pref[0].checked ? "phone" : "email",
  };

  try {
    const res = await fetch("/api/instructor/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(instructorData),
    });

    const result = await res.json();
    if (!res.ok)
      throw new Error(result.message || "Failed to add instructor");

    alert(`Instructor ${result.instructorId} saved successfully!`);
    clearInstructorForm();
    initInstructorDropdown();

  } catch (err) {
    alert("Error: " + err.message);
  }
  
});

//DELETE
document.getElementById("deleteBtn").addEventListener("click", async () => {
  var select = document.getElementById("instructorIdSelect");
  var instructorId = select.value.split(":")[0];

  const response = await fetch(
    `/api/instructor/deleteInstructor?instructorId=${instructorId}`, {
      method: "DELETE"
    });

  if (!response.ok) {
    throw new Error("Instructor delete failed");
  } else {
    alert(`Instructor with id ${instructorId} successfully deleted`);
    clearInstructorForm();
    initInstructorDropdown();
    
  }
});

async function initInstructorDropdown() {
  const select = document.getElementById("instructorIdSelect");
  try {
    const response = await fetch("/api/instructor/getInstructorIds");
    const instructorIds = await response.json();

    instructorIds.forEach((instr) => {
      const option = document.createElement("option");
      option.value = instr.instructorId;
      option.textContent = `${instr.instructorId}:${instr.firstname} ${instr.lastname}`;
      select.appendChild(option);
    });
  } catch (err) {
    console.err("Failed to load instructor IDs: ", err);
  }
}

async function addInstructorDropdownListener() {
  const form = document.getElementById("instructorForm");
  const select = document.getElementById("instructorIdSelect");
  select.addEventListener("change", async () => {
    var instructorId = select.value.split(":")[0];
    
    try {
      const res = await fetch(
        `/api/instructor/getInstructor?instructorId=${instructorId}`
      );
      if (!res.ok) throw new Error("Instructor search failed");

      const data = await res.json();
      
      if (!data || Object.keys(data).length === 0) {
        alert("No instructor found");
        return;
      }

      //Fill form with data
      form.instructorIdText.value = data.instructorId || "";
      form.firstname.value = data.firstname || "";
      form.lastname.value = data.lastname || "";
      form.address.value = data.address || "";
      form.phone.value = data.phone || "";
      form.email.value = data.email || "";

      if (data.preferredContact === "phone") {
        form.pref[0].checked = true;
      } else form.pref[1].checked = true;
    } catch (err) {
      alert(`Error searching instructor: ${instructorId} - ${err.message}`);
    }
  });
}

function clearInstructorForm() {
  document.getElementById("instructorForm").reset(); // Clears all inputs including text, textarea, and unchecks radio buttons
  document.getElementById("instructorIdSelect").innerHTML = "";
}
