let UserData = {};
function validateAndRedirect() {
  const personalInfo = localStorage.getItem("personalInfo");

  if (!personalInfo) {
    // Get the current page path
    const currentPath = window.location.pathname;
    const currentDir = currentPath.substring(0, currentPath.lastIndexOf("/"));

    window.location.href = `${currentDir}/conf/`;
  } else {
    UserData = JSON.parse(personalInfo);
  }
}

validateAndRedirect();
