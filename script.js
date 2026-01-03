const checkboxes = document.querySelectorAll("input[type='checkbox']");

checkboxes.forEach((checkbox, index) => {
  const saved = localStorage.getItem("cb-" + index);
  checkbox.checked = saved === "true";

  checkbox.addEventListener("change", () => {
    localStorage.setItem("cb-" + index, checkbox.checked);
  });
});
