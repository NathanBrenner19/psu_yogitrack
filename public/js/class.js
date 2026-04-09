document.addEventListener("DOMContentLoaded", () => {
    initClassDropdown();
    addClassDropdownListener();
});

//Checks user role for user management tab
const role = localStorage.getItem("role");
    const userManagementLink = document.getElementById("userManagementLink");

    if (role === "admin" && userManagementLink) {
      userManagementLink.style.display = "block";
    }

//Deleting a class
document.getElementById("deleteBtn").addEventListener("click", async () =>{
    var select = document.getElementById("classIdSelect");
    var classId = select.value.split(":")[0];

    const response = await fetch(
        `/api/class/deleteClass?classId=${classId}`, {
          method: "DELETE"
        });
    
      if (!response.ok) {
        throw new Error("Class delete failed");
      } else {
        alert(`Class with id ${classId} successfully deleted`);
      }

      //Refresh the dropdowns and form
      initClassDropdown();
      clearClassForm();
      
});

//Adding a new class and or adding a new time
document.getElementById("addBtn").addEventListener("click", async () => {

    const form = document.getElementById("classForm");

    const classData = {
        classId: form.classIdText.value.trim() || "",
        className: form.className.value.trim(),
        instructorId: form.instructorId.value.trim(),
        classType: form.classType.value.trim(),
        description: form.description.value.trim(),
        daytime: [
            {
                _id: form.timeIdText.value.trim() || undefined,
                day: form.day.value.trim(),
                time: form.time.value.trim(),
                duration: parseInt(form.duration.value, 10)
            }
        ]
    };

    try {
        const res = await fetch("/api/class/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(classData),
        });

        const result = await res.json();

        if (!res.ok)
            throw new Error(result.message || "Failed to save class");

        alert(`Class ${result.classId} saved successfully!`);
        form.reset();

    } catch (err) {
        alert("Error: " + err.message);
    }

    //Refresh the dropdowns and form
    clearClassForm();
    initClassDropdown();
});


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
    const form = document.getElementById("classForm");
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
            form.className.value = data.className || "";
            form.instructorId.value = data.instructorId || "";
            form.classType.value = data.classType || "";
            form.description.value = data.description || "";
            

            populateDateTimeDropdown(data.daytime);
            

        }
        catch (err) {
            alert(`Error searching for class: ${classId} - ${err.message}`);
        }

    });

}

//Adds date and times to dropdown
function populateDateTimeDropdown(daytimeArray) {
    const select = document.getElementById("classTimeSelect");
    

    daytimeArray.forEach(item => {
        const option = document.createElement("option");

        option.value = JSON.stringify(item);
        option.textContent = `${item.day} at ${item.time} (${item.duration} mins)`;

        select.appendChild(option);
    });
}

//Adds data into input fields for date and time
document.getElementById("classTimeSelect")
.addEventListener("change", function () {

    const selectedItem = JSON.parse(this.value);

    const form = document.getElementById("classForm");

    form.timeIdText.value = selectedItem._id || undefined;
    form.day.value = selectedItem.day || "";
    form.time.value = selectedItem.time || "";
    form.duration.value = selectedItem.duration || "";
});

function clearClassForm(){
    document.getElementById("classForm").reset();
    document.getElementById("classIdSelect").innerHTML = `<option value="">-- Select Class ID --</option>`;
    document.getElementById("classTimeSelect").innerHTML = `<option value="">-- Select WeekDay --</option>`;
}