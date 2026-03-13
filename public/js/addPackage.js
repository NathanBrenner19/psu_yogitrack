document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("packageForm");
  if (!form) return;


  //Getting input form package form
  const typeRadios = Array.from(
    form.querySelectorAll('input[name="packageType"]')
  );
  const packageNameInput = form.querySelector('input[name="packageName"]');
  const descriptionInput = form.querySelector('textarea[name="description"]');
  const priceInput = form.querySelector('input[name="price"]');
  const packageIdInput = form.querySelector('input[name="packageId"]');
  const errorBox =
    document.getElementById("formError") ||
    form.querySelector(".form-error");

  //show any errors
  function setError(message) {
    if (errorBox) {
      errorBox.textContent = message;
    } else if (message) {
      alert(message);
    }
  }

  //clear any errors
  function clearError() {
    if (errorBox) {
      errorBox.textContent = "";
    }
  }

  //Find the place holder from the radio button
  function updatePlaceholderId() {
    if (!packageIdInput) return;

    const selected = typeRadios.find((radio) => radio.checked);
    if (!selected) {
      packageIdInput.value = "";
      packageIdInput.placeholder = "";
      return;
    }

    const prefix = selected.value === "special" ? "S" : "P";
    packageIdInput.value = "";
    packageIdInput.placeholder = `${prefix}???`;
  }

  function applyTypeFromQuery() {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type");
    if (!type) return;

    const radio = typeRadios.find((r) => r.value === type);
    if (radio) {
      radio.checked = true;
      updatePlaceholderId();
    }
  }

  typeRadios.forEach((radio) => {
    radio.addEventListener("change", updatePlaceholderId);
  });

  applyTypeFromQuery();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearError();

    const selectedTypeRadio = typeRadios.find((radio) => radio.checked);
    if (!selectedTypeRadio) {
      setError("Please select a package type.");
      return;
    }

    const packageType = selectedTypeRadio.value;
    const packageName = packageNameInput
      ? packageNameInput.value.trim()
      : "";
    const description = descriptionInput
      ? descriptionInput.value.trim()
      : "";
    const priceValue = priceInput ? priceInput.value : "";
    const price = priceValue === "" ? NaN : Number(priceValue);

    if (!packageName || !description || Number.isNaN(price)) {
      setError("Please fill in all fields with valid values.");
      return;
    }

    try {
      const response = await fetch("/api/package/createPackage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          packageType,
          packageName,
          description,
          price,
        }),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        const message =
          text || `Failed to create package. Status: ${response.status}`;
        setError(message);
        return;
      }

      const data = await response.json().catch(() => null);
      if (data && data.packageId && packageIdInput) {
        packageIdInput.value = data.packageId;
      }

      if (window.opener && !window.opener.closed) {
        try {
          window.opener.location.reload();
        } catch (e) {
          // ignore cross-origin issues
        }
      }

      window.close();
    } catch (err) {
      console.error("Error creating package:", err);
      setError("Could not save package. Please try again.");
    }
  });
});

