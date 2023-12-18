document
  .getElementById("noLoginShowDeletedButton")
  .addEventListener("click", function () {
    alert("Only logged in users may see deleted responses");
    window.location.href = "/user/login";
  });
