function getData() {
  let nameField = document.getElementById("nameInput").value;
  let emailField = document.getElementById("emailInput").value;
  let phoneField = document.getElementById("phoneInput").value;
  let subjectField = document.getElementById("subject").value;
  let messageField = document.getElementById("message").value;

  console.log(nameField);
  console.log(emailField);
  console.log(phoneField);
  console.log(subjectField);
  console.log(messageField);

  document.getElementById("nameInput").value = "";
  document.getElementById("emailInput").value = "";
  document.getElementById("phoneInput").value = "";
  document.getElementById("subject").value = "";
  document.getElementById("message").value = "";
}
